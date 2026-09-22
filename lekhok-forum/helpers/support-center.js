// ══════════════════════════════════════════════════════════════════════════════
// helpers/support-center.js — সাপোর্ট-সেন্টার (lekhok-forum-next থেকে Express-পোর্ট)
// ══════════════════════════════════════════════════════════════════════════════
// মডেল (Next session201–222 → এক্সপ্রেস নেটিভ):
//   • সুপার-অ্যাডমিন একজন "নিয়োজিত সাপোর্ট-অ্যাডমিন" নির্ধারণ করেন (settings key)
//   • ইউজার সাপোর্ট-অ্যাডমিনকে মেসেঞ্জারে লিখলে প্রতিটি বার্তা user_reports-এ
//     মিরর হয় (ভয়েস → AUDIO) — রিভিউ-ডেস্কে স্ট্যাটাস/জবাব/হিস্ট্রি ম্যানেজ হয়
//   • জবাব/স্ট্যাটাস বদলালে রিপোর্টার নোটিফিকেশন পান + user-side "আমার অভিযোগ"
//     প্যানেলে দেখতে পান
// নোট: এখানে সব ফাংশন never-throws — সাপোর্ট-সেন্টার ব্যর্থ হলে মেসেঞ্জারের
// প্রাইমারি-ফ্লো কখনো ভাঙবে না (Next-এর mirror-silent-failure চুক্তি)।
'use strict';

const db = require('../db');

const SUPPORT_ADMIN_KEY = 'SUPPORT_ADMIN_ID';

// ── নিয়োজিত সাপোর্ট-অ্যাডমিন ──────────────────────────────────────────────────

async function getSupportAdminId() {
  try {
    const v = await db.getSetting(SUPPORT_ADMIN_KEY);
    return (v && String(v).trim()) ? String(v).trim() : null;
  } catch (_) { return null; }
}

// লাইট-প্রোফাইল সহ রিটার্ন; অ্যাকাউন্ট নিষ্ক্রিয়/রোল-ডাউনগ্রেড হলে null (সেফ-ডিগ্রেড)
async function getSupportAdmin() {
  try {
    const id = await getSupportAdminId();
    if (!id) return null;
    const row = await db.prepare('SELECT id, full_name, username, avatar_url, role, status FROM users WHERE id = ?').get(id);
    if (!row || row.status !== 'active') return null;
    if (row.role !== 'admin' && row.role !== 'superadmin') return null;
    return row;
  } catch (_) { return null; }
}

// নিয়োগ — টার্গেট অবশ্যই সক্রিয় admin/superadmin (Next-চুক্তি)
async function setSupportAdmin(userId) {
  const row = await db.prepare('SELECT id, role, status FROM users WHERE id = ?').get(userId);
  if (!row || row.status !== 'active' || (row.role !== 'admin' && row.role !== 'superadmin')) {
    return false;
  }
  await db.setSetting(SUPPORT_ADMIN_KEY, String(userId));
  return true;
}

async function clearSupportAdmin() {
  await db.setSetting(SUPPORT_ADMIN_KEY, '');
}

async function isSupportAdmin(userId) {
  if (!userId) return false;
  const id = await getSupportAdminId();
  return !!(id && String(userId) === String(id));
}

// ── স্ট্যাটাস-ওয়ার্কফ্লো ──────────────────────────────────────────────────────

const STATUSES = ['PENDING', 'IN_PROGRESS', 'RESOLVED'];
const STATUS_LABEL = { PENDING: 'নতুন', IN_PROGRESS: 'চলমান', RESOLVED: 'সমাধান হয়েছে' };
const MEDIA_TYPES = ['TEXT', 'IMAGE', 'AUDIO', 'VIDEO'];

function bnNum(n) {
  const digits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(n == null ? '' : n).replace(/[0-9]/g, d => digits[+d]);
}

// note_history JSON — নিরাপদ পার্স (করাপ্ট হলে খালি অ্যারে — Next-চুক্তি), ক্যাপ ৫০
function parseHistory(json) {
  try {
    const arr = JSON.parse(json || '[]');
    if (!Array.isArray(arr)) return [];
    return arr.filter(e => e && (e.t === 'status' || e.t === 'note')).slice(-50);
  } catch (_) { return []; }
}

// এন্ট্রি-অ্যাপেন্ড + ৫০-ক্যাপ (পুরোনোগুলো স্লাইস-অফ)
function appendHistory(existing, entries) {
  const arr = parseHistory(existing);
  for (const e of (Array.isArray(entries) ? entries : [entries])) arr.push(e);
  return JSON.stringify(arr.slice(-50));
}

// adminNote = সর্বশেষ t:'note' এন্ট্রির নোট (নোট-মুছে গেলে re-sync)
function lastNoteOf(historyJson) {
  const arr = parseHistory(historyJson);
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i].t === 'note') return arr[i].note || null;
  }
  return null;
}

// ── SLA-এজিং (support-history.ts পোর্ট) ─────────────────────────────────────
// fresh <২৪ঘ · aging ১–২দিন · stale ≥৩দিন — শুধু অ-সমাধান রিপোর্টে অর্থবহ
// created_at পার্স-এক-উৎস (session226 — agingInfo + trend7 একই-রীতি: naive → UTC 'Z'-যোগ)
function createdAtMs(v) {
  const s = String(v || '');
  const t = new Date(s.replace(' ', 'T') + (s.includes('Z') ? '' : 'Z')).getTime();
  return isNaN(t) ? null : t;
}

function agingInfo(createdAt, status) {
  if (status === 'RESOLVED') return { cls: 'sc-heat-resolved', label: 'সমাধান', days: 0 };
  const t = createdAtMs(createdAt);
  if (t === null) return { cls: 'sc-heat-fresh', label: '', days: 0 };
  const days = Math.floor((Date.now() - t) / 86400000);
  if (days >= 3) return { cls: 'sc-heat-stale', label: bnNum(days) + ' দিন ধরে অমীমাংসিত', days };
  if (days >= 1) return { cls: 'sc-heat-aging', label: bnNum(days) + ' দিন আগের অভিযোগ', days };
  return { cls: 'sc-heat-fresh', label: '', days };
}

function staleCount(rows) {
  return (rows || []).filter(r => r && r.status !== 'RESOLVED' && agingInfo(r.created_at, r.status).days >= 3).length;
}

// CSV-এর "ইতিহাস" কলামের কমপ্যাক্ট বাংলা সারাংশ
function historySummaryBn(historyJson) {
  const arr = parseHistory(historyJson);
  if (!arr.length) return '';
  return arr.map(e => {
    const at = String(e.at || '').replace('T', ' ').slice(0, 16);
    if (e.t === 'status') return `[স্ট্যাটাস] ${STATUS_LABEL[e.from] || e.from || '—'} → ${STATUS_LABEL[e.to] || e.to || '—'} (${at})`;
    let s = `[জবাব] ${String(e.note || '').replace(/\s+/g, ' ').trim()}`;
    if (e.editedAt) s += ' (সম্পাদিত)';
    return s + ` (${at})`;
  }).join(' | ');
}

// note_history → সর্বশেষ status→RESOLVED-টাইমস্ট্যাম্প (ms) বা null (trend7-এর-জন্য)
function resolvedAtMs(historyJson) {
  const arr = parseHistory(historyJson);
  let last = null;
  for (const e of arr) {
    if (e.t === 'status' && e.to === 'RESOLVED' && e.at) {
      const t = new Date(e.at).getTime();
      if (!isNaN(t)) last = (last === null) ? t : Math.max(last, t);
    }
  }
  return last;
}

// ── ৭-দিনের প্রবণতা (session226 — Next session224 trend7-পোর্ট; পিওর-ফাংশন, never-throws) ──
// সাত-দৈর্ঘ্যের সিরিজ; index 0 = ৬-দিন-আগে … 6 = আজ; দিন-সীমা = স্থানীয়-মাঝরাত; now-ইনজেকশন = ডিটারমিনিস্টিক-টেস্ট
//   newPerDay      — ওই-দিনে-তৈরি (যে-কোনো-বর্তমান-স্ট্যাটাস)
//   resolvedPerDay — ওই-দিনে-সমাধান (note_history-র সর্বশেষ RESOLVED)
//   stalePerDay    — আজ (6) = staleCount(rows)-সমস্বর (কার্ড-মান-স্পর্শক-গ্যারান্টি);
//                    পুরাতন-দিন (0..5) = প্রত্ন: দিন-শুরুতে খোলা ও বয়স ≥৭২ঘ (সমাধান-হওয়া = resolve-দিন-পর্যন্ত)
//   avgPerDay      — ওই-দিনে-সমাধান-হওয়ার-গড়-সময় (ঘণ্টা ×১০-রাউন্ড); কেউ-নেই → null
//   dayLabels      — bn-BD সংক্ষিপ্ত ("২২ সে") — EJS কখনো-নিজে-তারিখ-গণনা-করবে-না
function trend7(rows, now) {
  try {
    const NOW = Number(now) || Date.now();
    const DAY = 86400000, HOUR = 3600000;
    const t0d = new Date(NOW); t0d.setHours(0, 0, 0, 0);
    const t0 = t0d.getTime();
    const newPerDay = [0, 0, 0, 0, 0, 0, 0];
    const resolvedPerDay = [0, 0, 0, 0, 0, 0, 0];
    const stalePerDay = [0, 0, 0, 0, 0, 0, 0];
    const durSum = [0, 0, 0, 0, 0, 0, 0];
    const durCnt = [0, 0, 0, 0, 0, 0, 0];
    const bucketOf = (ts) => {
      const i = Math.floor((ts - (t0 - 6 * DAY)) / DAY);
      return (i >= 0 && i <= 6 && ts >= t0 - 6 * DAY) ? i : -1;
    };
    for (const r of (rows || [])) {
      if (!r) continue;
      const created = createdAtMs(r.created_at);
      if (created === null) continue;
      const rat = resolvedAtMs(r.note_history);
      const bi = bucketOf(created);
      if (bi >= 0) newPerDay[bi]++;
      if (rat !== null) {
        const ri = bucketOf(rat);
        if (ri >= 0) {
          resolvedPerDay[ri]++;
          const durH = (rat - created) / HOUR;
          if (durH >= 0) { durSum[ri] += durH; durCnt[ri]++; }
        }
      }
      // প্রত্ন-স্টেল (index 0..5): দিন-D-শুরুতে খোলা ও বয়স ≥৭২ঘ (আজ = staleCount সরাসরি — সমস্বর-গ্যারান্টি)
      for (let i = 0; i < 6; i++) {
        const dS = t0 - (6 - i) * DAY;
        if (created <= dS - 3 * DAY) {
          const openOnD = r.status !== 'RESOLVED' ? true : (rat !== null && rat >= dS);
          if (openOnD) stalePerDay[i]++;
        }
      }
    }
    stalePerDay[6] = staleCount(rows);
    const avgPerDay = durCnt.map((c, i) => (c > 0 ? Math.round((durSum[i] / c) * 10) / 10 : null));
    let dayLabels;
    try {
      dayLabels = Array.from({ length: 7 }, (_, i) =>
        new Date(t0 - (6 - i) * DAY).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' }));
    } catch (_) {
      dayLabels = Array.from({ length: 7 }, (_, i) => bnNum(new Date(t0 - (6 - i) * DAY).getDate()));
    }
    return { newPerDay, resolvedPerDay, stalePerDay, avgPerDay, dayLabels };
  } catch (_) {
    const z = [0, 0, 0, 0, 0, 0, 0];
    return { newPerDay: z.slice(), resolvedPerDay: z.slice(), stalePerDay: z.slice(), avgPerDay: [null, null, null, null, null, null, null], dayLabels: ['', '', '', '', '', '', ''] };
  }
}

module.exports = {
  SUPPORT_ADMIN_KEY, STATUSES, STATUS_LABEL, MEDIA_TYPES,
  getSupportAdminId, getSupportAdmin, setSupportAdmin, clearSupportAdmin, isSupportAdmin,
  parseHistory, appendHistory, lastNoteOf, agingInfo, staleCount, historySummaryBn, bnNum,
  createdAtMs, resolvedAtMs, trend7
};
