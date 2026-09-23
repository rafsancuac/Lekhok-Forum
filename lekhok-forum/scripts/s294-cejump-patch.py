#!/usr/bin/env python3
# s294-cejump-patch.py — session294: কনটেন্ট-সম্পাদক তাৎক্ষণিক-জাম্প cej294
# সারফেস: admin/views/admin/content.ejs (১৪-পেজ-ট্যাব / ৪৫-গ্রুপ / ২৬৬-ফিল্ড — আসল-শূন্য-ফিল্টার-সারফেস স্ক্যান-প্রমাণিত)
# ফিচার: কীওয়ার্ড-সার্চ (লেবেল+মান+গ্রুপ+পেজ+হিন্ট) → ম্যাচ-লিস্ট (টপ-৮, textContent-নিরাপদ) + Enter/ক্লিক-জাম্প
#         (ট্যাব-অ্যাক্টিভেট + scrollIntoView + ফোকাস + ফ্ল্যাশ-রিং) + সক্রিয়-হাইড (ce-field/ce-group [hidden])
#         + কাউন্ট-চিপ (বাংলা-সংখ্যা: X ফিল্ড · Y পেজ) + শূন্য-অবস্থা + 'f'-ফোকাস-ফিল্ড-গার্ড + Escape-stopPropagation
# চুক্তি: ① idempotent (মার্কার-গার্ড-আগে; রান-২-এ তিন-ইনসার্ট-ই skip) ② স্টাইল-ব্লক হেক্স-শূন্য টোকেন-শুধু
#         ③ no-regression অ্যাঙ্কর ×৯ অক্ষুণ্ণ ④ স্ট্রিপ form-এর বাইরে (Enter-সাবমিট-নিরাপদ — ক্রম-অ্যাসার্ট)
# ⑤ QA-হুক __cej294QA (fields/pages/matches/pagesHit/activePage/firstMatch/apply/clear/jumpFirst) — সারফেস-শূন্যে-ও-সংজ্ঞায়িত
import io, re, sys

V = 'admin/views/admin/content.ejs'

HTML_MARK = 'cejStrip294'
CSS_MARK = 'cej294 তাৎক্ষণিক-জাম্প স্টাইল'
JS_MARK = '__cej294wired'

HTML_BLOCK = '''  <!-- session294: cej294 তাৎক্ষণিক-জাম্প (কনটেন্ট-সম্পাদক ফিল্ড-সার্চ — mo268/sb269/dcf293-পরিবার; form-বহির্ভূত — Enter-সাবমিট-নিরাপদ) -->
  <div class="cej294-instant" id="cejStrip294">
    <i class="fas fa-wand-magic-sparkles cej294-ico" aria-hidden="true"></i>
    <input type="text" id="cejJump294" class="cej294-input" placeholder="ফিল্ড-লেবেল / বর্তমান-লেখা খুঁজুন — Enter-এ জাম্প…" aria-label="কনটেন্ট ফিল্ড খুঁজুন ও জাম্প করুন" autocomplete="off">
    <button type="button" id="cejClear294" class="cej294-clear" hidden aria-label="ফিল্টার পরিষ্কার"><i class="fas fa-xmark"></i></button>
    <span class="cej294-count-chip" id="cejCount294" hidden><i class="fas fa-list-ul" aria-hidden="true"></i> <span id="cejCountTxt294">০ / ০</span></span>
    <span class="cej294-kbd-hint"><kbd>F</kbd> খুঁজুন · <kbd>Enter</kbd> জাম্প · <kbd>Esc</kbd> পরিষ্কার</span>
    <div class="cej294-list" id="cejList294" hidden></div>
  </div>
  <div class="cej294-zero" id="cejZero294" hidden><i class="fas fa-magnifying-glass-minus" aria-hidden="true"></i> কোনো ফিল্ড মেলে-না — অন্য কীওয়ার্ড দিন</div>
'''

CSS_BLOCK = '''<style>
  /* session294 — cej294 তাৎক্ষণিক-জাম্প স্টাইল (dcf293-প্যাটার্ন-মিরর — হেক্স-শূন্য টোকেন-শুধু; brandgreen-পরিবার) */
  .cej294-instant { position: relative; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 0 0 14px; padding: 10px 14px; border: 1px solid var(--lf-fb-border); border-radius: 14px; background: var(--lf-white); }
  .cej294-ico { color: var(--lf-brandgreen-deep); opacity: .75; }
  .cej294-input { flex: 1 1 240px; min-width: 0; border: 1px solid transparent; border-radius: 10px; padding: 8px 12px; font: inherit; color: var(--lf-slate); background: var(--lf-brandgreen-soft); }
  .cej294-input:focus { outline: none; border-color: color-mix(in srgb, var(--lf-brandgreen-deep) 45%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lf-brandgreen-deep) 15%, transparent); }
  .cej294-clear { border: 0; background: transparent; color: var(--lf-brandgreen-deep); cursor: pointer; padding: 6px 9px; border-radius: 9px; }
  .cej294-clear:hover { background: var(--lf-brandgreen-soft); }
  .cej294-clear:active { transform: scale(.96); }
  .cej294-count-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: .82rem; font-weight: 600; color: var(--lf-brandgreen-deep); background: var(--lf-brandgreen-soft); }
  .cej294-kbd-hint { display: inline-flex; align-items: center; gap: 5px; font-size: .78rem; color: var(--lf-slate); }
  .cej294-kbd-hint kbd { padding: 2px 7px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen-deep) 55%, transparent); border-radius: 7px; font: inherit; font-size: .74rem; color: var(--lf-brandgreen-deep); background: var(--lf-white); }
  .cej294-list { position: absolute; top: calc(100% + 6px); left: 0; right: 0; z-index: 60; display: flex; flex-direction: column; gap: 4px; max-height: 320px; overflow-y: auto; padding: 8px; border: 1px solid var(--lf-fb-border); border-radius: 12px; background: var(--lf-white); box-shadow: 0 10px 28px color-mix(in srgb, var(--lf-slate) 22%, transparent); }
  .cej294-m { display: flex; align-items: center; gap: 8px; width: 100%; text-align: left; border: 0; background: transparent; padding: 7px 9px; border-radius: 9px; font: inherit; cursor: pointer; }
  .cej294-m:hover { background: var(--lf-brandgreen-soft); }
  .cej294-m-page { flex: none; font-size: .72rem; font-weight: 700; color: var(--lf-brandgreen-deep); background: var(--lf-brandgreen-soft); border-radius: 999px; padding: 2px 8px; }
  .cej294-m-group { flex: none; font-size: .74rem; color: var(--lf-slate); }
  .cej294-m-label { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: .82rem; font-weight: 600; color: var(--lf-slate-deep); }
  .cej294-m-val { margin-left: auto; flex: none; max-width: 34%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: .74rem; color: var(--lf-slate); }
  .cej294-zero { display: flex; align-items: center; gap: 10px; margin: 0 0 14px; padding: 14px 16px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen-deep) 35%, transparent); border-radius: 12px; color: var(--lf-slate); background: var(--lf-brandgreen-soft); }
  .cej294-count-chip[hidden], .cej294-zero[hidden], .cej294-clear[hidden], .cej294-list[hidden] { display: none; }
  .ce-field[hidden] { display: none !important; }
  .ce-group[hidden] { display: none !important; }
  .cej294-flash { box-shadow: 0 0 0 3px color-mix(in srgb, var(--lf-brandgreen) 40%, transparent); border-radius: 8px; }
  @media (prefers-reduced-motion: reduce) { .cej294-clear:active { transform: none; } }
  @media (max-width: 640px) { .cej294-kbd-hint { display: none; } .cej294-instant { padding: 9px 11px; } .cej294-m-val { display: none; } }
</style>
'''

JS_BLOCK = '''<script>
(function () {
  'use strict';
  /* session294 — cej294 তাৎক্ষণিক-জাম্প (কনটেন্ট-সম্পাদক ফিল্ড-সার্চ: পেজ+গ্রুপ+লেবেল+মান+হিন্ট-মিল;
     ম্যাচ-লিস্ট (টপ-৮; createElement+textContent — মান-ইনজেকশন-নিরাপদ) + Enter-জাম্প + সক্রিয়-হাইড
     + 'f'-ফোকাস-ফিল্ড-গার্ড + Escape-stopPropagation + __cej294QA — সারফেস-শূন্যে-ও-সংজ্ঞায়িত) */
  if (window.__cej294wired) return; window.__cej294wired = true;
  var input = document.getElementById('cejJump294');
  var clearBtn = document.getElementById('cejClear294');
  var countChip = document.getElementById('cejCount294');
  var countTxt = document.getElementById('cejCountTxt294');
  var listBox = document.getElementById('cejList294');
  var zeroBox = document.getElementById('cejZero294');
  if (!input) return;
  var bn294 = function (n) { return String(n).replace(/\\d/g, function (d) { return '০১২৩৪৫৬৭৮৯'[+d]; }); };
  var norm294 = function (s) { return (s || '').replace(/\\s+/g, ' ').trim().toLowerCase(); };
  var pageLabel294 = {};
  Array.prototype.slice.call(document.querySelectorAll('.ce-tab')).forEach(function (t) {
    var lb = t.querySelector('.ce-tab-label');
    pageLabel294[t.getAttribute('data-page')] = lb ? lb.textContent.trim() : (t.getAttribute('data-page') || '');
  });
  var idx294 = [];
  Array.prototype.slice.call(document.querySelectorAll('.ce-panel')).forEach(function (panel) {
    var pk = panel.getAttribute('data-page') || '';
    Array.prototype.slice.call(panel.querySelectorAll('.ce-group')).forEach(function (group) {
      var gt = group.querySelector('.ce-group-title');
      var gl = gt ? gt.textContent.replace(/\\d+\\s*$/, '').trim() : '';
      Array.prototype.slice.call(group.querySelectorAll('.ce-field')).forEach(function (f) {
        var lb = f.querySelector('.ce-label-row label');
        var fld = f.querySelector('input[type=text], textarea');
        var hint = f.querySelector('.ce-hint');
        idx294.push({
          el: f, fld: fld, page: pk, group: gl,
          label: lb ? lb.textContent.trim() : '',
          kw: norm294([pageLabel294[pk], gl, lb ? lb.textContent : '', fld ? fld.value : '', hint ? hint.textContent : ''].join(' ')),
          hit: true
        });
      });
    });
  });
  var last294 = [];
  function cejActive294() { return !!(input.value || '').trim(); }
  function cejApply294() {
    var q = norm294(input.value);
    var act = cejActive294();
    last294 = [];
    idx294.forEach(function (m) {
      m.hit = !q || m.kw.indexOf(q) !== -1;
      if (m.hit) { last294.push(m); }
      if (m.el) { if (act && !m.hit) { m.el.setAttribute('hidden', ''); } else { m.el.removeAttribute('hidden'); } }
    });
    Array.prototype.slice.call(document.querySelectorAll('.ce-panel .ce-group')).forEach(function (g) {
      var any = Array.prototype.slice.call(g.querySelectorAll('.ce-field')).some(function (f) { return !f.hasAttribute('hidden'); });
      if (act && !any) { g.setAttribute('hidden', ''); } else { g.removeAttribute('hidden'); }
    });
    var ph = {};
    last294.forEach(function (m) { ph[m.page] = 1; });
    if (countChip) { countChip.hidden = !act; if (act && countTxt) { countTxt.textContent = bn294(last294.length) + ' ফিল্ড · ' + bn294(Object.keys(ph).length) + ' পেজ'; } }
    if (clearBtn) { clearBtn.hidden = !act; }
    if (zeroBox) { zeroBox.hidden = !(act && last294.length === 0); }
  }
  function cejRender294() {
    if (!listBox) return;
    listBox.textContent = '';
    if (!cejActive294() || last294.length === 0) { listBox.hidden = true; return; }
    last294.slice(0, 8).forEach(function (m) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'cej294-m';
      var sp = document.createElement('span'); sp.className = 'cej294-m-page'; sp.textContent = pageLabel294[m.page] || m.page;
      var sg = document.createElement('span'); sg.className = 'cej294-m-group'; sg.textContent = m.group;
      var sl = document.createElement('span'); sl.className = 'cej294-m-label'; sl.textContent = m.label;
      b.appendChild(sp); b.appendChild(sg); b.appendChild(sl);
      var vv = m.fld ? String(m.fld.value || '').slice(0, 60) : '';
      if (vv) { var sv = document.createElement('span'); sv.className = 'cej294-m-val'; sv.textContent = vv; b.appendChild(sv); }
      b.addEventListener('click', function () { cejJump294(m); });
      listBox.appendChild(b);
    });
    listBox.hidden = false;
  }
  function cejJump294(m) {
    if (!m || !m.el) return 0;
    var tab = document.querySelector('.ce-tab[data-page="' + m.page + '"]');
    var panel = m.el.closest('.ce-panel');
    if (tab && panel && !panel.classList.contains('active')) { tab.click(); }
    var g = m.el.closest('.ce-group');
    if (g) { g.removeAttribute('hidden'); }
    m.el.removeAttribute('hidden');
    try { m.el.scrollIntoView({ block: 'center' }); } catch (e) {}
    m.el.classList.add('cej294-flash');
    if (m.fld) { try { m.fld.focus(); } catch (e) {} }
    setTimeout(function () { m.el.classList.remove('cej294-flash'); }, 1600);
    if (listBox) { listBox.hidden = true; }
    return 1;
  }
  function cejJumpFirst294() { return last294.length ? cejJump294(last294[0]) : 0; }
  function cejClear294() {
    input.value = '';
    cejApply294();
    if (listBox) { listBox.hidden = true; }
    input.blur();
  }
  input.addEventListener('input', function () { cejApply294(); cejRender294(); });
  input.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') { ev.stopPropagation(); cejClear294(); }
    if (ev.key === 'Enter') { ev.preventDefault(); cejJumpFirst294(); }
  });
  if (clearBtn) { clearBtn.addEventListener('click', cejClear294); }
  document.addEventListener('click', function (ev) {
    if (listBox && !listBox.hidden && !listBox.contains(ev.target) && ev.target !== input) { listBox.hidden = true; }
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key !== 'f' || ev.altKey || ev.ctrlKey || ev.metaKey) { return; }
    var t = ev.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) { return; }
    ev.preventDefault();
    input.focus();
    input.select();
  });
  window.__cej294QA = {
    fields: function () { return idx294.length; },
    pages: function () { return Object.keys(pageLabel294).length; },
    matches: function () { return last294.length; },
    pagesHit: function () { var s = {}; last294.forEach(function (m) { s[m.page] = 1; }); return Object.keys(s).length; },
    activePage: function () { var p = document.querySelector('.ce-panel.active'); return p ? p.getAttribute('data-page') : ''; },
    firstMatch: function () { return last294.length ? { page: last294[0].page, label: last294[0].label } : null; },
    apply: cejApply294,
    clear: cejClear294,
    jumpFirst: cejJumpFirst294
  };
})();
</script>
'''

def main():
    try:
        src = io.open(V, 'r', encoding='utf-8').read()
    except OSError:
        print('FATAL: view-ফাইল নেই:', V); return 1

    changed = False

    # মার্কার-গার্ড-আগে (idempotency — s293/s290-রীতি)
    if HTML_MARK in src:
        print('skip: HTML ইতিমধ্যে-উপস্থিত (', HTML_MARK, ')')
    else:
        anchor = '  <% if (saved) { %>'
        if src.count(anchor) != 1:
            print('FATAL: HTML-অ্যাঙ্কর অস্পষ্ট (count=', src.count(anchor), ')'); return 1
        src = src.replace(anchor, HTML_BLOCK + anchor, 1)
        changed = True
        print('ok: HTML-স্ট্রিপ সন্নিবেশ')

    if CSS_MARK in src:
        print('skip: CSS ইতিমধ্যে-উপস্থিত')
    else:
        anchor = '</body>'
        if src.count(anchor) != 1:
            print('FATAL: </body>-অ্যাঙ্কর অস্পষ্ট'); return 1
        src = src.replace(anchor, CSS_BLOCK + anchor, 1)
        changed = True
        print('ok: CSS-ব্লক সন্নিবেশ')

    if JS_MARK in src:
        print('skip: JS ইতিমধ্যে-উপস্থিত')
    else:
        anchor = '</body>'
        src = src.replace(anchor, JS_BLOCK + anchor, 1)
        changed = True
        print('ok: JS-ব্লক সন্নিবেশ')

    if changed:
        io.open(V, 'w', encoding='utf-8').write(src)
        print('ok: লেখা-সম্পন্ন')

    # ── পোস্ট-অ্যাসার্ট (প্রতি-রানে) ──
    src = io.open(V, 'r', encoding='utf-8').read()
    errs = []
    for m in ['cejStrip294', 'cejJump294', 'cejClear294', 'cejCount294', 'cejCountTxt294',
              'cejList294', 'cejZero294', JS_MARK, 'window.__cej294QA', 'cej294-flash',
              "if (ev.key === 'Escape') { ev.stopPropagation()", 'cejJumpFirst294',
              'createElement(', 'textContent']:
        if m not in src: errs.append('মার্কার-অনুপস্থিত: ' + m)
    # হেক্স-শূন্য স্টাইল-ব্লক
    mb = re.search(re.escape('/* session294 — ' + CSS_MARK) + r'.*?</style>', src, re.S)
    if not mb:
        errs.append('স্টাইল-ব্লক-নিষ্কাশন-ব্যর্থ')
    else:
        blk = mb.group(0)
        hexes = re.findall(r'#[0-9a-fA-F]{3,8}', blk)
        if hexes: errs.append('স্টাইল-ব্লকে হেক্স %d: %s' % (len(hexes), hexes[:3]))
        for g in ['.ce-field[hidden] { display: none !important; }',
                  '.ce-group[hidden] { display: none !important; }',
                  'color-mix(in srgb, var(--lf-brandgreen-deep) 45%, transparent)',
                  'prefers-reduced-motion', 'max-width: 640px']:
            if g not in blk: errs.append('স্টাইল-গার্ড-অনুপস্থিত: ' + g)
    # ক্রম-অ্যাসার্ট: স্ট্রিপ form-এর আগে (Enter-সাবমিট-নিরাপদ)
    if src.find('cejStrip294') > src.find('id="contentForm"'):
        errs.append('ক্রম-ভাঙা: স্ট্রিপ form-এর ভিতরে পড়েছে')
    # no-regression অ্যাঙ্কর ×৯
    for g in ['id="contentForm"', 'id="ceActivePage"', 'function showPage', 'ce-edit-btn',
              'ceSavebar', 'id="ceDirtyCount"', 'uploadImage', "include('partials/sidebar')",
              'ce-group-status']:
        if g not in src: errs.append('no-reg-অ্যাঙ্কর-অনুপস্থিত: ' + g)
    # টেমপ্লেট-মার্কআপ অক্ষুণ্ণ (সোর্সে ce-field-লাইন ১-বার — EJS-টেমপ্লেট; রেন্ডার্ড-২৬৬ সুইট-স্তরে)
    nf = src.count('<div class="ce-field ce-t-')
    if nf != 1: errs.append('ce-field-টেমপ্লেট-লাইন-অস্বাভাবিক: %d (১-প্রত্যাশিত)' % nf)

    if errs:
        print('FATAL পোস্ট-অ্যাসার্ট:')
        for e in errs: print('  -', e)
        return 1
    print('POST-ASSERT-OK (fields=%d)' % nf)
    return 0

if __name__ == '__main__':
    sys.exit(main())
