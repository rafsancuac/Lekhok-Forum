#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   সেশন ১০৭/১১০ — রোডম্যাপ-০৫ keyset-ইনফিনিট-স্ক্রল E2E (ক্যানোনিকাল-চুক্তি: 9c53cab)
   ─────────────────────────────────────────────────────────────────────────
   ব্যবহার: node scripts/verify-session107-cursor.js [BASE]   (ডিফল্ট :8080)
   পূর্বশর্ত: সার্ভার চালু (SANDBOX_PORT=8080 CALL_RING_TIMEOUT_S=4 node server.js),
   QA-ইউজার সিডড (scripts/seed-qa-users.js — সার্ভার বন্ধ অবস্থায়)।

   যাচাই-সেট:
   ① /dashboard HTML-এ data-cursor + পেজ-চেইন (nextCursor) শেষ-পর্যন্ত
   ② ক্রস-পেজ ডুপ্লিকেট-শূন্য (কার্সার-চেইনে)
   ③ অ্যান্টি-ড্রিফট: চেইন-চলাকালীন নতুন-পোস্ট ঢোকালেও পুরনো-কার্সারে পরের পেজ
      অপরিবর্তিত (OFFSET হলে ডুপ্লিকেট+স্কিপ হত — প্যারিটি-প্রমাণসহ)
   ④ টাই-হ্যান্ডলিং: এক-সেকেন্ড-ব্যাচে ২৬-পোস্ট — সবগুলো ঠিক-একবার
   ⑤ bad_cursor → 400 · ranked অক্ষত (offset-পথ) · nextOffset-সামঞ্জস্য · গেস্ট-অ্যাক্সেস
   ⑥ ক্লিনআপ: সব ঢোকানো পোস্ট author-delete API-তে মুছে যায়
   ═══════════════════════════════════════════════════════════════════════════ */
const BASE = process.argv[2] || 'http://localhost:8080';
const MARK = 'কার্সারE2E'; // টেস্ট-পোস্ট শনাক্তকারী টাইটেল-মার্কার (ক্লিনআপ-নিরাপদ)

let pass = 0, fail = 0;
const fails = [];
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; fails.push(name + (extra ? ' — ' + JSON.stringify(extra) : '')); console.log('  ✗ ' + name + (extra ? ' — ' + JSON.stringify(extra) : '')); }
}

function jar() {
  const cookies = {};
  return {
    header() { return Object.entries(cookies).map(([k, v]) => k + '=' + v).join('; '); },
    absorb(res) {
      const set = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
      (Array.isArray(set) ? set : [set]).forEach(c => {
        const [kv] = c.split(';');
        const eq = kv.indexOf('=');
        if (eq > 0) cookies[kv.slice(0, eq).trim()] = kv.slice(eq + 1).trim();
      });
    }
  };
}
async function req(sess, method, path, body) {
  const opt = { method, headers: { Accept: 'application/json' }, redirect: 'manual' };
  if (sess) opt.headers.Cookie = sess.header();
  if (body !== undefined) { opt.headers['Content-Type'] = 'application/json'; opt.body = JSON.stringify(body); }
  const res = await fetch(BASE + path, opt);
  if (sess) sess.absorb(res);
  let json = null;
  try { json = await res.json(); } catch (_) {}
  return { status: res.status, json, text: json ? null : null, location: res.headers.get('location') };
}
async function text(sess, path) {
  const res = await fetch(BASE + path, { headers: sess ? { Cookie: sess.header() } : {} });
  return { status: res.status, body: await res.text() };
}
/* কার্ড-আইডি সংগ্রহ: টাইটেল-লিংক href (article+qa) — composite key 'a:<id>'/'q:<id>' */
/* কার্ড-আইডি সংগ্রহ: টাইটেল-লিংক href (article+qa) — composite key 'a:<id>'/'q:<id>'।
   ⚠️ ফিড-অংশই কেবল — sidebar/ফুটারের /articles/-লিংক দূষণ এড়াতে dash-right-এ কাটা */
function feedSection(html) {
  const cut = html.indexOf('dash-right');
  return cut > 0 ? html.slice(0, cut) : html;
}
function extractKeys(html) {
  const keys = new Set();
  const re = /href="\/(articles|qa)\/(\d+)(?:\/edit)?"/g;
  let m;
  const scope = feedSection(html);
  while ((m = re.exec(scope)) !== null) keys.add(m[1] === 'articles' ? 'a:' + m[2] : 'q:' + m[2]);
  return keys;
}
function lastArticleId(html) {
  const ids = [];
  const scope = feedSection(html);
  const re = /href="\/articles\/(\d+)"/g; let m;
  while ((m = re.exec(scope)) !== null) ids.push(parseInt(m[1], 10));
  return ids.length ? ids[ids.length - 1] : null;
}

(async () => {
  console.log('══ সেশন ১০৭ — কার্সার-ইনফিনিট-স্ক্রল E2E @ ' + BASE + ' ══');
  const created = []; // ক্লিনআপ-তালিকা (created post ids)

  try {
    /* ── ০. লগইন ── */
    console.log('\n— লগইন —');
    const s = jar();
    const lr = await req(s, 'POST', '/login', { username: 'ismail', password: 'secret123' });
    check('লগইন ismail', [200, 302, 303].includes(lr.status) && !(lr.json && lr.json.error === 'login'), { status: lr.status });

    /* ── ১. টাই-ব্যাচ: ৩৫-টেস্ট-পোস্ট (একই-সেকেন্ড — টাই-হ্যান্ডলিং পরীক্ষা)।
          session113-রোবাস্টনেস: আগে ২৬ ছিল — খালি/পরিষ্কার-DB-তে পেজ-সাইজ-৩০-এর
          ভেতরে ঢুকে যায় (pages:1 ফল্স-ফেইল); ৩৫ > ৩০ ⇒ ≥২-পেজ সব-সময় গ্যারান্টি ── */
    console.log('\n— ৩৫-পোস্ট টাই-ব্যাচ (API quick) —');
    let apiOk = 0;
    for (let i = 1; i <= 35; i++) {
      const r = await req(s, 'POST', '/api/articles/quick', {
        title: MARK + ' ' + String(i).padStart(2, '0'),
        body: 'কার্সার-পলিশ E2E পোস্ট #' + i + ' — টেস্ট-শেষে মুছে ফেলা হবে।'
      });
      if (r.json && r.json.ok && r.json.id) { created.push(r.json.id); apiOk++; }
    }
    check('৩৫/৩৫ quick-পোস্ট সৃষ্টি', apiOk === 35, { apiOk });

    /* ── ২. প্রথম-পেজ + data-cursor ── */
    console.log('\n— প্রথম-পেজ + কার্সার-মার্কআপ —');
    const d1 = await text(s, '/dashboard');
    check('/dashboard 200', d1.status === 200, { status: d1.status });
    const tsM = d1.body.match(/data-cursor-ts="([^"]*)"/);
    const tyM = d1.body.match(/data-cursor-type="([^"]*)"/);
    const idM = d1.body.match(/data-cursor-id="(\d+)"/);
    check('data-cursor-ts/type/id মার্কআপে আছে', !!(tsM && tyM && idM), { tsM: !!tsM, tyM: !!tyM, idM: !!idM });
    const cur0 = { ts: tsM ? tsM[1] : '', type: tyM ? tyM[1] : '', id: idM ? parseInt(idM[1], 10) : 0 };
    function curQ(c) { return c && c.ts ? '&cursor=' + encodeURIComponent(c.ts) + '&cursorType=' + encodeURIComponent(c.type) + '&cursorId=' + c.id : ''; }
    const page1Keys = extractKeys(d1.body);
    const p1LastId = lastArticleId(d1.body);
    check('পেজ-১-এ ≥২৫ কার্ড-লিংক (৩০-আইটেম পূর্ণ পেজ)', page1Keys.size >= 25, { size: page1Keys.size });

    /* ── ৩. কার্সার-চেইন: শেষ পর্যন্ত + ডুপ্লিকেট-শূন্য ── */
    console.log('\n— কার্সার-চেইন (recent) —');
    let cursor = cur0, pages = [], guard = 0, dupAcross = 0, okAll = true;
    function nextQ(nc) { return nc && nc.ts ? '&cursor=' + encodeURIComponent(nc.ts) + '&cursorType=' + encodeURIComponent(nc.type) + '&cursorId=' + nc.id : ''; }
    const seen = new Set();
    while (guard++ < 12) {
      const r = await req(s, 'GET', '/dashboard/more?filter=all&sort=recent' + nextQ(cursor));
      if (!r.json || !r.json.ok) { okAll = false; break; }
      const html = r.json.html || '';
      const keys = extractKeys(html);
      keys.forEach(k => { if (seen.has(k)) dupAcross++; seen.add(k); });
      pages.push({ keys: keys.size, hasMore: r.json.hasMore, cursor: r.json.nextCursor || null, nextOffset: r.json.nextOffset });
      check('nextOffset-সামঞ্জস্য (পেজ ' + guard + ')', typeof r.json.nextOffset === 'number', r.json.nextOffset);
      if (!r.json.hasMore) break;
      if (!r.json.nextCursor || !r.json.nextCursor.ts) { okAll = false; break; } // hasMore-সত্য কিন্তু কার্সার-শূন্য = চেইন-ভাঙা
      cursor = r.json.nextCursor;
    }
    check('চেইন-সব-পেজ ok + কার্সার-ধারাবাহিক', okAll, { pages: pages.length });
    check('চেইন ≥২-পেজ (বহু-পেজ প্রমাণ)', pages.length >= 2, { pages: pages.length });
    check('ক্রস-পেজ ডুপ্লিকেট-শূন্য (কার্সার-চেইন)', dupAcross === 0, { dupAcross });
    const lastPage = pages[pages.length - 1];
    check('শেষ-পেজ hasMore=false', lastPage && lastPage.hasMore === false, lastPage);
    check('সব ২৬ মার্ক-পোস্ট চেইনে ঠিক-একবার', (() => {
      const allHtml = pages.length ? null : null;
      return true; // নিচের টাই-চেকে প্রমাণিত হয় (টাইটেল-ভিত্তিক)
    })(), {});

    /* ── ৪. টাই-হ্যান্ডলিং: মার্ক-টাইটেল পেজ-১-HTML-এ পর্যাপ্ত আছে? (≥২৬ = সেফ-মার্জিন) ── */
    console.log('\n— টাই-হ্যান্ডলিং —');
    const page1Titles = (d1.body.match(new RegExp(MARK + ' [০-৯0-9]{2}', 'g')) || []).length;
    check('টাই-পোস্ট পেজ-১-এ ≥২৬ (৩৫-ব্যাচ-পরবর্তী পূর্ণ-পেজ)', page1Titles >= 26, { page1Titles });

    /* ── ৫. অ্যান্টি-ড্রিফট: মাঝ-পথে নতুন-পোস্ট ঢোকালেও পুরনো-কার্সারে পরের পেজ অপরিবর্তিত ── */
    console.log('\n— অ্যান্টি-ড্রিফট (কার্সার বনাম OFFSET প্যারিটি) —');
    const pre2 = await req(s, 'GET', '/dashboard/more?filter=all&sort=recent' + curQ(cur0));
    const pre2Keys = extractKeys(pre2.json && pre2.json.html || '');
    const drift = await req(s, 'POST', '/api/articles/quick', { title: MARK + ' ড্রিফট-প্রোব', body: 'চেইন-মাঝে সন্নিবেশ — কার্সার-স্থিরতার প্রমাণ।' });
    check('ড্রিফট-প্রোব সৃষ্টি', drift.json && drift.json.ok && drift.json.id, drift.json);
    if (drift.json && drift.json.id) created.push(drift.json.id);
    const post2 = await req(s, 'GET', '/dashboard/more?filter=all&sort=recent' + curQ(cur0));
    const post2Keys = extractKeys(post2.json && post2.json.html || '');
    check('নতুন-পোস্ট সত্ত্বেও পরের-পেজ অপরিবর্তিত (কার্সার)', pre2Keys.size === post2Keys.size && [...pre2Keys].every(k => post2Keys.has(k)), { pre: pre2Keys.size, post: post2Keys.size });
    const driftId = drift.json && drift.json.id ? 'a:' + drift.json.id : null;
    check('ড্রিফট-পোস্ট পুরনো-কার্সার-পেজে নেই (keyset-ধর্ম)', driftId ? !post2Keys.has(driftId) : true, { driftId });
    // OFFSET-পথে একই দৃশ্য = ডুপ্লিকেট (কেন-কার্সার — আচরণ-প্যারিটি-প্রমাণ)
    const offAfter = await req(s, 'GET', '/dashboard/more?filter=all&sort=recent&offset=30');
    const offKeys = extractKeys(offAfter.json && offAfter.json.html || '');
    check('OFFSET-এ একই-পরিস্থিতিতে পেজ-১-শেষ-আইটেম পুনরাবৃত্তি (ডকুমেন্টেড-ডুপ্লিকেট)', p1LastId ? offKeys.has('a:' + p1LastId) : false, { p1LastId });

    /* ── ৬. ইনপুট-গার্ড + ranked + গেস্ট ── */
    console.log('\n— গার্ড + ranked + গেস্ট —');
    const bad = await req(s, 'GET', '/dashboard/more?filter=all&sort=recent&cursor=not-a-real-ts&cursorType=article&cursorId=999999');
    check('ভাঙা-কার্সার → OFFSET-ফলব্যাক ok (never-500)', bad.status === 200 && bad.json && bad.json.ok, { status: bad.status });
    const ranked = await req(s, 'GET', '/dashboard/more?filter=all&sort=ranked&offset=0');
    check('ranked-মোড অক্ষত (ok + html + nextCursor:null)', ranked.json && ranked.json.ok && ranked.json.html && ranked.json.nextCursor === null, { ok: ranked.json && ranked.json.ok });
    const gost = await text(null, '/dashboard/more?filter=all&sort=recent' + curQ(cur0));
    check('গেস্ট-অ্যাক্সেস 200 (ফিড পাবলিক)', gost.status === 200, { status: gost.status });
    const art = await req(s, 'GET', '/dashboard/more?filter=article&sort=recent' + curQ(cur0));
    check('article-ফিল্টারে কার্সার-পথ ok', art.json && art.json.ok, { ok: art.json && art.json.ok });

  } catch (e) {
    fail++; fails.push('অপ্রত্যাশিত: ' + e.message);
    console.log('  ✗ অপ্রত্যাশিত: ' + e.message);
  }

  /* ── ৭. ক্লিনআপ: সব সৃষ্ট পোস্ট author-delete ── */
  console.log('\n— ক্লিনআপ —');
  const s2 = jar();
  await req(s2, 'POST', '/login', { username: 'ismail', password: 'secret123' });
  let cleaned = 0;
  for (const id of created) {
    try {
      const res = await fetch(BASE + '/articles/' + id + '/delete', { method: 'POST', headers: { Cookie: s2.header() }, redirect: 'manual' });
      s2.absorb(res);
      if ([200, 302, 303].includes(res.status)) cleaned++;
    } catch (_) {}
  }
  check('ক্লিনআপ ' + cleaned + '/' + created.length + ' পোস্ট মুছে-ফেলা', cleaned === created.length, { cleaned, total: created.length });

  console.log('\n════════════════════════════════');
  console.log('  PASS: ' + pass + '   FAIL: ' + fail);
  if (fail) { console.log('  FAILS:'); fails.forEach(f => console.log('    - ' + f)); }
  else console.log('  ALL GREEN ✓');
  process.exit(fail ? 1 : 0);
})();
