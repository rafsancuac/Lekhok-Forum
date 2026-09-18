/* ═══════════════════════════════════════════════════════════════════════════
   rich-sanitize.js — সেশন ১৫৩: FB-কম্পোজার রিচ-কনটেন্ট স্যানিটাইজার
   ──────────────────────────────────────────────────────────────────────────
   contentEditable (document.execCommand)-এর HTML-আউটপুট সার্ভারে সংরক্ষণের আগে
   হোয়াইটলিস্ট-ভিত্তিক পরিষ্কার — XSS-বন্ধ (on*-অ্যাট্রিবিউট / javascript:-URL /
   অ-হোয়াইটলিস্ট-ট্যাগ সম্পূর্ণ বাদ; টেক্সট-কনটেন্ট অক্ষত থাকে)।

   চুক্তি:
   • ট্যাগ: p, br, div, b, strong, i, em, u, s, del, ul, ol, li, h2, h3, h4,
     blockquote, a (href), span
   • অ্যাট্রিবিউট: শুধু a[href] (http(s):// বা /-প্রিফিক্স; rel/target সার্ভার-সেট) এবং
     ব্লক-ট্যাগে style="text-align:left|center|right|justify" (অ্যালাইনমেন্ট-টুলবার)
   • টেবিল/script/style/iframe/img (কম্পোজারে ছবি = কোলাজ-অ্যাটাচমেন্ট, ইনলাইন নয়)
     — সব বাদ; < > এস্কেপ করে টেক্সট হিসেবে রাখা হয় (কনটেন্ট-লস শূন্য)
   • আউটপুট রেন্ডার-বাধ্যতামূলকভাবে RAW (FeedPostCard fb-শাখা) — এই হেল্পারই
     একমাত্র-প্রবেশদ্বার; লেখক-পথে বাইপাস নেই।
   ═══════════════════════════════════════════════════════════════════════════ */
'use strict';

const ALLOWED_TAGS = new Set([
  'p', 'br', 'div', 'b', 'strong', 'i', 'em', 'u', 's', 'del',
  'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'blockquote', 'a', 'span'
]);
const BLOCK_TAGS = new Set(['p', 'div', 'h2', 'h3', 'h4', 'blockquote', 'li']);

// এসকেপ-হেল্পার — সন্দেহভাজন প্রতিটি অক্ষর টেক্সট-নিরাপদ
function escH(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function safeHref(v) {
  const s = String(v || '').trim().replace(/[<>"']/g, '');
  if (/^https?:\/\//i.test(s) || (s.startsWith('/') && !s.startsWith('//'))) return s;
  return null;
}

function safeAlign(v) {
  const m = /text-align\s*:\s*(left|center|right|justify)/i.exec(String(v || ''));
  return m ? ('text-align:' + m[1].toLowerCase()) : null;
}

/* মূল প্রবেশদ্বার: contentEditable-HTML → নিরাপদ-HTML */
function sanitizeRichHtml153(raw) {
  const src = String(raw || '');
  let out = '';
  let i = 0;
  while (i < src.length) {
    const lt = src.indexOf('<', i);
    if (lt === -1) { out += escH(src.slice(i)); break; }
    out += escH(src.slice(i, lt));
    const gt = src.indexOf('>', lt);
    if (gt === -1) { out += escH(src.slice(lt)); break; }
    const tag = src.slice(lt, gt + 1);

    // কমেন্ট/ডিক্লেরেশন/ডিটাগ — সম্পূর্ণ বাদ
    if (/^<!--/.test(tag) || /^<!/.test(tag) || /^<\//.test(tag)) {
      const name = (tag.match(/^<\/\s*([a-zA-Z0-9-]+)/) || [])[1];
      if (name && ALLOWED_TAGS.has(name.toLowerCase())) out += `</${name.toLowerCase()}>`;
      i = gt + 1;
      continue;
    }
    const m = tag.match(/^<\s*([a-zA-Z0-9-]+)([\s\S]*)>?$/);
    const name = m ? m[1].toLowerCase() : '';
    const rest = m ? m[2] : '';
    if (!name || !ALLOWED_TAGS.has(name)) { i = gt + 1; continue; } // অ-হোয়াইটলিস্ট ট্যাগ → বাদ (টেক্সট থাকে)

    if (name === 'br') { out += '<br>'; i = gt + 1; continue; }

    const attrs = [];
    if (name === 'a') {
      const href = (rest.match(/href\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i) || []);
      const url = safeHref(href[2] || href[3] || href[4]);
      if (url) attrs.push(`href="${escH(url)}" target="_blank" rel="noopener nofollow"`);
    }
    if (BLOCK_TAGS.has(name)) {
      const style = (rest.match(/style\s*=\s*("([^"]*)"|'([^']*)')/i) || []);
      const align = safeAlign(style[2] || style[3]);
      if (align) attrs.push(`style="${align}"`);
    }
    out += attrs.length ? `<${name} ${attrs.join(' ')}>` : `<${name}>`;
    i = gt + 1;
  }
  return out;
}

/* প্লেইন-টেক্সট নির্যাস (শিরোনাম-অটো/কাউন্টার/মেনশন/এক্সেরপ্ট) */
function richToPlainText(raw) {
  return String(raw || '')
    .replace(/<(br|\/p|\/div|\/h[2-4]|\/li|\/blockquote)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

module.exports = { sanitizeRichHtml153, richToPlainText153: richToPlainText };
