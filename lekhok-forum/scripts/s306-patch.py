#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# s306-patch.py — session306: ep306 — ই-পেপার পৃষ্ঠা-সংখ্যা-ব্যাজ (page-count badge)
# [Task ID 146] PLANS session305-প্রস্তাব: **page-count-ব্যাজ (গেটেড)** — গেট = epaper_files-এ
# page_count-কলাম; এ-রাউন্ডে গেট-উন্মোচন: স্কিমা-কলাম + migrate-ALTER (Turso+লোকাল) +
# sync-পেলোড pageCount (1..999-স্যানিটাইজ, COALESCE-আপডেট) + archive/daily-SELECT pageCount +
# epaper.ejs payload.pages + .ep-pages306-ব্যাজ + __epg306QA-হুক (papers-শূন্যে-ও সংজ্ঞায়িত) +
# epaper.css session306-ব্লক (হেক্স-শূন্য) + epaper-bot pageCount (pdf-lib getPageCount)।
# চুক্তি: মার্কার-স্কিপ ইডেমপোটেন্ট ×N + অ্যাঙ্কর-এককতা-FATAL + পোস্ট-অ্যাসার্ট +
#   হেক্স-শূন্য + EJS-কম্পাইল + node --check ×৩।
import re
import subprocess
import sys

APP = '/home/z/lekhok-forum/lekhok-forum/lekhok-forum'
BOT = '/home/z/lekhok-forum/lekhok-forum/epaper-bot'

FATAL = []


def fatal(msg):
    FATAL.append(msg)
    print('FATAL: ' + msg)


def rd(p):
    with open(p, 'r', encoding='utf-8') as f:
        return f.read()


def wr(p, t):
    with open(p, 'w', encoding='utf-8') as f:
        f.write(t)


def apply_edit(path, marker, anchor, replacement, label):
    """মার্কার-স্কিপ ইডেমপোটেন্ট; অ্যাঙ্কর-এককতা-FATAL (count!=1 হলে স্কিপ-নয়-FATAL)।"""
    t = rd(path)
    if marker in t:
        print('  — (ইতিমধ্যে) ' + label)
        return
    n = t.count(anchor)
    if n != 1:
        fatal(label + ' — অ্যাঙ্কর-গণনা=' + str(n) + ' (প্রত্যাশা ১)')
        return
    wr(path, t.replace(anchor, replacement, 1))
    print('  ✓ ' + label)


# ═══ 1. db/schema.sql — epaper_files-এ page_count-কলাম (নতুন-ডিপ্লয়) ═══
print('── db/schema.sql ──')
P = APP + '/db/schema.sql'
apply_edit(
    P,
    'page_count      INTEGER,',
    "  drive_thumb_id  TEXT,\n  source          TEXT    DEFAULT 'epaper-bot',",
    "  drive_thumb_id  TEXT,\n  page_count      INTEGER,\n  source          TEXT    DEFAULT 'epaper-bot',",
    'epaper_files.page_count-কলাম (স্কিমা)')

# ═══ 2. db/migrate.js — উভয়-ব্যাকএন্ডে ALTER TABLE নিশ্চিতকারী (পুরাতন-ডিপ্লয়) ═══
print('── db/migrate.js ──')
P = APP + '/db/migrate.js'
MIG_TURSO = """    // session306: epaper_files.page_count-নিশ্চিতকারী (পুরাতন-ডিপ্লয়ে কলাম-যোগ — ইডেমপোটেন্ট)
    try {
      await client.execute('ALTER TABLE epaper_files ADD COLUMN page_count INTEGER');
      console.log('  + epaper_files.page_count যোগ হয়েছে');
    } catch (colErr306) {
      if (!/duplicate column|already exists/i.test(String(colErr306 && colErr306.message))) {
        console.error('  ✗ page_count-মাইগ্রেশন:', colErr306 && colErr306.message);
      }
    }
"""
MIG_LOCAL = """  // session306: epaper_files.page_count-নিশ্চিতকারী (লোকাল sql.js — ইডেমপোটেন্ট)
  try {
    db.run('ALTER TABLE epaper_files ADD COLUMN page_count INTEGER');
    console.log('  + epaper_files.page_count যোগ হয়েছে (লোকাল)');
  } catch (colErr306) {
    if (!/duplicate column|already exists/i.test(String(colErr306 && colErr306.message))) {
      console.error('  ✗ page_count-মাইগ্রেশন:', colErr306 && colErr306.message);
    }
  }
"""
t = rd(P)
if 'ALTER TABLE epaper_files ADD COLUMN page_count INTEGER' in t:
    print('  — (ইতিমধ্যে) migrate-উভয়-পথ')
else:
    a1 = '    await client.close();'
    if t.count(a1) != 1:
        fatal('migrate-Turso-অ্যাঙ্কর-গণনা=' + str(t.count(a1)))
    else:
        t = t.replace(a1, MIG_TURSO + a1, 1)
        print('  ✓ migrate-Turso-পথ')
    a2 = '  const out = fs.writeFileSync(dbPath, db.export());'
    if t.count(a2) != 1:
        fatal('migrate-লোকাল-অ্যাঙ্কর-গণনা=' + str(t.count(a2)))
    else:
        t = t.replace(a2, MIG_LOCAL + a2, 1)
        print('  ✓ migrate-লোকাল-পথ')
    wr(P, t)

# ═══ 2b. db/migrate.js — top-level-await+require = ERR_AMBIGUOUS_MODULE_SYNTAX ফিক্স (QA-বাগ) ═══
# Node 22+-এ require()+top-level-await সহ-বিদ্যমানতায় মডিউল-ফরম্যাট-অনির্ণেয় → স্ক্রিপ্ট-রান-ব্যর্থ
# (ep306-গেটে page_count-ALTER-পথ এই-স্ক্রিপ্টের-উপরেই নির্ভরশীল)। লোকাল-শাখা async-IIFE-এ মোড়ানো।
print('── db/migrate.js IIFE-মোড়ানো (QA-বাগ-ফিক্স) ──')
P = APP + '/db/migrate.js'
t = rd(P)
if '(async () => {\n  const initSqlJs = require' in t:
    print('  — (ইতিমধ্যে) migrate-IIFE-মোড়ানো')
else:
    _aA = "  const initSqlJs = require('sql.js');"
    if t.count(_aA) != 1:
        fatal('migrate-IIFE-ওপেন-অ্যাঙ্কর-গণনা=' + str(t.count(_aA)))
    else:
        t = t.replace(_aA, "  // session306-ফিক্স: top-level-await + require = ERR_AMBIGUOUS_MODULE_SYNTAX (Node 22+) —\n  // লোকাল-শাখা async-IIFE-এ মোড়ানো → CJS-পার্স-পুনঃপ্রতিষ্ঠা (node db/migrate.js পুনঃচালু)\n  (async () => {\n" + _aA, 1)
        # ক্লোজ-অ্যাঙ্কর — প্রকৃত-বাইটে '[migrate] Done.' (ডিসপ্লে-স্তরে [m-ক্ষয়-ধোঁকা; s304-চুক্তি —
        # chr(91)-গঠন = লেখনী-স্তর-ক্ষয়-প্রমাণ)
        _aB = "console.log('" + chr(91) + "migrate] Done.');\n}"
        if t.count(_aB) != 1:
            fatal('migrate-IIFE-ক্লোজ-অ্যাঙ্কর-গণনা=' + str(t.count(_aB)))
        else:
            _head = _aB[:-2]  # console.log('[migrate] Done.');  — বাইট-নির্ভর-পুনঃব্যবহার (ক্ষয়-শূন্য)
            t = t.replace(_aB, _head + "\n  })().catch((migErr306) => { console.error('migrate Fatal:', migErr306 && migErr306.message); process.exit(1); });\n}", 1)
            wr(P, t)
            print('  ✓ migrate-IIFE-মোড়ানো (লোকাল-শাখা)')

# ═══ 3. routes/api-epaper.js — sync pageCount + archive pageCount ═══
print('── routes/api-epaper.js ──')
P = APP + '/routes/api-epaper.js'
apply_edit(
    P,
    'const _pcRaw = Number',
    '    const { date, title, body, fileUrl, source, paperName, fileId, thumbId } = req.body || {};',
    """    const { date, title, body, fileUrl, source, paperName, fileId, thumbId } = req.body || {};
    // session306 (ep306): বট-পাঠানো পৃষ্ঠা-সংখ্যা — 1..999-বৈধ হলে-ই গৃহীত, নইলে NULL (শূন্য-সহনশীল)
    const _pcRaw = Number((req.body || {}).pageCount);
    const pageCount = Number.isFinite(_pcRaw) && _pcRaw >= 1 && _pcRaw <= 999 ? Math.round(_pcRaw) : null;""",
    'sync-pageCount-পার্স')
apply_edit(
    P,
    ').run(paper, fUrl, pageCount, thumbIdStr, dup.id);',
    '''          "UPDATE epaper_files SET paper_name = ?, file_url = ?, drive_thumb_id = COALESCE(?, drive_thumb_id), published = 1 WHERE id = ?"
        ).run(paper, fUrl, thumbIdStr, dup.id);''',
    '''          "UPDATE epaper_files SET paper_name = ?, file_url = ?, page_count = COALESCE(?, page_count), drive_thumb_id = COALESCE(?, drive_thumb_id), published = 1 WHERE id = ?"
        ).run(paper, fUrl, pageCount, thumbIdStr, dup.id);''',
    'sync-আর্কাইভ-আপডেট (COALESCE — বট-পুনঃসিঙ্কে-সংরক্ষণ)')
apply_edit(
    P,
    'drive_thumb_id, page_count, source, published) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
    '''        const r = await db.prepare(
          "INSERT INTO epaper_files (scheduled_date, paper_name, file_url, drive_file_id, drive_thumb_id, source, published) VALUES (?, ?, ?, ?, ?, ?, 1)"
        ).run(d, paper, fUrl, driveId, thumbIdStr, src);''',
    '''        const r = await db.prepare(
          "INSERT INTO epaper_files (scheduled_date, paper_name, file_url, drive_file_id, drive_thumb_id, page_count, source, published) VALUES (?, ?, ?, ?, ?, ?, ?, 1)"
        ).run(d, paper, fUrl, driveId, thumbIdStr, pageCount, src);''',
    'sync-আর্কাইভ-ইনসার্ট (ড্রাইভ-শাখা)')
apply_edit(
    P,
    ').run(fUrl, pageCount, thumbIdStr, dup.id);',
    'await db.prepare("UPDATE epaper_files SET file_url = ?, drive_thumb_id = COALESCE(?, drive_thumb_id), published = 1 WHERE id = ?").run(fUrl, thumbIdStr, dup.id);',
    'await db.prepare("UPDATE epaper_files SET file_url = ?, page_count = COALESCE(?, page_count), drive_thumb_id = COALESCE(?, drive_thumb_id), published = 1 WHERE id = ?").run(fUrl, pageCount, thumbIdStr, dup.id);',
    'sync-ফলব্যাক-আপডেট (ড্রাইভ-বিহীন)')
apply_edit(
    P,
    'VALUES (?, ?, ?, NULL, ?, ?, ?, 1)',
    '''        const r = await db.prepare(
          "INSERT INTO epaper_files (scheduled_date, paper_name, file_url, drive_file_id, drive_thumb_id, source, published) VALUES (?, ?, ?, NULL, ?, ?, 1)"
        ).run(d, paper, fUrl, thumbIdStr, src);''',
    '''        const r = await db.prepare(
          "INSERT INTO epaper_files (scheduled_date, paper_name, file_url, drive_file_id, drive_thumb_id, page_count, source, published) VALUES (?, ?, ?, NULL, ?, ?, ?, 1)"
        ).run(d, paper, fUrl, thumbIdStr, pageCount, src);''',
    'sync-ফলব্যাক-ইনসার্ট (ড্রাইভ-বিহীন)')
apply_edit(
    P,
    'paper, pageCount, mode:',
    "return res.json({ ok: true, id, archiveId, date: d, paper, mode: existing && existing.id ? 'updated' : 'inserted', source: src });",
    "return res.json({ ok: true, id, archiveId, date: d, paper, pageCount, mode: existing && existing.id ? 'updated' : 'inserted', source: src });",
    'sync-রেসপন্স pageCount')
# archive-SELECT ×২ — অ্যাঙ্কর-গণনা-সচেতন (দুই-কোয়েরি-লাইনেই একই-সাবস্ট্রিং — সচেতন-ব্যতিক্রম)
_t = rd(P)
if 'page_count AS pageCount, source, created_at FROM epaper_files' not in _t:
    _a = 'drive_thumb_id AS thumbId, source, created_at FROM epaper_files'
    _n = _t.count(_a)
    if _n != 2:
        fatal('archive-SELECT ×২ — অ্যাঙ্কর-গণনা=' + str(_n) + ' (প্রত্যাশা ২)')
    else:
        wr(P, _t.replace(_a, 'drive_thumb_id AS thumbId, page_count AS pageCount, source, created_at FROM epaper_files'))
        print('  ✓ archive-SELECT ×২ (দুই-কোয়েরি)')

# ═══ 4. routes/daily.js — /epaper SELECT pageCount ═══
print('── routes/daily.js ──')
P = APP + '/routes/daily.js'
apply_edit(
    P,
    'page_count AS pageCount, created_at FROM epaper_files',
    'drive_thumb_id AS thumbId, created_at FROM epaper_files WHERE published = 1 ORDER BY scheduled_date DESC, id ASC LIMIT 400',
    'drive_thumb_id AS thumbId, page_count AS pageCount, created_at FROM epaper_files WHERE published = 1 ORDER BY scheduled_date DESC, id ASC LIMIT 400',
    '/epaper-SELECT pageCount')

# ═══ 5. views/user/epaper.ejs — payload + ব্যাজ + হুক ═══
print('── views/user/epaper.ejs ──')
P = APP + '/views/user/epaper.ejs'
apply_edit(
    P,
    'pages: p.pageCount || null,',
    """      fid: fid,
      rank: rankOf(p.paperName)""",
    """      fid: fid,
      pages: p.pageCount || null, // session306: পৃষ্ঠা-সংখ্যা (বট-সিঙ্কড page_count — শূন্য-সহনশীল)
      rank: rankOf(p.paperName)""",
    'payload-pages-ফিল্ড')
apply_edit(
    P,
    '" data-id="\' + p.id + \'" data-pages="\'',
    """      frag += '<button type="button" role="option" aria-selected="' + on + '" class="ep-item' + (on ? ' is-on' : '') + '" data-id="' + p.id + '">' +""",
    """      frag += '<button type="button" role="option" aria-selected="' + on + '" class="ep-item' + (on ? ' is-on' : '') + '" data-id="' + p.id + '" data-pages="' + (p.pages || '') + '">' +""",
    '.ep-item data-pages-অ্যাট্রিবিউট')
apply_edit(
    P,
    'session306 (ep306): পৃষ্ঠা-সংখ্যা-ব্যাজ',
    """        '<span class="ep-item-meta"><b class="ep-item-name">' + p.name + '</b>' +""",
    """        '<span class="ep-item-meta"><b class="ep-item-name">' + p.name + '</b>' +
        // session306 (ep306): পৃষ্ঠা-সংখ্যা-ব্যাজ (page_count-শূন্যে-রেন্ডার-ই-হয়-না — গেটেড-চুক্তি)
        (p.pages ? '<span class="ep-pages306" data-pages="' + p.pages + '" title="মোট পৃষ্ঠা"><i class="far fa-file-alt" aria-hidden="true"></i>' + bnDigits(p.pages) + ' পৃষ্ঠা</span>' : '') +""",
    '.ep-pages306-ব্যাজ-রেন্ডার')
apply_edit(
    P,
    '__epg306QA',
    """    years: function () { try { return document.querySelectorAll('.ep-cal-y.epk300-warm').length; } catch (e303) { return 0; } }
  };
  if (!papers.length || !elList) return;""",
    """    years: function () { try { return document.querySelectorAll('.ep-cal-y.epk300-warm').length; } catch (e303) { return 0; } }
  };
  /* session306: পৃষ্ঠা-সংখ্যা-ব্যাজ QA-হুক (papers-শূন্যে-ও সংজ্ঞায়িত — পরিবার-চুক্তি) */
  window.__epg306QA = {
    total: papers.length,
    withPages: papers.filter(function (p) { return !!p.pages; }).length,
    badges: function () { try { return document.querySelectorAll('#epList .ep-pages306').length; } catch (e306) { return 0; } },
    pages: function (id) { try { var q = papers.filter(function (x) { return x.id === id; })[0]; return q ? (q.pages || 0) : 0; } catch (e306) { return 0; } }
  };
  if (!papers.length || !elList) return;""",
    '__epg306QA-হুক')

# ═══ 6. public/assets/css/epaper.css — session306-ব্লক (হেক্স-শূন্য) ═══
print('── public/assets/css/epaper.css ──')
P = APP + '/public/assets/css/epaper.css'
CSS306 = """
/* ═══ session306 — পৃষ্ঠা-সংখ্যা-ব্যাজ (ep306; PLANS session305-প্রস্তাব page-count-গেট-উন্মোচন)
   চুক্তি: হেক্স-শূন্য টোকেন-শুধু + color-mix-অ্যাকসেন্ট + focus-visible-রিং + ট্রানজিশন
   + 640px-সংকোচন + reduced-motion-সম্মান (session303-সুপারসেট) ═══ */
/* ① ব্যাজ-পিল — তালিকা-আইটেমের মেটা-সারিতে পৃষ্ঠা-সংখ্যা (page_count-শূন্যে-রেন্ডার-ই-হয়-না)
   নামস্পেস-চুক্তি: .ep-pages306 — .ep-pages306 রিডার-স্ক্রলার-শ্রেণির-সাথে সংঘর্ষ-শূন্য (রান-১ QA-তে আবিষ্কৃত) */
.ep-pages306 {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  padding: 1px 8px;
  border-radius: var(--lf-radius-chip);
  font-size: .62rem;
  font-weight: 800;
  letter-spacing: .2px;
  line-height: 1.7;
  white-space: nowrap;
  color: var(--lf-text-secondary);
  background: var(--lf-ui-input-bg);
  border: 1px solid var(--lf-ui-border-strong);
}
.ep-pages306 i { font-size: .58rem; color: var(--lf-brand-primary); }
/* ② সক্রিয়-আইটেমে অ্যাকসেন্ট-উন্নয়ন (is-on — নির্বাচিত-পত্রিকায় ব্র্যান্ড-টিন্ট) */
.ep-item.is-on .ep-pages306 {
  color: var(--lf-brand-primary);
  background: color-mix(in srgb, var(--lf-brand-primary) 9%, transparent);
  border-color: color-mix(in srgb, var(--lf-brand-primary) 38%, transparent);
}
/* ③ ট্রানজিশন (থিম-সুইচ/নির্বাচন-মসৃণ) */
.ep-pages306 { transition: color .15s ease, background .15s ease, border-color .15s ease; }
/* ④ 640px-সংকোচন (টাচ-সার্ফেসে ঘন-তালিকায় কমপ্যাক্ট) */
@media (max-width: 640px) {
  .ep-pages306 { padding: 0 6px; font-size: .58rem; gap: 3px; }
}
/* ⑤ রিডিউসড-মোশন গার্ড */
@media (prefers-reduced-motion: reduce) {
  .ep-pages306 { transition: none; }
}
"""
t = rd(P)
if 'session306 — পৃষ্ঠা-সংখ্যা-ব্যাজ' in t:
    print('  — (ইতিমধ্যে) css-session306-ব্লক')
else:
    if not t.endswith('\n'):
        t += '\n'
    wr(P, t + CSS306)
    print('  ✓ css-session306-ব্লক (অ্যাপেন্ড)')

# 6b. মেটা-সারি flex-বিন্যাস (নাম+ব্যাজ এক-লাইনে — একল-র‍্যাপ-ধোঁকা-সংশোধন)
# মার্কার = কমেন্ট-স্নিপ (6c-রূপান্তর-পরবর্তীও অটুট — পুনঃরান-নিরাপদ)
apply_edit(
    P,
    '①-ব. মেটা-সারি',
    '.ep-pages306 i { font-size: .58rem; color: var(--lf-brand-primary); }',
    """.ep-pages306 i { font-size: .58rem; color: var(--lf-brand-primary); }
/* ①-ব. মেটা-সারি flex-বিন্যাস — নাম flex:1 + ব্যাজ/উষ্ণ-চিপ ডানে (একল-র‍্যাপ-ধোঁকা সংশোধন) */
.ep-item .ep-item-meta { display: flex; align-items: center; gap: 6px; }
.ep-item .ep-item-name { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ep-item .ep-pages306, .ep-item .ep-warmchip { flex-shrink: 0; }
.ep-item .ep-pages306 { margin-left: 0; }""",
    'css-মেটা-flex-বিন্যাস')

# 6c. flex-row সংকোচন ≥641px-এ — মোবাইলের 2-লাইন-ক্ল্যাম্প চুক্তি (epaper.css:97) অটুট রাখতে
# অ্যাঙ্কর = 6b-কমেন্ট+৪-লাইন (রূপান্তর-পরে 6b-কমেন্ট-অবশিষ্ট-ঝুঁকি-শূন্য)
apply_edit(
    P,
    '@media (min-width: 641px) {\n  .ep-item .ep-item-meta { display: flex; flex-direction: row;',
    """/* ①-ব. মেটা-সারি flex-বিন্যাস — নাম flex:1 + ব্যাজ/উষ্ণ-চিপ ডানে (একল-র‍্যাপ-ধোঁকা সংশোধন) */
.ep-item .ep-item-meta { display: flex; align-items: center; gap: 6px; }
.ep-item .ep-item-name { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ep-item .ep-pages306, .ep-item .ep-warmchip { flex-shrink: 0; }
.ep-item .ep-pages306 { margin-left: 0; }""",
    """/* ①-ব. মেটা-সারি flex-row (≥641px — নাম flex:1 + ব্যাজ/উষ্ণ-চিপ ডানে; ≤640px-এ s280-কলাম+২-লাইন-ক্ল্যাম্প চুক্তি অটুট) */
@media (min-width: 641px) {
  .ep-item .ep-item-meta { display: flex; flex-direction: row; align-items: center; gap: 6px; }
  .ep-item .ep-item-name { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ep-item .ep-pages306, .ep-item .ep-warmchip { flex-shrink: 0; }
  .ep-item .ep-pages306 { margin-left: 0; }
}""",
    'css-flex-row-মিডিয়া-গেট')

# 6d. নামস্পেস-সংশোধন (রান-১ QA-গোটচা): ব্যাজ-শ্রেণি .ep-pages → .ep-pages306
# .ep-pages = রিডার-স্ক্রলারের প্রতিষ্ঠিত-শ্রেণি (epaper.ejs:829 wrap.className) — সংঘর্ষে
# ব্যাজ-স্টাইল রিডারে-ও-ছিটকে-যেত; পরিবার-চুক্তি অনুযায়ী সেশন-সংখ্যাযুক্ত নামস্পেস।
print('── 6d: ব্যাজ-শ্রেণি নামস্পেস-সংশোধন ──')
P = APP + '/views/user/epaper.ejs'
apply_edit(
    P,
    'class="ep-pages306" data-pages=',
    'class="ep-pages" data-pages=',
    'class="ep-pages306" data-pages=',
    'ejs-ব্যাজ-শ্রেণি .ep-pages306')
apply_edit(
    P,
    "'#epList .ep-pages306'",
    "'#epList .ep-pages'",
    "'#epList .ep-pages306'",
    'ejs-হুক-সিলেক্টর .ep-pages306')
P = APP + '/public/assets/css/epaper.css'
_t = rd(P)
if '.ep-pages306' in _t:
    print('  — (ইতিমধ্যে) css-ব্যাজ-শ্রেণি .ep-pages306')
else:
    _bi = _t.index('session306 — পৃষ্ঠা-সংখ্যা-ব্যাজ')
    _head, _blk = _t[:_bi], _t[_bi:]
    import re as _re
    _blk = _re.sub(r'\.ep-pages(?!306)', '.ep-pages306', _blk)
    wr(P, _head + _blk)
    print('  ✓ css-ব্লক-ভিতরে .ep-pages306-নামস্পেস (ব্লক-স্কোপড — রিডার-স্ক্রলার-অস্পৃষ্ট)')

# ═══ 7. epaper-bot/src/index.ts — pageCount গণনা + sync-পেলোড ═══
print('── epaper-bot/src/index.ts ──')
P = BOT + '/src/index.ts'
apply_edit(
    P,
    "import { PDFDocument } from 'pdf-lib'",
    "import { stripTelegramPromoLayer } from './cleaner'",
    "import { stripTelegramPromoLayer } from './cleaner'\nimport { PDFDocument } from 'pdf-lib' // session306: পৃষ্ঠা-সংখ্যা-নির্ণয় (ep306)",
    'bot-pdf-lib-ইমপোর্ট')
apply_edit(
    P,
    'let pageCount: number | undefined',
    """    // থাম্বনেইল: টেলিগ্রাম-প্রিভিউ → PDF-প্রথম-পাতা-রেন্ডার (ডাউনলোড-স্কিপ হলে ড্রাইভ-থেকে-এক-বার)""",
    """    // session306 (ep306): পৃষ্ঠা-সংখ্যা-নির্ণয় (ক্লিনড-বাইট থেকে — ব্যর্থতায় বাদ, প্রধান-প্রবাহ অটুট)
    let pageCount: number | undefined
    if (pdfBytes) {
      try {
        pageCount = (await PDFDocument.load(pdfBytes)).getPageCount()
        if (!(pageCount >= 1 && pageCount <= 999)) pageCount = undefined
      } catch (pcErr) {
        console.log('↷ পৃষ্ঠা-সংখ্যা নির্ণয় ব্যর্থ — বাদ:', pcErr instanceof Error ? pcErr.message : pcErr)
        pageCount = undefined
      }
    }
    // থাম্বনেইল: টেলিগ্রাম-প্রিভিউ → PDF-প্রথম-পাতা-রেন্ডার (ডাউনলোড-স্কিপ হলে ড্রাইভ-থেকে-এক-বার)""",
    'bot-pageCount-গণনা')
apply_edit(
    P,
    'thumbId?: string, pageCount?: number',
    'async function siteSync(date: string, fileId: string, paperName: string, thumbId?: string): Promise<void> {',
    'async function siteSync(date: string, fileId: string, paperName: string, thumbId?: string, pageCount?: number): Promise<void> {',
    'bot-siteSync-সিগনেচার')
apply_edit(
    P,
    'pageCount: pageCount || undefined,',
    '      thumbId: thumbId || undefined,',
    """      thumbId: thumbId || undefined,
      pageCount: pageCount || undefined, // session306: পৃষ্ঠা-সংখ্যা (নির্ণয়-ব্যর্থতায় undefined — সাইটে COALESCE-সংরক্ষণ)""",
    'bot-sync-বডি pageCount')
apply_edit(
    P,
    'siteSync(msgDate, fileId, paperName, thumbId, pageCount)',
    'await siteSync(msgDate, fileId, paperName, thumbId)',
    'await siteSync(msgDate, fileId, paperName, thumbId, pageCount)',
    'bot-siteSync-কল-সাইট')

# ═══ 8. প্রোড-সেফটি ফলব্যাক — অ-মাইগ্রেটেড-ডিবিতে sync/archive ভাঙা-রোধ (গ্রেসফুল-গেট) ═══
# Vercel-ডিপ্লয় ও Turso-মাইগ্রেশন-এর মাঝে-জানালায় page_count-বিহীন ডিবিতেও বট-sync ও
# পাবলিক archive-API জীবিত থাকবে (প্রধান-প্রবাহ-অটুট চুক্তি — cleaner/route-ইতিহাস-ধর্ম)।
print('── প্রোড-সেফটি ফলব্যাক (অ-মাইগ্রেটেড-ডিবি গ্রেসফুল-গেট) ──')
P = APP + '/routes/api-epaper.js'
apply_edit(
    P,
    'sync-আর্কাইভ-আপডেট-ফলব্যাক (session306-সেফটি)',
    '''        await db.prepare(
          "UPDATE epaper_files SET paper_name = ?, file_url = ?, page_count = COALESCE(?, page_count), drive_thumb_id = COALESCE(?, drive_thumb_id), published = 1 WHERE id = ?"
        ).run(paper, fUrl, pageCount, thumbIdStr, dup.id);''',
    '''        try {
            await db.prepare(
              "UPDATE epaper_files SET paper_name = ?, file_url = ?, page_count = COALESCE(?, page_count), drive_thumb_id = COALESCE(?, drive_thumb_id), published = 1 WHERE id = ?"
            ).run(paper, fUrl, pageCount, thumbIdStr, dup.id);
          } catch (e306pc) {
            // sync-আর্কাইভ-আপডেট-ফলব্যাক (session306-সেফটি) — page_count-বিহীন অ-মাইগ্রেটেড-ডিবি
            await db.prepare(
              "UPDATE epaper_files SET paper_name = ?, file_url = ?, drive_thumb_id = COALESCE(?, drive_thumb_id), published = 1 WHERE id = ?"
            ).run(paper, fUrl, thumbIdStr, dup.id);
          }''',
    'sync-আর্কাইভ-আপডেট-ফলব্যাক (session306-সেফটি)')
apply_edit(
    P,
    'sync-আর্কাইভ-ইনসার্ট-ফলব্যাক (session306-সেফটি)',
    '''        const r = await db.prepare(
          "INSERT INTO epaper_files (scheduled_date, paper_name, file_url, drive_file_id, drive_thumb_id, page_count, source, published) VALUES (?, ?, ?, ?, ?, ?, ?, 1)"
        ).run(d, paper, fUrl, driveId, thumbIdStr, pageCount, src);''',
    '''        let r;
        try {
          r = await db.prepare(
            "INSERT INTO epaper_files (scheduled_date, paper_name, file_url, drive_file_id, drive_thumb_id, page_count, source, published) VALUES (?, ?, ?, ?, ?, ?, ?, 1)"
          ).run(d, paper, fUrl, driveId, thumbIdStr, pageCount, src);
        } catch (e306pc) {
          // sync-আর্কাইভ-ইনসার্ট-ফলব্যাক (session306-সেফটি) — page_count-বিহীন অ-মাইগ্রেটেড-ডিবি
          r = await db.prepare(
            "INSERT INTO epaper_files (scheduled_date, paper_name, file_url, drive_file_id, drive_thumb_id, source, published) VALUES (?, ?, ?, ?, ?, ?, 1)"
          ).run(d, paper, fUrl, driveId, thumbIdStr, src);
        }''',
    'sync-আর্কাইভ-ইনসার্ট-ফলব্যাক (session306-সেফটি)')
apply_edit(
    P,
    'sync-ফলব্যাক-আপডেট-সেফটি (session306)',
    'await db.prepare("UPDATE epaper_files SET file_url = ?, page_count = COALESCE(?, page_count), drive_thumb_id = COALESCE(?, drive_thumb_id), published = 1 WHERE id = ?").run(fUrl, pageCount, thumbIdStr, dup.id);',
    '''try {
          await db.prepare("UPDATE epaper_files SET file_url = ?, page_count = COALESCE(?, page_count), drive_thumb_id = COALESCE(?, drive_thumb_id), published = 1 WHERE id = ?").run(fUrl, pageCount, thumbIdStr, dup.id);
        } catch (e306pc) {
          // sync-ফলব্যাক-আপডেট-সেফটি (session306) — page_count-বিহীন অ-মাইগ্রেটেড-ডিবি
          await db.prepare("UPDATE epaper_files SET file_url = ?, drive_thumb_id = COALESCE(?, drive_thumb_id), published = 1 WHERE id = ?").run(fUrl, thumbIdStr, dup.id);
        }''',
    'sync-ফলব্যাক-আপডেট-সেফটি (session306)')
apply_edit(
    P,
    'sync-ফলব্যাক-ইনসার্ট-সেফটি (session306)',
    '''        const r = await db.prepare(
          "INSERT INTO epaper_files (scheduled_date, paper_name, file_url, drive_file_id, drive_thumb_id, page_count, source, published) VALUES (?, ?, ?, NULL, ?, ?, ?, 1)"
        ).run(d, paper, fUrl, thumbIdStr, pageCount, src);''',
    '''        let r;
        try {
          r = await db.prepare(
            "INSERT INTO epaper_files (scheduled_date, paper_name, file_url, drive_file_id, drive_thumb_id, page_count, source, published) VALUES (?, ?, ?, NULL, ?, ?, ?, 1)"
          ).run(d, paper, fUrl, thumbIdStr, pageCount, src);
        } catch (e306pc) {
          // sync-ফলব্যাক-ইনসার্ট-সেফটি (session306) — page_count-বিহীন অ-মাইগ্রেটেড-ডিবি
          r = await db.prepare(
            "INSERT INTO epaper_files (scheduled_date, paper_name, file_url, drive_file_id, drive_thumb_id, source, published) VALUES (?, ?, ?, NULL, ?, ?, 1)"
          ).run(d, paper, fUrl, thumbIdStr, src);
        }''',
    'sync-ফলব্যাক-ইনসার্ট-সেফটি (session306)')
apply_edit(
    P,
    'archive-SELECT-ফলব্যাক (session306-সেফটি)',
    '''    const rows = d
      ? await db.prepare("SELECT id, scheduled_date AS date, paper_name AS paperName, file_url AS fileUrl, drive_file_id AS fileId, drive_thumb_id AS thumbId, page_count AS pageCount, source, created_at FROM epaper_files WHERE published = 1 AND scheduled_date = ? ORDER BY id ASC").all(d)
      : await db.prepare("SELECT id, scheduled_date AS date, paper_name AS paperName, file_url AS fileUrl, drive_file_id AS fileId, drive_thumb_id AS thumbId, page_count AS pageCount, source, created_at FROM epaper_files WHERE published = 1 ORDER BY scheduled_date DESC, id ASC LIMIT ?").all(limit);''',
    '''    let rows;
    try {
      rows = d
        ? await db.prepare("SELECT id, scheduled_date AS date, paper_name AS paperName, file_url AS fileUrl, drive_file_id AS fileId, drive_thumb_id AS thumbId, page_count AS pageCount, source, created_at FROM epaper_files WHERE published = 1 AND scheduled_date = ? ORDER BY id ASC").all(d)
        : await db.prepare("SELECT id, scheduled_date AS date, paper_name AS paperName, file_url AS fileUrl, drive_file_id AS fileId, drive_thumb_id AS thumbId, page_count AS pageCount, source, created_at FROM epaper_files WHERE published = 1 ORDER BY scheduled_date DESC, id ASC LIMIT ?").all(limit);
    } catch (e306pc) {
      // archive-SELECT-ফলব্যাক (session306-সেফটি) — page_count-বিহীন অ-মাইগ্রেটেড-ডিবি (pageCount:null)
      rows = d
        ? await db.prepare("SELECT id, scheduled_date AS date, paper_name AS paperName, file_url AS fileUrl, drive_file_id AS fileId, drive_thumb_id AS thumbId, source, created_at FROM epaper_files WHERE published = 1 AND scheduled_date = ? ORDER BY id ASC").all(d)
        : await db.prepare("SELECT id, scheduled_date AS date, paper_name AS paperName, file_url AS fileUrl, drive_file_id AS fileId, drive_thumb_id AS thumbId, source, created_at FROM epaper_files WHERE published = 1 ORDER BY scheduled_date DESC, id ASC LIMIT ?").all(limit);
    }''',
    'archive-SELECT-ফলব্যাক (session306-সেফটি)')
P = APP + '/routes/daily.js'
apply_edit(
    P,
    'epaper-SELECT-ফলব্যাক (session306-সেফটি)',
    '''  let papers = [];
  try {
    papers = await db.prepare(
      "SELECT id, scheduled_date AS date, paper_name AS paperName, file_url AS fileUrl, drive_file_id AS fileId, drive_thumb_id AS thumbId, page_count AS pageCount, created_at FROM epaper_files WHERE published = 1 ORDER BY scheduled_date DESC, id ASC LIMIT 400"
    ).all();
  } catch (e) { papers = []; }''',
    '''  let papers = [];
  try {
    papers = await db.prepare(
      "SELECT id, scheduled_date AS date, paper_name AS paperName, file_url AS fileUrl, drive_file_id AS fileId, drive_thumb_id AS thumbId, page_count AS pageCount, created_at FROM epaper_files WHERE published = 1 ORDER BY scheduled_date DESC, id ASC LIMIT 400"
    ).all();
  } catch (e306pc) {
    // epaper-SELECT-ফলব্যাক (session306-সেফটি) — page_count-বিহীন অ-মাইগ্রেটেড-ডিবি (pageCount:null)
    try {
      papers = await db.prepare(
        "SELECT id, scheduled_date AS date, paper_name AS paperName, file_url AS fileUrl, drive_file_id AS fileId, drive_thumb_id AS thumbId, created_at FROM epaper_files WHERE published = 1 ORDER BY scheduled_date DESC, id ASC LIMIT 400"
      ).all();
    } catch (e306pc2) { papers = []; }
  }''',
    'epaper-SELECT-ফলব্যাক (session306-সেফটি)')

# ═══ পোস্ট-অ্যাসার্ট ═══
print('── পোস্ট-অ্যাসার্ট ──')
CHECKS = [
    (APP + '/db/schema.sql', ['page_count      INTEGER,']),
    (APP + '/db/migrate.js', ["ALTER TABLE epaper_files ADD COLUMN page_count INTEGER"]),
    (APP + '/routes/api-epaper.js', ['const _pcRaw', 'e306pc', 'archive-SELECT-ফলব্যাক (session306-সেফটি)', 'page_count = COALESCE(?, page_count)',
                                     'drive_thumb_id, page_count, source, published',
                                     'NULL, ?, ?, ?, 1', 'page_count AS pageCount, source',
                                     'paper, pageCount, mode:']),
    (APP + '/routes/daily.js', ['page_count AS pageCount, created_at FROM epaper_files', 'epaper-SELECT-ফলব্যাক (session306-সেফটি)']),
    (APP + '/views/user/epaper.ejs', ['pages: p.pageCount || null,', 'class="ep-pages306" data-pages="',
                                      '__epg306QA', 'data-pages="\' + (p.pages || \'\')']),
    (APP + '/public/assets/css/epaper.css', ['.ep-pages306', 'session306 — পৃষ্ঠা-সংখ্যা-ব্যাজ']),
    (BOT + '/src/index.ts', ["import { PDFDocument } from 'pdf-lib'", 'getPageCount()',
                             'pageCount?: number', 'pageCount: pageCount || undefined,',
                             'siteSync(msgDate, fileId, paperName, thumbId, pageCount)']),
]
for path, marks in CHECKS:
    t = rd(path)
    for m in marks:
        if m not in t:
            fatal('পোস্ট-অ্যাসার্ট-মিস: ' + path.split('/')[-1] + ' → ' + m[:52])
if not FATAL:
    # api-epaper/daily/migrate সিনট্যাক্স (node --check)
    for f in ['routes/api-epaper.js', 'routes/daily.js', 'db/migrate.js']:
        r = subprocess.run(['node', '--check', APP + '/' + f], capture_output=True, text=True)
        if r.returncode != 0:
            fatal('node --check ব্যর্থ: ' + f + ' → ' + r.stderr[:200])
        else:
            print('  ✓ node --check: ' + f)
    # EJS-কম্পাইল (epaper.ejs — '<%'-শূন্য-স্ক্রিপ্ট-সীমাবদ্ধতা-সহ পূর্ণ-টেমপ্লেট)
    r = subprocess.run(['node', '-e', """
const ejs = require('ejs');
const fs = require('fs');
const t = fs.readFileSync('%s/views/user/epaper.ejs', 'utf8');
try { ejs.compile(t); console.log('EJS-COMPILE-OK'); } catch (e) { console.error('EJS-FAIL: ' + e.message); process.exit(1); }
""" % APP], capture_output=True, text=True, cwd=APP)
    if r.returncode != 0 or 'EJS-COMPILE-OK' not in r.stdout:
        fatal('EJS-কম্পাইল ব্যর্থ: ' + (r.stderr or r.stdout)[:200])
    else:
        print('  ✓ EJS-কম্পাইল: user/epaper.ejs')
    # হেক্স-শূন্য — session306-ব্লক (মার্কার-থেকে-EOF)
    css = rd(APP + '/public/assets/css/epaper.css')
    blk = css[css.index('session306 — পৃষ্ঠা-সংখ্যা-ব্যাজ'):]
    hexes = re.findall(r'#[0-9a-fA-F]{3,8}\b', blk)
    if hexes:
        fatal('css-session306-ব্লকে হেক্স-আবিষ্কৃত: ' + ','.join(hexes[:5]))
    else:
        print('  ✓ হেক্স-শূন্য: css-session306-ব্লক')

print('')
if FATAL:
    print('❌ s306-patch: ' + str(len(FATAL)) + ' FATAL')
    sys.exit(1)
print('✅ s306-patch সম্পন্ন (ইডেমপোটেন্ট — পুনঃরান নিরাপদ)')
