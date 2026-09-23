#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
s280-ep3p-css.py — session280: epaper.css ৩-প্যানেল-যুগে রূপান্তর
──────────────────────────────────────────────────────────────────
বিলোপ (মৃত-সিলেক্টর — মার্কআপ-বিলুপ্ত): day-step/step-btn/date-input/btn-today,
viewer-bar/name/date/actions, switchstrip(ep-ss-*), issue-select, pagepager(ep-pg-*),
btn-allpages, is-grid মোড, পুরনো 1024px দ্বি-কলাম গ্রিড
সংযোজন (session280-ব্লক): ৩-কলাম গ্রিড (বার-স্প্যান) + পাতা-রেল + ক্যালেন্ডার + নতুন-ফুলস্ক্রিন
নিয়ম: রঙ কেবল var(--lf-*) টোকেন (hex-ratchet baseline epaper.css = 0); shadow-এ rgba অনুমোদিত।
idempotent: এঙ্কর-অনুপস্থিতিতে SKIP।
"""
import sys

CSS = 'public/assets/css/epaper.css'

def fatal(msg):
    print('FATAL:', msg); sys.exit(1)

def replace_once(src, old, new, tag):
    n = src.count(old)
    if n == 0:
        print('SKIP:', tag)
        return src
    if n > 1:
        fatal(tag + ' — এঙ্কর-অগুনিত (' + str(n) + ')')
    print('OK:', tag)
    return src.replace(old, new, 1)

src = open(CSS, encoding='utf-8').read()
orig = src

# ── ক১. day-step/step-btn/date-input/btn-today বিলোপ ──
src = replace_once(src, """.ep-day-step { display: flex; align-items: center; gap: 6px; }
.ep-step-btn { width: 34px; height: 34px; border-radius: 10px; border: 1px solid var(--lf-ui-border-strong); background: var(--lf-ui-surface); color: var(--lf-text-primary); cursor: pointer; font-size: .8rem; transition: background .15s ease, border-color .15s ease; }
.ep-step-btn:hover { background: var(--lf-ui-input-bg); border-color: var(--lf-brand-primary); color: var(--lf-brand-primary); }
.ep-date-input { height: 34px; padding: 0 10px; border: 1px solid var(--lf-ui-border-strong); border-radius: 10px; background: var(--lf-ui-input-bg); color: var(--lf-text-primary); font: inherit; font-size: .8rem; font-weight: 700; cursor: pointer; }
.ep-btn-today { height: 34px; padding: 0 14px; border: none; border-radius: 10px; background: var(--lf-brand-primary); color: var(--lf-ui-surface); font: inherit; font-size: .8rem; font-weight: 800; cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,.16); transition: background .15s ease; }
.ep-btn-today:hover { background: var(--lf-brand-primary-hover); }
""", '', 'ক১ day-step/btn-today-বিলোপ')

# ── ক২. viewer-bar/name/date/actions বিলোপ ──
src = replace_once(src, """.ep-viewer-bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; padding: 10px 14px; border-bottom: 1px solid var(--lf-ui-border); background: var(--lf-ui-surface); }
.ep-viewer-name { display: flex; align-items: center; gap: 8px; min-width: 0; font-weight: 800; color: var(--lf-text-primary); font-size: .95rem; }
.ep-viewer-name i { color: var(--lf-brand-primary); }
.ep-viewer-name span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ep-viewer-date { font-weight: 600; font-size: .76rem; color: var(--lf-text-secondary); }
.ep-viewer-actions { display: flex; align-items: center; gap: 8px; }
""", '', 'ক২ viewer-bar-বিলোপ')

# ── ক৩. পুরনো 1024px দ্বি-কলাম গ্রিড-বিলোপ (নতুন ৩-কলাম session280-ব্লকে) ──
src = replace_once(src, """/* ── ডেস্কটপ: বাম ৪-কলাম তালিকা, ডান ৮-কলাম ভিউয়ার (ভিউয়ার স্টিকি) ── */
@media (min-width: 1024px) {
  .ep-grid { grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); }
  .ep-side { order: -1; position: sticky; top: 76px; }
  .ep-viewer { order: 1; }
  .ep-stage { min-height: 680px; height: calc(100vh - 220px); }
  .ep-list { max-height: calc(100vh - 380px); }
}

""", '', 'ক৩ পুরনো-1024px-গ্রিড-বিলোপ')

# ── ক৪. viewer-bar ফুলস্ক্রিন-রুল ──
src = replace_once(src, ".ep-viewer:fullscreen .ep-viewer-bar, .ep-viewer.is-fs .ep-viewer-bar { padding: 10px 18px; }\n", '', 'ক৪ fs-viewer-bar-বিলোপ')

# ── ক৫. media-এ viewer-actions ──
src = replace_once(src, """@media (max-width: 600px) {
  .ep-viewer-actions { width: 100%; justify-content: flex-start; }
  .ep-zpct { min-width: 40px; }
""", """@media (max-width: 600px) {
  .ep-zpct { min-width: 40px; }
""", 'ক৫ media-viewer-actions-বিলোপ')

# ── ক৬. মোবাইল 600px-এ date-input ──
src = replace_once(src, "  .ep-head-r { width: 100%; justify-content: space-between; }\n  .ep-date-input { flex: 1; min-width: 0; }\n", "  .ep-head-r { width: 100%; justify-content: space-between; }\n", 'ক৬ media-date-input-বিলোপ')

# ── ক৭. সুইচ-স্ট্রিপ পুরো-ব্লক ──
i0 = src.find("/* ── ১. কুইক-সুইচ স্ট্রিপ (কন্ট্রোল-বারের ঠিক উপরে, ফুল-প্রস্থ) ── */")
i1 = src.find("/* ── ২. কন্ট্রোল বার")
if i0 == -1 and '.ep-switchstrip' not in src:
    print('SKIP: ক৭ সুইচ-স্ট্রিপ-বিলোপ')
elif i0 == -1 or i1 == -1 or i1 <= i0:
    fatal('ক৭ স্ট্রিপ-এঙ্কর')
else:
    src = src[:i0] + src[i1:]
    print('OK: ক৭ সুইচ-স্ট্রিপ-বিলোপ')

# ── ক৮. ctlbar-ব্লকে day-step-sm/issue-select/btn-today ──
src = replace_once(src, """.ep-day-step-sm { gap: 4px; }
.ep-day-step-sm .ep-step-btn { width: 30px; height: 30px; border-radius: 8px; }
.ep-day-step-sm .ep-date-input { height: 30px; font-size: .76rem; border-radius: 8px; }
.ep-issue-select { height: 34px; max-width: 200px; padding: 0 8px; border: 1px solid var(--lf-ui-border-strong); border-radius: 9px; background: var(--lf-ui-surface); color: var(--lf-text-primary); font-family: var(--font-heading); font-size: .76rem; font-weight: 700; cursor: pointer; transition: border-color .15s ease, color .15s ease; }
.ep-issue-select:hover { border-color: var(--lf-brand-primary); color: var(--lf-brand-primary); }
.ep-issue-select:focus-visible { outline: 2px solid var(--lf-brand-primary); outline-offset: 2px; }
.ep-ctlbar .ep-btn-today { height: 30px; padding: 0 11px; font-size: .74rem; border-radius: 8px; }
""", '', 'ক৮ ctlbar-day-step-sm/issue/btn-today-বিলোপ')

# ── ক৯. পেজিনেশন ব্লক + সব-পাতা বাটন + গ্রিড-মোড ──
i0 = src.find("/* ── ৩. সংখ্যাযুক্ত পেজিনেশন ── */")
i1 = src.find("/* ── ফুলস্ক্রিনে কন্ট্রোল-বার সমান-শ্বাস ── */")
if i0 == -1 and '.ep-pagepager' not in src:
    print('SKIP: ক৯ পেজার/অলপেজেস-বিলোপ')
elif i0 == -1 or i1 == -1 or i1 <= i0:
    fatal('ক৯ পেজার-এঙ্কর')
else:
    src = src[:i0] + src[i1:]
    print('OK: ক৯ পেজার/অলপেজেস/গ্রিড-বিলোপ')

# ── ক১০. session279-মোবাইল-মিডিয়া ব্লক পুনর্লিখন (মৃত-সিলেক্টর-বিহীন) ──
src = replace_once(src, """/* ── মোবাইল ফাইন-টিউনিং (session279) ── */
@media (max-width: 600px) {
  .ep-switchstrip { padding: 7px 9px; gap: 7px; }
  .ep-ss-label { font-size: .6rem; }
  .ep-ss-pill { font-size: .72rem; padding: 4px 10px; }
  .ep-ss-all { font-size: .7rem; padding-left: 9px; }
  .ep-ctlbar { padding: 8px 9px; gap: 7px; }
  .ep-paper-select { max-width: 168px; font-size: .76rem; }
  .ep-issue-select { max-width: 148px; height: 30px; font-size: .72rem; }
  .ep-pg-btn { min-width: 26px; height: 26px; font-size: .68rem; }
  .ep-pg-nav { width: 26px; height: 26px; }
  .ep-pg-count { min-width: 44px; height: 26px; font-size: .66rem; }
  .ep-btn-allpages { height: 30px; font-size: .72rem; padding: 0 9px; }
  .ep-pages.is-grid .ep-page-holder { width: min(90%, 280px); }
}
@media (prefers-reduced-motion: reduce) {
  .ep-ss-pills { scroll-behavior: auto; }
}""", """/* ── মোবাইল ফাইন-টিউনিং (session280) ── */
@media (max-width: 600px) {
  .ep-ctlbar { padding: 8px 9px; gap: 7px; }
  .ep-paper-select { max-width: 150px; font-size: .74rem; }
  .ep-bardate { font-size: .7rem; }
}
@media (prefers-reduced-motion: reduce) {
  .ep-rail-scroll { scroll-behavior: auto; }
}""", 'ক১০ মোবাইল-মিডিয়া-পুনর্লিখন')

# ═══════════ session280 ব্লক সংযোজন ═══════════
S280 = '''

/* ═══════════════════════════════════════════════════════════════════════════
   session280 — PressReader ৩-প্যানেল (ইউজার-স্পেক): একক কন্ট্রোল-বার (গ্রিড-স্প্যান)
   + বাম পাতা-রেল + মাঝে বড় ভিউ + ডানে ক্যালেন্ডার ও তালিকা।
   নিয়ম অক্ষুণ্ণ: রঙ শুধু var(--lf-*) টোকেন (hex-ratchet baseline 0); shadow-এ rgba অনুমোদিত।
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── ৩-প্যানেল গ্রিড: মোবাইলে এক-কলাম (বার → রেল-অনুভূমিক → ভিউয়ার → তালিকা),
   ≥1024px: [রেল ১১২px │ ভিউয়ার ১fr │ তালিকা ৩০৪px] — বার সব-কলাম-স্প্যান ── */
.ep-grid { display: grid; grid-template-columns: 1fr; gap: 12px; align-items: start; }
.ep-ctlbar { grid-column: 1 / -1; border: 1px solid var(--lf-ui-border); border-radius: var(--lf-radius-card); box-shadow: 0 1px 2px rgba(0,0,0,.05); }
.ep-ctl-sep { color: var(--lf-text-tertiary); font-weight: 800; flex-shrink: 0; }
.ep-bardate { font-family: var(--font-heading); font-size: .78rem; font-weight: 700; color: var(--lf-text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }

/* ── বাম পাতা-রেল ── */
.ep-rail { display: flex; flex-direction: column; min-width: 0; background: var(--lf-ui-surface); border: 1px solid var(--lf-ui-border); border-radius: 14px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,.05); }
.ep-rail-head { display: flex; align-items: center; gap: 6px; padding: 9px 10px; border-bottom: 1px solid var(--lf-ui-border); background: var(--lf-ui-input-bg); font-family: var(--font-heading); font-size: .68rem; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; color: var(--lf-text-secondary); }
.ep-rail-head i { color: var(--lf-brand-primary); font-size: .72rem; }
.ep-rail-count { margin-left: auto; color: var(--lf-brand-primary); }
.ep-rail-scroll { display: flex; flex-direction: row; gap: 8px; overflow-x: auto; overflow-y: hidden; padding: 9px; scroll-behavior: smooth; scrollbar-width: thin; }
.ep-rail-item { flex-shrink: 0; width: 84px; display: flex; flex-direction: column; gap: 4px; padding: 4px; border: 1px solid var(--lf-ui-border); border-radius: 9px; background: var(--lf-ui-surface); cursor: pointer; font: inherit; transition: border-color .15s ease, box-shadow .15s ease, transform .15s ease; }
.ep-rail-item:hover { border-color: var(--lf-brand-primary); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,.10); }
.ep-rail-item.is-on { border-color: var(--lf-brand-primary); box-shadow: 0 0 0 2px var(--lf-brand-light), 0 4px 12px rgba(0,0,0,.10); }
.ep-rail-thumb { position: relative; width: 100%; aspect-ratio: 3 / 4; border-radius: 6px; overflow: hidden; background: var(--lf-ui-input-bg); border: 1px solid var(--lf-ui-border-strong); display: flex; align-items: center; justify-content: center; }
.ep-rail-thumb canvas { display: block; width: 100%; height: auto; }
.ep-rail-thumb.is-pending::after { content: ''; position: absolute; inset: 0; background: linear-gradient(100deg, transparent 30%, var(--lf-green-tint) 50%, transparent 70%); background-size: 200% 100%; animation: ep-rail-shimmer 1.4s ease infinite; }
@keyframes ep-rail-shimmer { from { background-position: 180% 0; } to { background-position: -80% 0; } }
.ep-rail-cap { font-family: var(--font-heading); font-size: .62rem; font-weight: 800; color: var(--lf-text-secondary); text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ep-rail-item.is-on .ep-rail-cap { color: var(--lf-brand-primary); }
.ep-rail-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 7px; padding: 26px 10px; color: var(--lf-text-tertiary); font-family: var(--font-heading); font-size: .72rem; font-weight: 700; text-align: center; width: 100%; }
.ep-rail-empty i { font-size: 1.3rem; opacity: .5; }
.ep-rail-empty p { margin: 0; }

/* ── ডান ক্যালেন্ডার (পুরোনো সংখ্যা) ── */
.ep-cal280 { background: var(--lf-ui-surface); border: 1px solid var(--lf-ui-border); border-radius: 14px; padding: 11px 12px 12px; box-shadow: 0 1px 2px rgba(0,0,0,.05); }
.ep-cal-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 9px; }
.ep-cal-title { display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-heading); font-size: .7rem; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; color: var(--lf-text-secondary); }
.ep-cal-title i { color: var(--lf-brand-primary); }
.ep-cal-nav { display: inline-flex; align-items: center; gap: 4px; }
.ep-cal-btn { width: 26px; height: 26px; border: 1px solid var(--lf-ui-border-strong); background: var(--lf-ui-surface); color: var(--lf-text-secondary); border-radius: 7px; cursor: pointer; font-size: .62rem; display: inline-flex; align-items: center; justify-content: center; transition: background .15s ease, color .15s ease, border-color .15s ease; }
.ep-cal-btn:hover { background: var(--lf-green-tint); border-color: var(--lf-brand-primary); color: var(--lf-brand-primary); }
.ep-cal-month { font-family: var(--font-heading); font-size: .74rem; font-weight: 800; color: var(--lf-text-primary); min-width: 108px; text-align: center; }
.ep-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
.ep-cal-wd { font-family: var(--font-heading); font-size: .58rem; font-weight: 800; color: var(--lf-text-tertiary); text-align: center; padding: 3px 0 5px; }
.ep-cal-off { min-height: 27px; }
.ep-cal-day { position: relative; min-height: 27px; border: 1px solid transparent; border-radius: 7px; background: transparent; color: var(--lf-text-primary); font-family: var(--font-heading); font-size: .68rem; font-weight: 700; cursor: pointer; transition: background .15s ease, border-color .15s ease, color .15s ease; }
.ep-cal-day:hover:not(:disabled) { background: var(--lf-green-tint); border-color: var(--lf-brand-primary); color: var(--lf-brand-primary); }
.ep-cal-day:disabled { opacity: .32; cursor: default; }
.ep-cal-day.has::after { content: ''; position: absolute; left: 50%; bottom: 2px; transform: translateX(-50%); width: 4px; height: 4px; border-radius: 50%; background: var(--lf-brand-primary); }
.ep-cal-day.is-today { border-color: var(--lf-brand-primary); color: var(--lf-brand-primary); }
.ep-cal-day.is-sel { background: var(--lf-brand-primary); border-color: var(--lf-brand-primary); color: var(--lf-white); font-weight: 800; }
.ep-cal-day.is-sel::after { background: var(--lf-white); }
.ep-cal-day.has:not(.is-sel) { font-weight: 800; }

/* ── ডেস্কটপ: ৩-কলাম; রেল/তালিকা স্টিকি; ভিউয়ার লম্বা ── */
@media (min-width: 1024px) {
  .ep-grid { grid-template-columns: 118px minmax(0, 1fr) 304px; }
  .ep-rail, .ep-side { position: sticky; top: 76px; }
  .ep-rail-scroll { flex-direction: column; overflow-x: hidden; overflow-y: auto; max-height: calc(100vh - 260px); }
  .ep-rail-item { width: 100%; }
  .ep-stage { min-height: 680px; height: calc(100vh - 240px); }
  .ep-list { max-height: calc(100vh - 520px); }
}

/* ── মোবাইল: রেল-অনুভূমিক-স্ট্রিপ সংকোচন ── */
@media (max-width: 600px) {
  .ep-rail-head { padding: 7px 9px; }
  .ep-rail-scroll { padding: 7px; gap: 7px; }
  .ep-rail-item { width: 74px; }
  .ep-cal-month { min-width: 96px; font-size: .7rem; }
  .ep-list { max-height: 420px; }
}

/* ── ফুলস্ক্রিন-রুট = পূর্ণ ৩-প্যানেল গ্রিড (বার+রেল+ভিউ+তালিকা সব-থাকে) ── */
.ep-grid:fullscreen, .ep-grid.is-fs { background: var(--lf-ui-canvas); padding: 10px; gap: 10px; overflow: auto; }
.ep-grid:fullscreen .ep-stage, .ep-grid.is-fs .ep-stage { height: calc(100vh - 200px); max-height: none; min-height: 480px; }
.ep-grid:fullscreen .ep-rail-scroll, .ep-grid.is-fs .ep-rail-scroll { max-height: calc(100vh - 190px); }
.ep-grid:fullscreen .ep-list, .ep-grid.is-fs .ep-list { max-height: calc(100vh - 480px); }
'''

if 'session280 — PressReader ৩-প্যানেল' in src:
    print('SKIP: session280-ব্লক (পূর্ব-উপস্থিত)')
else:
    src = src.rstrip() + S280
    print('OK: session280-CSS-ব্লক-সংযোজন')

if src != orig:
    open(CSS, 'w', encoding='utf-8').write(src)
    print('CSS লেখা হয়েছে ✓ (Δ', len(orig) - len(src), 'বাইট)')
else:
    print('CSS অপরিবর্তিত')

# ── পোস্ট-যাচাই: হেক্স-শূন্য + মৃত-সিলেক্টর-শূন্য ──
import re
hexes = re.findall(r'#[0-9a-fA-F]{3,8}\b', src)
if hexes:
    fatal('হেক্স-লঙ্ঘন: ' + ', '.join(hexes[:5]))
dead = [w for w in ['ep-switchstrip', 'ep-pagepager', 'ep-pg-btn', 'ep-btn-allpages', 'ep-issue-select',
                    'ep-viewer-bar', 'ep-viewer-name', 'ep-btn-today', 'ep-step-btn', 'ep-day-step',
                    'ep-ss-pill', 'is-grid'] if w in src]
if dead:
    fatal('মৃত-সিলেক্টর-অবশিষ্ট: ' + ', '.join(dead))
print('CSS পোস্ট-যাচাই ✓ (হেক্স-০ + মৃত-সিলেক্টর-০)')
