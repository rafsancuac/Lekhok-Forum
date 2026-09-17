'use strict';

/* ═══════════════════════════════════════════════════════════════════════════
   সেশন ৮০: মার্কডাউন-লাইট v2 — শেয়ার্ড সার্ভার-রেন্ডারার
   ─────────────────────────────────────────────────────────────────────────
   ব্যবহার: article-single (routes/social.js) + qa-single প্রশ্ন/উত্তর —
   একই ফরম্যাট, ক্লায়েন্ট-প্রিভিউ (rich-editor.js) এর মিরর।

   নীতি (stored-XSS-নিরাপদ):
   ১. এস্কেপ-ফার্স্ট — প্রতিটি লাইন আগে escH() হয়, তারপর ট্রান্সফর্ম;
       ইউজার-লেখা <img onerror=…> কখনো র-HTML হতে পারে না।
   ২. href-শ্বেততালিকা — লিংক-সিনট্যাক্সের URL অবশ্যই https?:// বা /
       দিয়ে শুরু হবে (javascript:/data: রেগেক্সেই বাতিল)।
   ৩. আউটপুট-ক্লাস — শুধু <strong>/<em>/<del>/<a>/<h2>/<h3>/<ul>/<ol>/<li>/
       <blockquote>/<hr> — কোনো ইউজার-অ্যাট্রিবিউট নেই।

   ফরম্যাট (লাইন-স্তর):
     ## শিরোনাম / ### উপশিরোনাম   → h2/h3 (+ TOC: ৩+ হলে ভিউতে)
     - আইটেম / * আইটেম            → ul>li
     ১. / 1. আইটেম                 → ol>li
     > উদ্ধৃতি                     → blockquote
     --- (একা লাইনে)               → hr
   ফরম্যাট (ইনলাইন):
     **বোল্ড**  _ইটালিক_  ~~কাটা~~
     [টেক্সট](https://…)            → নতুন-ট্যাব লিংক
     @ইউজার / #ট্যাগ               → প্রোফাইল/ট্যাগ-লিংক
   সামঞ্জস্য: আগের (সেশন ৬৫) আউটপুটের সাথে হুবহু-সমান প্লেইন-লাইন আচরণ —
   পরপর সাধারণ লাইন <br> দিয়ে জুড়ে যায় (কবিতার চরণের মতোই)।
   ═══════════════════════════════════════════════════════════════════════ */

const escH = (s) => String(s || '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ইনলাইন-ট্রান্সফর্ম — ইনপুট অবশ্যই আগে-এস্কেপড স্ট্রিং হবে।
   লিংক-রেজেক্স URL-কে (https?://… | /…)-এ সীমাবদ্ধ রাখে + [^\s)"] ক্লাস —
   এস্কেপড টেক্সটে র-কোট/অ্যাঙ্গেল থাকতেই পারে না, তবু ডাবল-গার্ড। */
function inlineMd(s) {
  return s
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    .replace(/\[([^\]]+)\]\(\s*((?:https?:\/\/|\/)[^\s)"]+)\s*\)/g,
      '<a href="$2" class="a-link" target="_blank" rel="noopener nofollow">$1</a>')
    .replace(/@([a-zA-Z0-9_]+)/g, '<a class="mention" href="/profile/$1">@$1</a>')
    .replace(/#([\u0980-\u09FFa-zA-Z0-9_]+)/g, '<a class="tag" href="/articles?tag=$1">#$1</a>');
}

/* মূল রেন্ডারার — { html, toc } দেয়।
   opts.toc === false হলে হেডিং-আইডি/toc-সংগ্রহ বাদ (qa-উত্তরের মতো ছোট বডি)। */
function renderBody(raw, opts) {
  const wantToc = !(opts && opts.toc === false);
  const toc = [];
  const lines = String(raw || '').replace(/\r\n/g, '\n').split('\n');
  const out = [];

  let para = [];      // পরপর সাধারণ লাইন — শেষে <br> দিয়ে জোড়া
  let listMode = null; // 'ul' | 'ol'
  let quoteBuf = null; // সক্রিয় হলে অ্যারে

  const flushPara = () => {
    if (para.length) {
      out.push(para.map((l) => inlineMd(escH(l))).join('<br>'));
      para = [];
    }
  };
  const closeList = () => {
    if (listMode) { out.push('</' + listMode + '>'); listMode = null; }
  };
  const closeQuote = () => {
    if (quoteBuf) { out.push(quoteBuf.join('<br>') + '</blockquote>'); quoteBuf = null; }
  };
  const closeAll = () => { flushPara(); closeList(); closeQuote(); };

  for (const line of lines) {
    /* ── hr: --- / *** / ___ (একা লাইন) ── */
    if (/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      closeAll(); out.push('<hr class="a-hr">'); continue;
    }
    /* ── হেডিং: ## / ### (সেশন ৬৫-সমতো, TOC-আইডি অক্ষত) ── */
    let m = line.match(/^(#{2,3})\s+(.+?)\s*$/);
    if (m) {
      closeAll();
      const lv = m[1].length;
      const txt = m[2].trim();
      const hid = 'asec-' + (toc.length + 1);
      if (wantToc) toc.push({ level: lv, text: txt, id: hid });
      out.push('<h' + lv + ' id="' + hid + '" class="a-heading a-h' + lv + '" data-toc-id="' + hid + '">' + escH(txt) + '</h' + lv + '>');
      continue;
    }
    /* ── উদ্ধৃতি: > লাইন ── */
    m = line.match(/^>\s?(.*)$/);
    if (m) {
      flushPara(); closeList();
      if (!quoteBuf) { out.push('<blockquote class="a-quote">'); quoteBuf = []; }
      quoteBuf.push(inlineMd(escH(m[1])));
      continue;
    }
    /* ── বুলেট-তালিকা: - / * আইটেম ── */
    m = line.match(/^[-*]\s+(.+)$/);
    if (m) {
      flushPara(); closeQuote();
      if (listMode !== 'ul') { closeList(); out.push('<ul class="a-ul">'); listMode = 'ul'; }
      out.push('<li>' + inlineMd(escH(m[1])) + '</li>');
      continue;
    }
    /* ── সংখ্যা-তালিকা: 1. / ১. / 2) আইটেম ── */
    m = line.match(/^(\d+|[\u09E6-\u09EF])[.)]\s+(.+)$/);
    if (m) {
      flushPara(); closeQuote();
      if (listMode !== 'ol') { closeList(); out.push('<ol class="a-ol">'); listMode = 'ol'; }
      out.push('<li>' + inlineMd(escH(m[2])) + '</li>');
      continue;
    }
    /* ── সাধারণ লাইন (ফাঁকা লাইনসহ — আগের আচরণের মিরর) ── */
    closeList(); closeQuote();
    para.push(line);
  }
  closeAll();
  return { html: out.join('\n'), toc };
}

/* ═══ সেশন ৮৪: কমেন্ট-রেন্ডারার (কমপ্যাক্ট) ═════════════════════════════
   মন্তব্যের বাবল ছোট — হেডিং বা hr-এর মতো ভারী ব্লক বাদ। শুধু:
   ইনলাইন (বোল্ড, ইটালিক, কাটা, লিংক, ম্যানশন, ট্যাগ),
   ছোট তালিকা (- বা 1.) আর উদ্ধৃতি (>)। নীতি একই — এস্কেপ-ফার্স্ট। */
function renderComment(raw) {
  const lines = String(raw || '').replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let para = [], listMode = null, quoteBuf = null;
  const flushPara = () => {
    if (para.length) {
      out.push(para.map((l) => inlineMd(escH(l))).join('<br>'));
      para = [];
    }
  };
  const closeList = () => { if (listMode) { out.push('</' + listMode + '>'); listMode = null; } };
  const closeQuote = () => { if (quoteBuf) { out.push(quoteBuf.join('<br>') + '</blockquote>'); quoteBuf = null; } };
  const closeAll = () => { flushPara(); closeList(); closeQuote(); };
  for (const line of lines) {
    let m = line.match(/^>\s?(.*)$/);
    if (m) {
      flushPara(); closeList();
      if (!quoteBuf) { out.push('<blockquote class="a-quote">'); quoteBuf = []; }
      quoteBuf.push(inlineMd(escH(m[1])));
      continue;
    }
    m = line.match(/^[-*]\s+(.+)$/);
    if (m) {
      flushPara(); closeQuote();
      if (listMode !== 'ul') { closeList(); out.push('<ul class="a-ul">'); listMode = 'ul'; }
      out.push('<li>' + inlineMd(escH(m[1])) + '</li>');
      continue;
    }
    m = line.match(/^(\d+|[\u09E6-\u09EF])[.)]\s+(.+)$/);
    if (m) {
      flushPara(); closeQuote();
      if (listMode !== 'ol') { closeList(); out.push('<ol class="a-ol">'); listMode = 'ol'; }
      out.push('<li>' + inlineMd(escH(m[2])) + '</li>');
      continue;
    }
    closeList(); closeQuote();
    para.push(line);
  }
  closeAll();
  return out.join('\n');
}

/* ═══ সেশন ৮৫: plainText() — এক্সসার্পট/মেটা-বর্ণনার জন্য মার্কডাউন-মার্কার-মুক্ত
   টেক্সট ═══════════════════════════════════════════════════════════════════
   সমস্যা: লিস্ট-কার্ড/প্রোফাইল-ফিড/SEO-বর্ণনায় body-র কাঁচা অংশ দেখালে
   **বোল্ড** _ইটালিক_ ~~কাটা~~ মার্কারগুলো শব্দের মাঝে দৃশ্যমান থেকে যেত।
   সমাধান: রেন্ডারার-মিরর স্ট্রিপ — লিংক→টেক্সট, মার্কার-সরানো, তালিকা/
   উদ্ধৃতি/হেডিং-প্রিফিক্স পরিষ্কার, অবশিষ্ট HTML-ট্যাগ সরানো (পুরনো পোস্ট)।
   @mention/#ট্যাগ অক্ষত থাকে — প্লেইন পাঠে সেগুলোই পড়া যায়।
   maxLen দিলে শব্দ-সীমায় কেটে '…' যোগ করে (শব্দের মাঝে না কেটে)। */
function plainText(raw, maxLen) {
  let s = String(raw || '');
  s = s
    /* লিংক আগে — URL ভেতরে থাকলে _ বা * ভেঙে ফেলত */
    .replace(/\[([^\]]+)\]\(\s*(?:https?:\/\/|\/)[^\s)"]*\s*\)/g, '$1')
    /* ইনলাইন-মার্কার (রেন্ডারারের মিরর-ক্রম) */
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    /* লাইন-প্রিফিক্স: হেডিং / উদ্ধৃতি / তালিকা (বাংলা-সংখ্যাসহ) / hr */
    .replace(/^[ \t]{0,3}#{1,6}[ \t]+/gm, '')
    .replace(/^[ \t]{0,3}>[ \t]?/gm, '')
    .replace(/^[ \t]*[-*+][ \t]+/gm, '')
    .replace(/^[ \t]*(?:\d+|[\u09E6-\u09EF])[.)][ \t]+/gm, '')
    .replace(/^[ \t]{0,3}(?:-{3,}|\*{3,}|_{3,})[ \t]*$/gm, '')
    /* পুরনো-পোস্টের র-HTML নোঙর-অংশ + স্পেস-সমান */
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (maxLen && s.length > maxLen) {
    const cut85 = s.slice(0, maxLen);
    const sp85 = cut85.lastIndexOf(' ');
    s = (sp85 > maxLen * 0.6 ? cut85.slice(0, sp85) : cut85).trim() + '…';
  }
  return s;
}

module.exports = { renderBody, renderComment, inlineMd, escH, plainText };
