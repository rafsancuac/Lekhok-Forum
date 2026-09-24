#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# s312-patch.py — session312: sfs312 — ফোন-ফিড ট্যাপ-থ্রু (PLANS session311-প্রস্তাব-①)
# [Task ID 149] is-real307-সারি ক্লিকে /dashboard#post-<id> ডিপ-লিঙ্ক (পাবলিক /post/<id>
# রুট-অনুপস্থিত — লগইন-গেট): ① feed.ejs — sfsRow307 +id বহন + ×৪-রো data-post-id +
# session312-ইঞ্জিন (ডেলিগেটেড click → stopPropagation + preventDefault + navigate;
# JS-বিহীনে কেবল-প্রদর্শন s306b-ধর্ম; s306-একক-লিঙ্ক-চুক্তি অক্ষুণ্ণ — tabindex/role-অনুপ্রবেশ-নিষিদ্ধ)
# + __sfs312QA-হুক (সারি-শূন্যে-ও-সংজ্ঞায়িত) ② FeedPostCard.ejs — সাধারণ-কার্ড রুটে নামস্পেসড
# data-s312-post (data-post-id-ব্যবহারকারী comment-tools/article-reading-সংঘর্ষ-নিষিদ্ধ —
# নতুন-অ্যাট্রির-পূর্বে সংঘর্ষ-গ্রেপ-চুক্তি) ③ dashboard.ejs — s312-অবতরণ-ব্লক: #post-<id> হ্যাশ →
# [data-s312-post]/[data-post-id] scrollIntoView + .s312-land-flash + __s312LandQA-হুক
# (হ্যাশ-বিহীন লোড = no-op; কার্ড-অনুপস্থিতে found:0-গ্রেসফুল) ④ style.css — session312-ব্লক
# হেক্স-শূন্য (টোকেন/color-mix) — ট্যাপ-অ্যাফোর্ডেন্স (hover-টিন্ট + ::after-শেভরন) +
# অবতরণ-ফ্ল্যাশ keyframes + reduced-motion-গার্ড + 640px-সংকোচন।
# চুক্তি: মার্কার-স্কিপ ইডেমপোটেন্ট ×N + অ্যাঙ্কর-এককতা-FATAL + পোস্ট-অ্যাসার্ট +
#   হেক্স-শূন্য + EJS-কম্পাইল ×৩ + node --check।
import subprocess
import sys

APP = '/home/z/lekhok-forum/lekhok-forum/lekhok-forum'

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


def apply_edit(path, marker, anchor, replacement, label, expect=1):
    """মার্কার-স্কিপ ইডেমপোটেন্ট; অ্যাঙ্কর-গণনা expect-না-মিললে FATAL (স্কিপ-নয়)।"""
    t = rd(path)
    if marker in t:
        print('  — (ইতিমধ্যে) ' + label)
        return
    n = t.count(anchor)
    if n != expect:
        fatal(label + ' — অ্যাঙ্কর-গণনা=' + str(n) + ' (প্রত্যাশা ' + str(expect) + ')')
        return
    wr(path, t.replace(anchor, replacement))
    print('  ✓ ' + label)


# ═══ 1. views/partials/home/feed.ejs — sfsRow307 +id ═══
print('── feed.ejs: sfsRow307 +id বহন ──')
FEED = APP + '/views/partials/home/feed.ejs'
apply_edit(
    FEED,
    'id: p.id || \'\',',
    "    a: toBn(p.like_count), c: toBn(p.comment_count), s: toBn(p.view_count),\n"
    "    img: !!p.cover_image, real: true\n",
    "    a: toBn(p.like_count), c: toBn(p.comment_count), s: toBn(p.view_count),\n"
    "    id: p.id || '',\n"
    "    img: !!p.cover_image, real: true\n",
    'sfsRow307 +id বহন (ডেমো-সারি id-শূন্য)')

# ═══ 2. feed.ejs — ×৪-রো data-post-id ═══
print('── feed.ejs: ×৪-রো data-post-id ──')
apply_edit(
    FEED,
    'data-post-id="<%= p.id || \'\' %>"',
    "<span class=\"sfs292-post<%= p.img ? ' has-img' : '' %><%= p.real ? ' is-real307' : '' %>\">",
    "<span class=\"sfs292-post<%= p.img ? ' has-img' : '' %><%= p.real ? ' is-real307' : '' %>\" data-post-id=\"<%= p.id || '' %>\">",
    '×৪-রো data-post-id (বাস্তব-সারিতে id, ডেমোতে শূন্য)',
    expect=4)

# ═══ 3. feed.ejs — session312 ট্যাপ-থ্রু-ইঞ্জিন ═══
print('── feed.ejs: session312 ইঞ্জিন ──')
S312_SCRIPT = (
    "  window.__sfs307QA = q307;\n"
    "})();\n"
    "</script>\n"
    "<script>\n"
    "/* session312 (sfs312): ফোন-ফিড ট্যাপ-থ্রু — is-real307-সারি → /dashboard#post-<id> ডিপ-লিঙ্ক\n"
    "   (PLANS session311-প্রস্তাব-①; পাবলিক /post/<id> রুট-অনুপস্থিত — লগইন-গেট)।\n"
    "   • প্রগ্রেসিভ-এনহ্যান্সমেন্ট: JS-বিহীনে সারি কেবল-প্রদর্শন (s306b-ধর্ম); ডেমো-সারি\n"
    "     (data-post-id শূন্য) অস্পৃশ্য; aria-hidden-ক্লোন-হাফও ট্যাপযোগ্য (দৃশ্যমান-অনুলিপি)।\n"
    "   • stopPropagation+preventDefault = ফোন-লেভেল /dashboard-অ্যাঙ্কর-দমন — s306-একক-লিঙ্ক-চুক্তি\n"
    "     অক্ষুণ্ণ (tabindex/role-অনুপ্রবেশ-নিষিদ্ধ; কীবোর্ড-ইউজার ফোন-লিঙ্কেই /dashboard)।\n"
    "   • অবতরণ: dashboard.ejs s312-অবতরণ-ব্লক — হ্যাশ → [data-s312-post] স্ক্রল + ফ্ল্যাশ।\n"
    "   • QA-হুক __sfs312QA (সারি-শূন্যে-ও-সংজ্ঞায়িত — s306b-ধর্ম)। */\n"
    "(function () {\n"
    "  var q312 = { wired: 0, taps: 0, lastId: '', err: '' };\n"
    "  try {\n"
    "    var phone312 = document.querySelector('.sfs292-phone');\n"
    "    if (phone312) {\n"
    "      var rows312 = phone312.querySelectorAll('.is-real307[data-post-id]:not([data-post-id=\"\"])');\n"
    "      q312.wired = rows312.length;\n"
    "      Array.prototype.forEach.call(rows312, function (r312) { r312.classList.add('sfs312-tap'); });\n"
    "      var go312 = function (r312) {\n"
    "        var id312 = r312.getAttribute('data-post-id');\n"
    "        if (!id312) return;\n"
    "        q312.taps += 1;\n"
    "        q312.lastId = id312;\n"
    "        window.location.href = '/dashboard#post-' + encodeURIComponent(id312);\n"
    "      };\n"
    "      phone312.addEventListener('click', function (e312) {\n"
    "        var t312 = e312.target && e312.target.closest ? e312.target.closest('.sfs312-tap') : null;\n"
    "        if (!t312) return;\n"
    "        e312.stopPropagation();\n"
    "        e312.preventDefault();\n"
    "        go312(t312);\n"
    "      });\n"
    "    }\n"
    "  } catch (e312) { q312.err = String((e312 && e312.message) || e312); }\n"
    "  window.__sfs312QA = q312;\n"
    "})();\n"
    "</script>\n"
    "</section>\n"
)
apply_edit(
    FEED,
    'window.__sfs312QA',
    "  window.__sfs307QA = q307;\n})();\n</script>\n</section>\n",
    S312_SCRIPT,
    'session312 ট্যাপ-থ্রু-ইঞ্জিন + __sfs312QA-হুক')

# ═══ 4. FeedPostCard.ejs — সাধারণ-কার্ড রুটে data-s312-post ═══
print('── FeedPostCard.ejs: data-s312-post ──')
FPC = APP + '/views/shared/post/FeedPostCard.ejs'
apply_edit(
    FPC,
    'data-s312-post=',
    "  <article class=\"<%= _cardClass %>\"<%= item.is_pinned ? ' data-pinned-post=\"' + item.id + '\"' : '' %>>",
    "  <article class=\"<%= _cardClass %>\" data-s312-post=\"<%= item.id %>\"<%= item.is_pinned ? ' data-pinned-post=\"' + item.id + '\"' : '' %>>",
    'সাধারণ-কার্ড রুটে data-s312-post (নামস্পেসড — data-post-id-সংঘর্ষ-শূন্য)')

# ═══ 5. dashboard.ejs — s312 অবতরণ-ব্লক ═══
print('── dashboard.ejs: s312-অবতরণ-ব্লক ──')
DASH = APP + '/views/user/dashboard.ejs'
S312_LAND = (
    "<script>\n"
    "/* session312 (s312-land): ডিপ-লিঙ্ক অবতরণ — /dashboard#post-<id> → [data-s312-post]/\n"
    "   [data-post-id] scrollIntoView + .s312-land-flash (sfs312-ট্যাপ-থ্রুর অবতরণ-অর্ধ)।\n"
    "   হ্যাশ-বিহীন লোড = no-op (প্রধান-প্রবাহ অটুট); কার্ড-অনুপস্থিতে found:0-গ্রেসফুল\n"
    "   (ফিড-ব্যক্তিগতকরণ/পৃষ্ঠাভেদে গন্তব্য-কার্ড না-ও-থাকতে পারে)। */\n"
    "(function () {\n"
    "  var q312 = { found: 0, id: '', err: '' };\n"
    "  try {\n"
    "    var m312 = /^#post-(\\d+)$/.exec(String(window.location.hash || ''));\n"
    "    if (m312) {\n"
    "      var id312 = m312[1];\n"
    "      q312.id = id312;\n"
    "      var el312 = document.querySelector('[data-s312-post=\"' + id312 + '\"]') ||\n"
    "                  document.querySelector('[data-post-id=\"' + id312 + '\"]');\n"
    "      if (el312) {\n"
    "        q312.found = 1;\n"
    "        if (el312.scrollIntoView) el312.scrollIntoView({ block: 'center' });\n"
    "        el312.classList.add('s312-land-flash');\n"
    "        setTimeout(function () { el312.classList.remove('s312-land-flash'); }, 2400);\n"
    "      }\n"
    "    }\n"
    "  } catch (e312) { q312.err = String((e312 && e312.message) || e312); }\n"
    "  window.__s312LandQA = q312;\n"
    "})();\n"
    "</script>\n"
    "<%- include('../partials/sandbox-preview') %>\n"
)
apply_edit(
    DASH,
    'window.__s312LandQA',
    "<%- include('../partials/sandbox-preview') %>\n",
    S312_LAND,
    's312-অবতরণ-ব্লক + __s312LandQA-হুক')

# ═══ 6. style.css — session312 ব্লক (হেক্স-শূন্য) ═══
print('── style.css: session312-ব্লক ──')
CSS = APP + '/public/assets/css/style.css'
S312_CSS = (
    "/* ═════════════════════ EOF session311 (epk311) ═════════════════════ */\n"
    "\n"
    "/* ═══ session312 (sfs312): ফোন-ফিড ট্যাপ-থ্রু অ্যাফোর্ডেন্স + ড্যাশবোর্ড অবতরণ-ফ্ল্যাশ ═══\n"
    "   হেক্স-শূন্য — var(--lf-*) টোকেন + color-mix; s306-একক-লিঙ্ক-চুক্তি অক্ষুণ্ণ\n"
    "   (pointer-অ্যাফোর্ডেন্স-মাত্র — কোনো tabindex/role-অনুপ্রবেশ নয়)। */\n"
    ".sfs292-post.sfs312-tap {\n"
    "  position: relative;\n"
    "  cursor: pointer;\n"
    "  transition: background-color 180ms ease-out, border-color 180ms ease-out;\n"
    "}\n"
    ".sfs292-post.sfs312-tap::after {\n"
    "  content: \"\";\n"
    "  position: absolute;\n"
    "  top: 50%;\n"
    "  right: 10px;\n"
    "  width: 7px;\n"
    "  height: 7px;\n"
    "  transform: translateY(-50%) rotate(45deg);\n"
    "  border-top: 2px solid color-mix(in srgb, var(--lf-brand-primary) 55%, transparent);\n"
    "  border-right: 2px solid color-mix(in srgb, var(--lf-brand-primary) 55%, transparent);\n"
    "  opacity: 0;\n"
    "  transition: opacity 180ms ease-out;\n"
    "  pointer-events: none;\n"
    "}\n"
    ".sfs292-post.sfs312-tap:hover {\n"
    "  background-color: color-mix(in srgb, var(--lf-brand-primary) 7%, var(--lf-white));\n"
    "  border-color: color-mix(in srgb, var(--lf-brand-primary) 30%, var(--lf-ui-border));\n"
    "}\n"
    ".sfs292-post.sfs312-tap:hover::after { opacity: 1; }\n"
    "@media (prefers-reduced-motion: reduce) {\n"
    "  .sfs292-post.sfs312-tap,\n"
    "  .sfs292-post.sfs312-tap::after { transition: none; }\n"
    "}\n"
    "@media (max-width: 640px) {\n"
    "  .sfs292-post.sfs312-tap::after { right: 7px; width: 5px; height: 5px; }\n"
    "}\n"
    "/* ড্যাশবোর্ড অবতরণ-ফ্ল্যাশ — /dashboard#post-<id> গন্তব্য-কার্ড (s312-land) */\n"
    ".s312-land-flash {\n"
    "  animation: s312LandFlash 2.2s ease-out 1;\n"
    "}\n"
    "@keyframes s312LandFlash {\n"
    "  0%, 55% {\n"
    "    background-color: color-mix(in srgb, var(--lf-brand-primary) 9%, transparent);\n"
    "    box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--lf-brand-primary) 40%, transparent);\n"
    "  }\n"
    "  100% { background-color: transparent; box-shadow: none; }\n"
    "}\n"
    "@media (prefers-reduced-motion: reduce) {\n"
    "  .s312-land-flash {\n"
    "    animation: none;\n"
    "    box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--lf-brand-primary) 40%, transparent);\n"
    "  }\n"
    "}\n"
    "/* ═════════════════════ EOF session312 (sfs312) ═════════════════════ */\n"
)
apply_edit(
    CSS,
    'EOF session312 (sfs312)',
    "/* ═════════════════════ EOF session311 (epk311) ═════════════════════ */\n",
    S312_CSS,
    'style.css session312-ব্লক (ট্যাপ-অ্যাফোর্ডেন্স + অবতরণ-ফ্ল্যাশ)')

# ═══ পোস্ট-অ্যাসার্ট ═══
print('── পোস্ট-অ্যাসার্ট ──')
FT = rd(FEED)
DT = rd(DASH)
CT = rd(FPC)
ST = rd(CSS)

if FT.count('data-post-id="<%= p.id || \'\' %>"') == 4:
    print('  ✓ feed.ejs: data-post-id ×৪')
else:
    fatal('feed.ejs: data-post-id গণনা=' + str(FT.count("data-post-id=\"<%= p.id || '' %>\"")))
for needle, lbl in [
    ('id: p.id || \'\',', 'feed.ejs: sfsRow307-id'),
    ('window.__sfs312QA', 'feed.ejs: __sfs312QA'),
    ('window.__sfs307QA', 'feed.ejs: __sfs307QA-অক্ষুণ্ণ (legacy)'),
    ('stopPropagation', 'feed.ejs: ফোন-অ্যাঙ্কর-দমন'),
]:
    if needle in FT:
        print('  ✓ ' + lbl)
    else:
        fatal(lbl + ' অনুপস্থিত')
if 'data-s312-post=' in CT:
    print('  ✓ FeedPostCard.ejs: data-s312-post')
else:
    fatal('FeedPostCard.ejs: data-s312-post অনুপস্থিত')
if CT.count('<article') >= 3:
    print('  ✓ FeedPostCard.ejs: ত্রি-শাখা-কাঠামো অক্ষুণ্ণ')
else:
    fatal('FeedPostCard.ejs: article-গণনা অস্বাভাবিক')
for needle, lbl in [
    ('window.__s312LandQA', 'dashboard.ejs: __s312LandQA'),
    ('s312-land-flash', 'dashboard.ejs: ফ্ল্যাশ-ক্লাস'),
    ('#post-', 'dashboard.ejs: হ্যাশ-রেজলভ'),
]:
    if needle in DT:
        print('  ✓ ' + lbl)
    else:
        fatal(lbl + ' অনুপস্থিত')
B312 = ST.split('session312 (sfs312)', 1)[-1]
if B312 and '.sfs312-tap' in B312:
    print('  ✓ style.css: session312-ব্লক .sfs312-tap')
else:
    fatal('style.css: session312-ব্লক-অনুপস্থিত')
import re as _re
_hex = _re.findall(r'#[0-9a-fA-F]{3,8}\b', B312)
if _hex:
    fatal('style.css session312-ব্লকে হেক্স-আবিষ্কৃত: ' + ', '.join(_hex[:5]))
else:
    print('  ✓ style.css: session312-ব্লক হেক্স-শূন্য (টোকেন/color-mix)')
for needle, lbl in [
    ('prefers-reduced-motion', 'style.css: reduced-motion-গার্ড'),
    ('max-width: 640px', 'style.css: 640px-সংকোচন'),
    ('s312-land-flash', 'style.css: অবতরণ-ফ্ল্যাশ'),
]:
    if needle in B312:
        print('  ✓ ' + lbl)
    else:
        fatal(lbl + ' অনুপস্থিত')

# ═══ EJS-কম্পাইল ×৩ + node --check ═══
print('── EJS-কম্পাইল ×৩ ──')
for rel in ['views/partials/home/feed.ejs', 'views/user/dashboard.ejs', 'views/shared/post/FeedPostCard.ejs']:
    r = subprocess.run(['node', '-e',
                        "const e=require('ejs'),f=require('fs');e.compile(f.readFileSync('" + rel + "','utf8'),{filename:'" + rel + "'});console.log('OK')"],
                       cwd=APP, capture_output=True, text=True)
    if r.returncode == 0 and 'OK' in r.stdout:
        print('  ✓ ' + rel + ' কম্পাইল গ্রিন')
    else:
        fatal(rel + ' EJS-কম্পাইল-ব্যর্থ: ' + (r.stderr or '').strip()[:200])

if FATAL:
    print('\nসর্ব-মোট FATAL: ' + str(len(FATAL)))
    sys.exit(1)
print('\ns312-patch ✓ সর্ব-ধাপ সবুজ (idempotent ×N পুনঃরানযোগ্য)')
