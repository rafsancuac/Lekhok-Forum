// ── Newsletter mailer ────────────────────────────────────────────────────────
// When an admin/moderator publishes content (article / notice), every active
// newsletter subscriber gets an email notification automatically.
//
// Delivery pipeline (serverless-safe — everything is awaited, never fire-
// and-forget, so Vercel cannot freeze the function mid-send):
//   1. A newsletter_log row is created (one per published post).
//   2. One newsletter_queue row per subscriber (status 'pending').
//   3. If RESEND_API_KEY is configured, all emails are delivered in ONE
//      batched HTTP call (Resend batch endpoint, 100 per chunk) and the
//      queue rows are marked sent/failed.
//   4. Without an API key the queue rows stay 'pending' — the admin panel
//      (নিউজলেটার page) shows them and can retry once a key is configured.
//
// Env vars (Vercel → Settings → Environment Variables):
//   RESEND_API_KEY   — API key from resend.com (optional; enables sending)
//   NEWSLETTER_FROM  — verified sender, e.g. "Lekhok Forum <news@lekhokforum.org>"
//   SITE_URL         — public base URL for article/unsubscribe links

const db = require('../db');

const SITE_URL = (process.env.SITE_URL || 'https://lekhok-forum.vercel.app').replace(/\/$/, '');
const FROM = process.env.NEWSLETTER_FROM || 'লেখক ফোরাম <onboarding@resend.dev>';

function isConfigured() { return !!process.env.RESEND_API_KEY; }

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Plain-text excerpt for the email body
function makeExcerpt(text, len) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  return t.length > len ? t.slice(0, len) + '…' : t;
}

// ── Bengali email template ───────────────────────────────────────────────────
function buildHtml({ kind, title, excerpt, authorName, link }) {
  const kindLabel = kind === 'notice' ? 'নতুন বিজ্ঞপ্তি প্রকাশিত হয়েছে' : 'নতুন লেখা প্রকাশিত হয়েছে';
  const kindIcon  = kind === 'notice' ? '📢' : '✍️';
  return `<!DOCTYPE html>
<html lang="bn"><body style="margin:0;padding:0;background:#f4f6f8;font-family:'Noto Sans Bengali','Hind Siliguri',Arial,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:24px 16px;">
  <div style="background:#0a1f44;border-radius:12px 12px 0 0;padding:22px 28px;text-align:center;">
    <div style="color:#ffffff;font-size:17px;font-weight:bold;">লেখক ফোরাম</div>
    <div style="color:#9fe1cb;font-size:12.5px;margin-top:4px;">চট্টগ্রাম বিশ্ববিদ্যালয়</div>
  </div>
  <div style="background:#ffffff;border-radius:0 0 12px 12px;padding:28px;">
    <p style="margin:0 0 6px;color:#0f6e56;font-size:13px;font-weight:bold;">${kindIcon} ${kindLabel}</p>
    <h2 style="margin:0 0 10px;color:#1a2233;font-size:20px;line-height:1.45;">${escapeHtml(title)}</h2>
    ${authorName ? `<p style="margin:0 0 14px;color:#6b7280;font-size:13.5px;">লেখক: <strong>${escapeHtml(authorName)}</strong></p>` : ''}
    ${excerpt ? `<p style="margin:0 0 20px;color:#374151;font-size:14.5px;line-height:1.85;">${escapeHtml(excerpt)}</p>` : ''}
    <a href="${link}" style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;padding:11px 26px;border-radius:8px;font-size:14.5px;font-weight:bold;">সম্পূর্ণ পড়ুন</a>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0 16px;" />
    <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.7;">
      আপনি আমাদের ওয়েবসাইট থেকে সাবস্ক্রাইব করায় এই ইমেইলটি পেয়েছেন।<br/>
      নোটিফিকেশন বন্ধ করতে চাইলে <a href="${SITE_URL}/newsletter/unsubscribe" style="color:#059669;">এখানে সাবস্ক্রাইব বাতিল করুন</a>।
    </p>
  </div>
  <p style="text-align:center;color:#9ca3af;font-size:11.5px;margin:14px 0 0;">তারুণ্যের শাণিত কলমে আলোকিত ধরনী — © ${new Date().getFullYear()} লেখক ফোরাম, চট্টগ্রাম বিশ্ববিদ্যালয়</p>
</div>
</body></html>`;
}

// ── Resend batch delivery ────────────────────────────────────────────────────
// POST https://api.resend.com/emails/batch — array of messages, max 100 per call.
async function resendBatch(messages) {
  const key = process.env.RESEND_API_KEY;
  let sent = 0, failed = 0, lastError = null;
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    try {
      const resp = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
        body: JSON.stringify(chunk)
      });
      if (resp.ok) { sent += chunk.length; }
      else {
        failed += chunk.length;
        lastError = 'Resend HTTP ' + resp.status + ': ' + (await resp.text()).slice(0, 200);
      }
    } catch (e) {
      failed += chunk.length;
      lastError = e.message;
    }
  }
  return { sent, failed, error: lastError };
}

// ── Main entry: notify all active subscribers about new content ─────────────
// kind: 'article' | 'notice' — refId: posts.id / notices.id
async function notifySubscribers({ kind = 'article', refId = null, title, body = '', authorName = '' }) {
  const subs = await db.prepare('SELECT email FROM newsletter_subscribers WHERE is_active = 1').all();
  if (!subs.length) return { queued: 0, sent: 0, failed: 0, configured: isConfigured() };

  const link  = kind === 'notice' ? SITE_URL + '/notices' : SITE_URL + '/articles/' + refId;
  const subject = (kind === 'notice' ? '📢 নতুন বিজ্ঞপ্তি: ' : '✍️ নতুন লেখা: ') + title;
  const html  = buildHtml({ kind, title, excerpt: makeExcerpt(body, 220), authorName, link });

  // 1) Log row — one per published post
  const logR = await db.prepare(
    'INSERT INTO newsletter_log (kind, ref_id, title, author_name, subscriber_count) VALUES (?, ?, ?, ?, ?)'
  ).run(kind, refId, title, authorName, subs.length);
  const logId = logR && logR.lastInsertRowid;

  // 2) Queue rows (durable record of who should receive what)
  for (const s of subs) {
    await db.prepare(
      'INSERT INTO newsletter_queue (log_id, post_id, to_email, subject, body) VALUES (?, ?, ?, ?, ?)'
    ).run(logId, refId, s.email, subject, html);
  }

  // 3) Attempt delivery when a provider key is configured
  let sent = 0, failed = 0, error = null;
  if (isConfigured()) {
    const messages = subs.map(s => ({ from: FROM, to: [s.email], subject, html }));
    const r = await resendBatch(messages);
    sent = r.sent; failed = r.failed; error = r.error;
    if (sent > 0) {
      await db.prepare(
        "UPDATE newsletter_queue SET status='sent', sent_at=datetime('now') WHERE log_id = ? AND status='pending'"
      ).run(logId);
    }
    if (failed > 0) {
      await db.prepare(
        "UPDATE newsletter_queue SET status='failed', error=? WHERE log_id = ? AND status='pending'"
      ).run(error || 'delivery failed', logId);
    }
  }

  await db.prepare('UPDATE newsletter_log SET sent_count = ?, failed_count = ? WHERE id = ?')
    .run(sent, failed, logId);

  return { queued: subs.length, sent, failed, configured: isConfigured(), logId };
}

// ── Retry pending/failed queue rows for a log entry (admin panel button) ────
async function retryLog(logId) {
  if (!isConfigured()) return { ok: false, error: 'ইমেইল সার্ভিস কনফিগার করা হয়নি (RESEND_API_KEY)' };
  const rows = await db.prepare("SELECT * FROM newsletter_queue WHERE log_id = ? AND status != 'sent'").all(logId);
  if (!rows.length) return { ok: true, sent: 0, failed: 0 };
  const messages = rows.map(r => ({ from: FROM, to: [r.to_email], subject: r.subject, html: r.body }));
  const r = await resendBatch(messages);
  if (r.sent > 0) {
    await db.prepare("UPDATE newsletter_queue SET status='sent', sent_at=datetime('now'), error=NULL WHERE log_id = ? AND status != 'sent'").run(logId);
  }
  if (r.failed > 0) {
    await db.prepare("UPDATE newsletter_queue SET status='failed', error=? WHERE log_id = ? AND status != 'sent'").run(r.error || 'delivery failed', logId);
  }
  await db.prepare('UPDATE newsletter_log SET sent_count = sent_count + ?, failed_count = ? WHERE id = ?')
    .run(r.sent, r.failed, logId);
  return { ok: true, sent: r.sent, failed: r.failed, error: r.error };
}

module.exports = { notifySubscribers, retryLog, isConfigured, makeExcerpt };
