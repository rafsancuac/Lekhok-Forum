#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
s272-patch.py — session272: কনটেন্ট রিভিশন হিস্ট্রি (/admin/content/history) তাৎক্ষণিক-ফিল্টার ch272 —
au270/av271-প্যাটার্ন-মিরর + **নতুন-ফিচার: রিভিশন-ডিলিট (POST /admin/content/history/delete)** —
view (content-history.ejs) + routes.js দ্বৈত-ফাইল-প্যাচ।

চুক্তি (PLANS session271-নোট থেকে):
  ① skip-if-present idempotent — পুনঃরানে SKIP-প্রমাণ
  ② নেমস্পেস-সংঘর্ষ-FATAL-গার্ড (.ch-/data-ch-row/__chQA — view + admin.css/tokens.css)
  ③ প্রতি-সম্পাদনা re.subn(count=1) + n==1-অ্যাসার্ট
  ④ সংরক্ষণ-মার্কার গণনা-অ্যাসার্ট (view + routes উভয়-স্তর)
  ⑤ hidden-গার্ড সঠিক-বাইট-অ্যাসার্ট ('[hidden]' — ডিসপ্লে-আর্টিফ্যাক্ট-নিরপেক্ষ)
  ⑥ হেক্স-শূন্য-পোস্ট-অ্যাসার্ট (নতুন-স্টাইল-ব্লক)
  ⑦ value-kw-তে whitespace-নরমালাইজেশন + slice(0,220) (au270-detail-গোটচা-অনুলিপি)
"""
import re, sys, io

VIEW = 'admin/views/admin/content-history.ejs'
ROUTES = 'admin/routes.js'
src = io.open(VIEW, encoding='utf-8').read()
rsrc = io.open(ROUTES, encoding='utf-8').read()

def fatal(msg):
    print('FATAL: ' + msg); sys.exit(1)

# ── ① skip-if-present (idempotent) ──
if 'chFilter272' in src:
    print('SKIP: s272-প্যাচ ইতিমধ্যে-উপস্থিত (chFilter272) — পুনঃপ্রয়োগ-নিষিদ্ধ (idempotent)')
    sys.exit(0)
if "router.post('/content/history/delete'" in rsrc:
    print('SKIP: s272-routes-প্যাচ ইতিমধ্যে-উপস্থিত (history/delete) — idempotent')
    sys.exit(1)

# ── ② নেমস্পেস-সংঘর্ষ-FATAL-গার্ড ──
COLLISION_TOKENS = ['ch-instant', 'data-ch-row', 'data-ch-empty', '__chQA',
                    'chFilter272', 'chClear272', 'chCount272', 'chZero272',
                    'chI272', 'chApply272', 'chClearFn272', 'chInstant272',
                    'ch-act272', 'ch-del272', 'history/delete']
for tok in COLLISION_TOKENS:
    if tok in src:
        fatal('নেমস্পেস-সংঘর্ষ: %r ইতিমধ্যে-উপস্থিত (view-স্তর)' % tok)
for tok in ['ch-instant', 'data-ch-row', '__chQA', 'ch-del272']:
    if tok in rsrc:
        fatal('নেমস্পেস-সংঘর্ষ: %r routes-স্তরে-উপস্থিত' % tok)
css = ''
try:
    css = io.open('public/assets/css/admin.css', encoding='utf-8').read()
except IOError:
    pass
tokens_css = ''
try:
    tokens_css = io.open('public/assets/css/tokens.css', encoding='utf-8').read()
except IOError:
    pass
# .ch- প্রিফিক্স নির্ণায়ক (সাবস্ট্রিং-যেমন 'attach-ch-' বৈধ — শুধু সিলেক্টর-বাউন্ড মিল FATAL)
for pat in [r'\.ch-[a-z]', r'data-ch-', r'__chQA', r'#chFilter272']:
    if re.search(pat, css) or re.search(pat, tokens_css):
        fatal('নেমস্পেস-সংঘর্ষ: প্যাটার্ন %r admin.css/tokens.css-এ-উপস্থিত' % pat)
for tok in ['--lf-brandgreen', '--lf-slate', '--lf-white', '--lf-fb-border',
            '--lf-brandgreen-soft', '--lf-brandgreen-soft-2', '--lf-brandgreen-deep']:
    if tok not in (css + tokens_css):
        fatal('টোকেন-অনুপস্থিত: %r' % tok)

# ── ④ প্রি-সংরক্ষণ-গণনা (view) ──
PRESERVE = {'style="padding:0;overflow:hidden;"': 1, '<table class="table">': 1,
            'class="empty"': 1, 'action="/admin/content/restore"': 1,
            'keys43': 1, 'name="key"': 1, 'fa-history': 2, 'typeof saved': 1,
            'btn-primary': 1, 'fa-undo': 2, 'subtitle': 1, 'rows.forEach': 1,
            'width:110px': 1}
for m, n in PRESERVE.items():
    c = src.count(m)
    if c != n:
        fatal('প্রি-সংরক্ষণ-গণনা-বেমান (view): %r প্রত্যাশা=%d বাস্তব=%d' % (m, n, c))
# routes প্রি-গণনা
RPRESERVE = {"router.post('/content/restore'": 1, "router.get('/content/history'": 1,
             'content_revisions': 9, "router.post('/content'": 1}
for m, n in RPRESERVE.items():
    c = rsrc.count(m)
    if c != n:
        fatal('প্রি-সংরক্ষণ-গণনা-বেমান (routes): %r প্রত্যাশা=%d বাস্তব=%d' % (m, n, c))

edits_done = []

def sub1(text, old, new, label):
    pat = re.escape(old)
    new_text, n = re.subn(pat, new.replace('\\', '\\\\'), text, count=1)
    if n != 1:
        fatal('অ্যাঙ্কর-মিল-ব্যর্থ (%s) — n=%d' % (label, n))
    return new_text

# ── E1: সারি-সারফেস (data-ch-row + data-kw — #id একক-প্রোব + value-নরমালাইজ) ──
OLD1 = """        <% rows.forEach(r => { %>
        <tr>
          <td>#<%= r.id %></td>"""
NEW1 = """        <% rows.forEach((r, chI272) => { %>
        <tr data-ch-row="<%= chI272 %>" data-kw="#<%= r.id %> রিভিশন revision সংস্করণ version সময় time <%= r.saved_at || '' %> ব্যবহারকারী user <%= r.saved_by || '' %> পুরনো-মান oldvalue <%= String(r.value || '').slice(0, 220).replace(/\\s+/g, ' ') %> ফেরত restore মুছুন delete">
          <td>#<%= r.id %></td>"""
src = sub1(src, OLD1, NEW1, 'E1-ch-row')
edits_done.append('E1-ch-row')

# ── E2: ch272 ফিল্টার-স্ট্রিপ (flash-পরে card-পূর্বে — always-rendered) ──
OLD2 = """  <% if (typeof saved !== 'undefined' && saved) { %><div class="flash ok"><i class="fas fa-undo"></i> পুরনো সংস্করণ ফেরত নেওয়া হয়েছে।</div><% } %>
  <div class="card" style="padding:0;overflow:hidden;">"""
NEW2 = """  <% if (typeof saved !== 'undefined' && saved) { %><div class="flash ok"><i class="fas fa-undo"></i> পুরনো সংস্করণ ফেরত নেওয়া হয়েছে।</div><% } %>
  <div class="ch-instant" id="chInstant272">
    <i class="fas fa-filter ch-instant-ico" aria-hidden="true"></i>
    <input type="text" id="chFilter272" class="ch-instant-input" placeholder="তাৎক্ষণিক ফিল্টার — ফিল্ড / ব্যবহারকারী / পুরনো মান" autocomplete="off" aria-label="রিভিশন-হিস্ট্রি তাৎক্ষণিক ফিল্টার" />
    <button type="button" id="chClear272" class="ch-instant-clear" aria-label="ফিল্টার মুছুন" hidden><i class="fas fa-times"></i></button>
    <span class="ch-count-chip" id="chCount272" hidden></span>
    <span class="ch-kbd-hint" aria-hidden="true"><kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন</span>
  </div>
  <div class="card" style="padding:0;overflow:hidden;">"""
src = sub1(src, OLD2, NEW2, 'E2-ch-strip')
edits_done.append('E2-ch-strip')

# ── E3: ch শূন্য-অবস্থা (card-পরে — always-rendered) ──
OLD3 = """    <% } %>
  </div>
</div>
</body>
</html>"""
NEW3 = """    <% } %>
  </div>
  <div class="ch-zero" id="chZero272" data-ch-empty hidden>
    <i class="fas fa-filter-circle-xmark" aria-hidden="true"></i>
    <span>কোনো রিভিশন মেলেনি — ফিল্টার মুছে আবার চেষ্টা করুন</span>
  </div>
</div>
</body>
</html>"""
src = sub1(src, OLD3, NEW3, 'E3-ch-zero')
edits_done.append('E3-ch-zero')

# ── E4: অ্যাকশন-td — flex-জোড়া (restore + নতুন delete-ফর্ম) + th-প্রস্থ ──
OLD4 = """          <td>
            <form method="POST" action="/admin/content/restore">
              <input type="hidden" name="rev_id" value="<%= r.id %>">
              <button class="btn btn-sm btn-primary" type="submit"><i class="fas fa-undo"></i> ফেরত</button>
            </form>
          </td>"""
NEW4 = """          <td>
            <div class="ch-act272">
              <form method="POST" action="/admin/content/restore">
                <input type="hidden" name="rev_id" value="<%= r.id %>">
                <button class="btn btn-sm btn-primary" type="submit" title="এই সংস্করণ ফেরত আনুন"><i class="fas fa-undo"></i> ফেরত</button>
              </form>
              <form method="POST" action="/admin/content/history/delete" class="ch-del272">
                <input type="hidden" name="rev_id" value="<%= r.id %>">
                <button class="btn btn-sm btn-danger" type="submit" title="রিভিশন মুছে ফেলুন"><i class="fas fa-trash"></i></button>
              </form>
            </div>
          </td>"""
src = sub1(src, OLD4, NEW4, 'E4-ch-actdel')
edits_done.append('E4-ch-actdel')

OLD4B = """<th style="width:110px;">অ্যাকশন</th>"""
NEW4B = """<th style="width:132px;">অ্যাকশন</th>"""
src = sub1(src, OLD4B, NEW4B, 'E4b-th-width')
edits_done.append('E4b-th-width')

# ── E5: JS + স্টাইল-ব্লক (</body>-পূর্বে) ──
OLD5 = """</div>
</body>
</html>"""
JS = """</div>
<script>
  (function () {
    /* session272 — ch272 তাৎক্ষণিক-ফিল্টার (au270/av271-প্যাটার্ন-মিরর, একক-স্ট্রিপ — 'f'-ফোকাস-মালিকানা-নির্দ্বিধা: data-kw-সারফেস + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস-ফিল্ড-গার্ড + Escape + __chQA — সারফেস-শূন্যে-ও-সংজ্ঞায়িত) */
    var rows = Array.prototype.slice.call(document.querySelectorAll('tr[data-ch-row]'));
    var input = document.getElementById('chFilter272');
    var clearBtn = document.getElementById('chClear272');
    var countChip = document.getElementById('chCount272');
    var zeroBox = document.getElementById('chZero272');
    if (!input) { return; }
    var total = rows.length;
    function chApply272() {
      var q = (input.value || '').trim().toLowerCase();
      var shown = 0;
      rows.forEach(function (row) {
        var kw = (row.getAttribute('data-kw') || '').toLowerCase();
        var hit = !q || kw.indexOf(q) !== -1;
        row.hidden = !hit;
        if (hit) { shown++; }
      });
      if (countChip) { countChip.hidden = !q; if (q) { countChip.textContent = shown + ' / ' + total; } }
      if (clearBtn) { clearBtn.hidden = !q; }
      if (zeroBox) { zeroBox.hidden = !(q && shown === 0); }
    }
    function chClearFn272() {
      input.value = '';
      chApply272();
      input.blur();
    }
    input.addEventListener('input', chApply272);
    if (clearBtn) { clearBtn.addEventListener('click', chClearFn272); }
    input.addEventListener('keydown', function (ch) {
      if (ch.key === 'Escape') { ch.stopPropagation(); chClearFn272(); }
    });
    document.addEventListener('keydown', function (ch) {
      if (ch.key !== 'f' || ch.altKey || ch.ctrlKey || ch.metaKey) { return; }
      var t = ch.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) { return; }
      ch.preventDefault();
      input.focus();
      input.select();
    });
    window.__chQA = {
      total: function () { return total; },
      count: function () { return rows.filter(function (r) { return !r.hidden; }).length; },
      apply: chApply272,
      clear: chClearFn272
    };
  })();
</script>
<style>
    /* session272 — ch272 তাৎক্ষণিক-ফিল্টার স্টাইল (au270-প্যাটার্ন-মিরর — হেক্স-শূন্য টোকেন-শুধু) */
    .ch-instant { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 0 0 14px; padding: 10px 14px; border: 1px solid var(--lf-fb-border); border-radius: 14px; background: var(--lf-white); }
    .ch-instant-ico { color: var(--lf-brandgreen); opacity: .75; }
    .ch-instant-input { flex: 1 1 230px; min-width: 0; border: 1px solid transparent; border-radius: 10px; padding: 8px 12px; font: inherit; color: var(--lf-slate); background: var(--lf-brandgreen-soft); transition: none; }
    .ch-instant-input:focus { outline: none; border-color: color-mix(in srgb, var(--lf-brandgreen) 45%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lf-brandgreen) 15%, transparent); }
    .ch-instant-clear { border: 0; background: transparent; color: var(--lf-brandgreen); cursor: pointer; padding: 6px 9px; border-radius: 9px; transition: none; }
    .ch-instant-clear:hover { background: var(--lf-brandgreen-soft); }
    .ch-instant-clear:active { transform: scale(.96); }
    .ch-count-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: .82rem; font-weight: 600; color: var(--lf-brandgreen-deep); background: var(--lf-brandgreen-soft-2); }
    .ch-count-chip[hidden] { display: none; }
    .ch-kbd-hint { display: inline-flex; align-items: center; gap: 5px; font-size: .78rem; color: var(--lf-slate); }
    .ch-kbd-hint kbd { padding: 2px 7px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); border-radius: 7px; font: inherit; font-size: .74rem; color: var(--lf-brandgreen-deep); background: var(--lf-white); }
    .ch-zero { display: flex; align-items: center; gap: 10px; margin: 0 0 14px; padding: 14px 16px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 35%, transparent); border-radius: 12px; color: var(--lf-slate); background: var(--lf-brandgreen-soft); }
    .ch-zero[hidden] { display: none; }
    .ch-act272 { display: flex; gap: 6px; align-items: center; }
    .ch-del272 { display: inline-flex; }
    tr[data-ch-row][hidden] { display: none !important; }
    @media (prefers-reduced-motion: reduce) { .ch-instant-clear:active { transform: none; } }
    @media (max-width: 640px) { .ch-kbd-hint { display: none; } .ch-instant { padding: 9px 11px; } }
  </style>
</body>
</html>"""
src = sub1(src, OLD5, JS, 'E5-js-style')
edits_done.append('E5-js-style')

# ── R1: routes.js — রিভিশন-ডিলিট রাউট (restore-র-পরে) ──
OLDR = """router.post('/content/restore', requireAdmin, async (req, res) => {
  const rev = await db.prepare('SELECT * FROM content_revisions WHERE id = ?').get(req.body.rev_id);
  if (!rev) return res.redirect('/admin/content/history?error=1');
  await setSetting(rev.key, rev.value);
  await TA42.audit(db, req, 'content-restore', 'settings', null, rev.key + ' → rev#' + rev.id);
  res.redirect('/admin/content/history?key=' + encodeURIComponent(rev.key) + '&saved=1');
});"""
NEWR = """router.post('/content/restore', requireAdmin, async (req, res) => {
  const rev = await db.prepare('SELECT * FROM content_revisions WHERE id = ?').get(req.body.rev_id);
  if (!rev) return res.redirect('/admin/content/history?error=1');
  await setSetting(rev.key, rev.value);
  await TA42.audit(db, req, 'content-restore', 'settings', null, rev.key + ' → rev#' + rev.id);
  res.redirect('/admin/content/history?key=' + encodeURIComponent(rev.key) + '&saved=1');
});
// সেশন ২৭২: রিভিশন-ডিলিট — পুরনো সংস্করণ ম্যানুয়ালি পরিষ্কার (history পরিচর্যা)
router.post('/content/history/delete', requireAdmin, async (req, res) => {
  const rev = await db.prepare('SELECT * FROM content_revisions WHERE id = ?').get(req.body.rev_id);
  if (!rev) return res.redirect('/admin/content/history?error=1');
  await db.prepare('DELETE FROM content_revisions WHERE id = ?').run(rev.id);
  await TA42.audit(db, req, 'revision-delete', 'content_revisions', rev.id, rev.key + ' rev#' + rev.id);
  res.redirect('/admin/content/history?key=' + encodeURIComponent(rev.key) + '&saved=1');
});"""
rsrc = sub1(rsrc, OLDR, NEWR, 'R1-ch-delete-route')
edits_done.append('R1-ch-delete-route')

# ── ④ পোস্ট-সংরক্ষণ-গণনা (view — E-সম্পাদনা-প্রভাব-সচেতন) ──
POST_PRESERVE = {'style="padding:0;overflow:hidden;"': 1, '<table class="table">': 1,
                 'class="empty"': 1, 'action="/admin/content/restore"': 1,
                 'keys43': 1, 'name="key"': 1, 'fa-history': 2, 'typeof saved': 1,
                 'btn-primary': 1, 'fa-undo': 2, 'subtitle': 1, 'rows.forEach': 2,
                 'width:132px': 1, 'btn-danger': 1, 'fa-trash': 1,
                 'action="/admin/content/history/delete"': 1}
for m, n in POST_PRESERVE.items():
    c = src.count(m)
    if c != n:
        fatal('পোস্ট-সংরক্ষণ-গণনা-বেমান (view): %r প্রত্যাশা=%d বাস্তব=%d' % (m, n, c))
# routes পোস্ট-গণনা
RPOST = {"router.post('/content/restore'": 1, "router.get('/content/history'": 1,
         'content_revisions': 12, "router.post('/content'": 1,
         "router.post('/content/history/delete'": 1}
for m, n in RPOST.items():
    c = rsrc.count(m)
    if c != n:
        fatal('পোস্ট-সংরক্ষণ-গণনা-বেমান (routes): %r প্রত্যাশা=%d বাস্তব=%d' % (m, n, c))

# ── ⑤ সঠিক-বাইট-অ্যাসার্ট ──
BYTE_ASSERTS = [
    'tr[data-ch-row][hidden] { display: none !important; }',
    '.ch-count-chip[hidden] { display: none; }',
    '.ch-zero[hidden] { display: none; }',
    'data-ch-row="<%= chI272 %>"',
    "ch.key !== 'f'",
    "window.__chQA",
    "router.post('/content/history/delete', requireAdmin",
]
for b in BYTE_ASSERTS:
    if b not in src and b not in rsrc:
        fatal('সঠিক-বাইট-অ্যাসার্ট-ব্যর্থ: %r অনুপস্থিত' % b[:60])

# ── ⑥ হেক্স-শূন্য-পোস্ট-অ্যাসার্ট (নতুন-স্টাইল-ব্লক) ──
mstyle = re.search(r'/\* session272 — ch272 তাৎক্ষণিক-ফিল্টার স্টাইল.*?</style>', src, re.S)
if not mstyle:
    fatal('স্টাইল-ব্লক-নির্ণয়-ব্যর্থ')
hexn = re.findall(r'#[0-9a-fA-F][0-9a-fA-F]{2,6}\b', mstyle.group(0))
if hexn:
    fatal('হেক্স-র্যাচেট-ব্যর্থ: নতুন-ব্লকে %d হেক্স %r' % (len(hexn), hexn[:4]))

io.open(VIEW, 'w', encoding='utf-8').write(src)
io.open(ROUTES, 'w', encoding='utf-8').write(rsrc)
print('PATCHED: s272 — %d-সম্পাদনা: %s' % (len(edits_done), ', '.join(edits_done)))
