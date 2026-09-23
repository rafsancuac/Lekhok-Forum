#!/usr/bin/env python3
# s256-patch.py — session256: লেখা-কিউরেশন (/moderator/curation) তাৎক্ষণিক-ফিল্টার (cu256)
# চুক্তি: mc254/mm255-প্যাটার্ন-মিরর — data-kw-সারি + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস (field-গার্ড) + Escape-ক্লিয়ার+ব্লার + __cuQA হুক
# স্টাইল: cu256-ব্লক হেক্স-শূন্য টোকেন-শুধু (guard-র্যাচেট-নিরাপদ) — color-mix brandgreen ফোকাস-রিং + kbd-পিল + :active প্রেস + reduced-motion-জোড়া + 640px-সংকোচন + hidden-গার্ড
# নিরাপত্তা: present-marker → skip-if-present (idempotent পুনঃরান-নিরাপদ — s255-প্যাটার্ন; MultiEdit-আংশিক-প্রয়োগ-শিক্ষা)
import sys, io

VIEW = "/home/z/lekhok-forum/lekhok-forum/lekhok-forum/views/user/moderator-curation.ejs"

with io.open(VIEW, "r", encoding="utf-8") as f:
    src = f.read()

if "data-cu-row" in src:
    print("SKIP: cu256 already present (idempotent)")
    sys.exit(0)

edits = []

# ── এডিট-১: forEach-সূচক ──
old1 = "writings.forEach(a => {"
new1 = "writings.forEach((a, cuI256) => {"
edits.append((old1, new1))

# ── এডিট-২: data-kw কনস্ট (লুপ-কনস্ট-ব্লকে) ──
old2 = ("         const kindIco90 = a.post_kind === 'avatar_update' ? 'fa-user-circle' : a.post_kind === 'cover_update' ? 'fa-image' : 'fa-feather-alt';\n"
        "    %>")
new2 = ("         const kindIco90 = a.post_kind === 'avatar_update' ? 'fa-user-circle' : a.post_kind === 'cover_update' ? 'fa-image' : 'fa-feather-alt';\n"
        "         const cuKw256 = [(a.title || ''), (a.excerpt || ''), (a.author_name || ''), '@' + (a.author_username || ''), kindLabel90, (a.home_featured ? 'হোম নির্বাচিত featured' : ''), (a.home_cover ? 'প্রচ্ছদ cover' : ''), (a.featured ? 'সেরা-লেখক best' : ''), (a.status === 'hidden' ? 'লুকানো hidden' : ''), (!a.archive_visible ? 'তালিকায়-বাদ excluded' : ''), (!isWriting90 ? 'সোশ্যাল social' : '')].filter(Boolean).join(' ');\n"
        "    %>")
edits.append((old2, new2))

# ── এডিট-৩: সারি-অ্যাট্রিবিউট (data-cu-row + data-kw) ──
old3 = 'data-id="<%= a.id %>" data-kind="<%= a.post_kind || \'writing\' %>">'
new3 = 'data-id="<%= a.id %>" data-kind="<%= a.post_kind || \'writing\' %>" data-cu-row="<%= cuI256 %>" data-kw="<%= cuKw256 %>">'
edits.append((old3, new3))

# ── এডিট-৪: তাৎক্ষণিক-ফিল্টার UI (cur-quick-এর-আগে) ──
old4 = '    <div class="cur-quick">'
new4 = (
    "    <div class=\"cu-instant\" id=\"cuInstant256\">\n"
    "      <i class=\"fas fa-filter cu-instant-ico\" aria-hidden=\"true\"></i>\n"
    "      <input type=\"text\" id=\"cuFilter256\" class=\"cu-instant-input\" placeholder=\"তাৎক্ষণিক ফিল্টার — শিরোনাম / লেখক / ধরন / অবস্থা\" autocomplete=\"off\" aria-label=\"তাৎক্ষণিক ফিল্টার\" />\n"
    "      <button type=\"button\" id=\"cuClear256\" class=\"cu-instant-clear\" aria-label=\"ফিল্টার মুছুন\" hidden><i class=\"fas fa-times\"></i></button>\n"
    "      <span class=\"cu-count-chip\" id=\"cuCount256\" hidden></span>\n"
    "      <span class=\"cu-kbd-hint\" aria-hidden=\"true\"><kbd>f</kbd> ফোকাস · <kbd>Esc</kbd> মুছুন</span>\n"
    "    </div>\n"
    "    <div class=\"cu-zero\" id=\"cuZero256\" data-cu-empty hidden>\n"
    "      <i class=\"fas fa-feather-pointed\" aria-hidden=\"true\"></i>\n"
    "      <span>কোনো লেখা মেলেনি — ফিল্টার মুছে আবার চেষ্টা করুন</span>\n"
    "    </div>\n"
    "    <div class=\"cur-quick\">"
)
edits.append((old4, new4))

# ── এডিট-৫: স্টাইল + স্ক্রিপ্ট (main.js-include-এর-আগে) ──
old5 = '<script src="/assets/js/main.js?v=<%= AV %>"></script>'
new5 = (
    "<style>\n"
    "/* session256 — লেখা-কিউরেশন তাৎক্ষণিক-ফিল্টার (cu256 — হেক্স-শূন্য টোকেন-শুধু; au251/mc254/mm255-মিরর) */\n"
    ".cu-instant { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 12px 0 6px; padding: 10px 14px; border: 1px solid var(--lf-fb-border); border-radius: 14px; background: var(--lf-white); }\n"
    ".cu-instant-ico { color: var(--lf-brandgreen); opacity: .75; }\n"
    ".cu-instant-input { flex: 1 1 230px; min-width: 0; border: 1px solid transparent; border-radius: 10px; padding: 8px 12px; font: inherit; color: var(--lf-slate); background: var(--lf-brandgreen-soft); transition: none; }\n"
    ".cu-instant-input:focus { outline: none; border-color: color-mix(in srgb, var(--lf-brandgreen) 45%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--lf-brandgreen) 15%, transparent); }\n"
    ".cu-instant-clear { border: 0; background: transparent; color: var(--lf-brandgreen); cursor: pointer; padding: 6px 9px; border-radius: 9px; transition: none; }\n"
    ".cu-instant-clear:hover { background: var(--lf-brandgreen-soft); }\n"
    ".cu-instant-clear:active { transform: scale(.96); }\n"
    ".cu-count-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: .82rem; font-weight: 600; color: var(--lf-brandgreen-deep); background: var(--lf-brandgreen-soft-2); }\n"
    ".cu-kbd-hint { display: inline-flex; align-items: center; gap: 5px; font-size: .78rem; color: var(--lf-slate); }\n"
    ".cu-kbd-hint kbd { padding: 2px 7px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 55%, transparent); border-radius: 7px; font: inherit; font-size: .74rem; color: var(--lf-brandgreen-deep); background: var(--lf-white); }\n"
    ".cu-zero { display: flex; align-items: center; gap: 10px; margin: 8px 0 4px; padding: 14px 16px; border: 1px dashed color-mix(in srgb, var(--lf-brandgreen) 35%, transparent); border-radius: 12px; color: var(--lf-slate); background: var(--lf-brandgreen-soft); }\n"
    ".cu-zero[hidden] { display: none; }\n"
    ".cur-item[data-cu-row][hidden] { display: none !important; }\n"
    "@media (prefers-reduced-motion: reduce) { .cu-instant-clear:active { transform: none; } }\n"
    "@media (max-width: 640px) { .cu-kbd-hint { display: none; } .cu-instant { padding: 9px 11px; border-radius: 12px; } }\n"
    "</style>\n"
    "<script>\n"
    "(function () {\n"
    "  'use strict';\n"
    "  /* session256 — cu256 তাৎক্ষণিক-ফিল্টার (mc254/mm255-চুক্তি-মিরর: data-kw-সারি + কাউন্ট-চিপ + শূন্য-অবস্থা + 'f'-ফোকাস + Escape + __cuQA) */\n"
    "  var rows = Array.prototype.slice.call(document.querySelectorAll('.cur-item[data-cu-row]'));\n"
    "  var input = document.getElementById('cuFilter256');\n"
    "  var clearBtn = document.getElementById('cuClear256');\n"
    "  var countChip = document.getElementById('cuCount256');\n"
    "  var zeroBox = document.getElementById('cuZero256');\n"
    "  if (!input || !rows.length) { return; }\n"
    "  var total = rows.length;\n"
    "  function cuApply256() {\n"
    "    var q = (input.value || '').trim().toLowerCase();\n"
    "    var shown = 0;\n"
    "    rows.forEach(function (row) {\n"
    "      var kw = (row.getAttribute('data-kw') || '').toLowerCase();\n"
    "      var hit = !q || kw.indexOf(q) !== -1;\n"
    "      row.hidden = !hit;\n"
    "      if (hit) { shown++; }\n"
    "    });\n"
    "    if (countChip) { countChip.hidden = !q; if (q) { countChip.textContent = shown + ' / ' + total; } }\n"
    "    if (clearBtn) { clearBtn.hidden = !q; }\n"
    "    if (zeroBox) { zeroBox.hidden = !(q && shown === 0); }\n"
    "  }\n"
    "  function cuClear256() {\n"
    "    input.value = '';\n"
    "    cuApply256();\n"
    "    input.blur();\n"
    "  }\n"
    "  input.addEventListener('input', cuApply256);\n"
    "  if (clearBtn) { clearBtn.addEventListener('click', cuClear256); }\n"
    "  input.addEventListener('keydown', function (ev) {\n"
    "    if (ev.key === 'Escape') { ev.stopPropagation(); cuClear256(); }\n"
    "  });\n"
    "  document.addEventListener('keydown', function (ev) {\n"
    "    if (ev.key !== 'f' || ev.altKey || ev.ctrlKey || ev.metaKey) { return; }\n"
    "    var t = ev.target;\n"
    "    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) { return; }\n"
    "    ev.preventDefault();\n"
    "    input.focus();\n"
    "    input.select();\n"
    "  });\n"
    "  window.__cuQA = {\n"
    "    total: function () { return total; },\n"
    "    count: function () { return rows.filter(function (r) { return !r.hidden; }).length; },\n"
    "    apply: cuApply256,\n"
    "    clear: cuClear256\n"
    "  };\n"
    "})();\n"
    "</script>\n"
    "<script src=\"/assets/js/main.js?v=<%= AV %>\"></script>"
)
edits.append((old5, new5))

# ── প্রয়োগ (FATAL-অ্যাংকর-মিস-গার্ড — প্রতিটি হুক-বহুবার-অদৃশ্য হতে হবে না) ──
out = src
applied = 0
for i, (o, n) in enumerate(edits, 1):
    cnt = out.count(o)
    if cnt != 1:
        print("FATAL: edit-%d anchor count=%d (অবশ্যই ১)" % (i, cnt))
        sys.exit(1)
    out = out.replace(o, n)
    applied += 1

with io.open(VIEW, "w", encoding="utf-8") as f:
    f.write(out)

# ── ইনভেন্টরি-যাচাই (MultiEdit-আংশিক-প্রয়োগ-শিক্ষা — প্রতি-টার্গেট গ্রিপ) ──
checks = [
    ("forEach-index", "cuI256"),
    ("kw-const", "cuKw256"),
    ("row-attr", 'data-cu-row="<%= cuI256 %>"'),
    ("filter-input", 'id="cuFilter256"'),
    ("count-chip", 'id="cuCount256"'),
    ("zero-box", 'data-cu-empty'),
    ("kbd-hint", "cu-kbd-hint"),
    ("style-marker", "cu256 — হেক্স-শূন্য"),
    ("hidden-guard", ".cur-item[data-cu-row][hidden]"),
    ("hook", "__cuQA"),
]
inv_ok = True
for name, pat in checks:
    c = out.count(pat)
    print("  %-14s ×%d" % (name, c))
    if c == 0:
        inv_ok = False
if not inv_ok:
    print("FATAL: ইনভেন্টরি-শূন্য — রোলব্যাক-প্রয়োজন")
    sys.exit(1)
print("OK: cu256 প্যাচ প্রয়োগ (%d-এডিট, ইনভেন্টরি-গ্রিন)" % applied)
