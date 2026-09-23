#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""s280-suite-fix.py — সুইটের তিন-বাগ সংশোধন (cat-grep / কোট-ভাঙা / সিড-শর্ত)। idempotent."""
import sys

P = 'tests/s280-ep3p-suite.sh'
src = open(P, encoding='utf-8').read()

def rep(old, new, tag):
    global src
    if old not in src:
        print('SKIP:', tag)
        return
    src = src.replace(old, new, 1)
    print('OK:', tag)

# ① ধাপ-১: ফাইল-কনটেন্ট grep (পাথ-নয়) — লুপ-বডি পুনর্লিখন
rep('''for m in 'id="epGrid280"' 'class="ep-ctlbar"' 'class="ep-rail"' 'class="ep-cal280"' 'id="epBarDate"' 'id="epCalGrid"' 'id="epCalPrev"' 'id="epCalNext"' 'id="epPageJump"' 'id="epPaperSelect"' 'id="epListLbl"' 'type="date"'; do
  contains "কাঠামো: $m" "$PAGE" "$m"
done''', '''PAGETXT=$(cat "$PAGE" 2>/dev/null || echo '')
for m in 'id="epGrid280"' 'class="ep-ctlbar"' 'class="ep-rail"' 'class="ep-cal280"' 'id="epBarDate"' 'id="epCalGrid"' 'id="epCalPrev"' 'id="epCalNext"' 'id="epPageJump"' 'id="epPaperSelect"' 'id="epListLbl"' 'type="date"'; do
  contains "কাঠামো: $m" "$PAGETXT" "$m"
done''', '১ cat-grep')

# ② সিড-শর্ত: data-papers-খালি OR s280-মার্কার-অনুপস্থিত → সিড-চক্র
rep('''if echo "$H" | grep -q '"status":"healthy"'; then
  curl -s -m 6 "$BASE/epaper" -o "$PAGE" 2>/dev/null
  if echo "$PAGE" | grep -q 'data-papers="%5B%5D'; then NEED_SEED=1; else ok "স্থায়ী-সার্ভার জীবিত + epaper_files-ডেটা-বিদ্যমান"; fi
else
  NEED_SEED=1
fi''', '''if echo "$H" | grep -q '"status":"healthy"'; then
  curl -s -m 6 "$BASE/epaper" -o "$PAGE" 2>/dev/null
  if echo "$PAGE" | grep -q 'data-papers="%5B%5D'; then NEED_SEED=1; fi
  if ! grep -q 's280কিউএ' "$PAGE" 2>/dev/null; then NEED_SEED=1; fi
  if [ "$NEED_SEED" = "0" ]; then ok "স্থায়ী-সার্ভার জীবিত + s280-qa-ডেটা-বিদ্যমান"; fi
else
  NEED_SEED=1
fi''', '২ সিড-শর্ত')

# ③ barDate-যাচাই: -F+\\| ভাঙা → দুই-সহজ-চেক (বাংলা-রেঞ্জ-গোটচা-নিরাপদ)
rep('''if echo "$BOOT" | grep -qF 'বুধবার\\|সোমবার\\|মঙ্গলবার\\|রবিবার\\|বৃহস্পতিবার\\|শুক্রবার\\|শনিবার'; then ok "বুট: বার-তারিখ পূর্ণ-বাংলা"; else bad "বুট: barDate-বার-অনুপস্থিত — $BOOT"; fi''',
'''if echo "$BOOT" | grep -qF 'বার, ' && echo "$BOOT" | grep -qF '২০২৬'; then ok "বুট: বার-তারিখ পূর্ণ-বাংলা (বার+বর্ষ)"; else bad "বুট: barDate-অসম্পূর্ণ — $BOOT"; fi''', '৩ barDate')

# ④ কোট-ভাঙা: changed\\":true → jflat-ভিত্তিক
rep('''contains "মাস-নেভ: পিছনে-সামনে পুনরুদ্ধার" "$MN" "changed\\\\":true" || contains "মাস-নেভ-ফলব্যাক-যাচাই" "$MN" 'changed":true'
''', '''if [ "$(echo "$MN" | tr -d '"\\\\')" != "$(echo "$MN" | tr -d '"\\\\' | sed 's/changed:true/changed:false/')" ] && echo "$MN" | tr -d '"\\\\' | grep -q 'changed:true'; then ok "মাস-নেভ: পিছনে-সামনে পুনরুদ্ধার"; else bad "মাস-নেভ — $MN"; fi
''', '৪ মাস-নেভ-চেক')

# ⑤ ক্যালেন্ডার-ক্লিক দ্বৈত-লাইন-গোছানো (ok-দ্বৈত-বাগ)
rep('''if echo "$JSW" | grep -qE 'list:[0-9]+'; then ok "ক্যালেন্ডার-ক্লিক: তালিকা-পুনর্নির্মাণ ($SW)" >/dev/null && ok "ক্যালেন্ডার-ক্লিকে তালিকা-পুনর্নির্মাণ"; else bad "ক্যালেন্ডার-ক্লিক: তালিকা — $SW"; fi''',
'''if echo "$JSW" | grep -qE 'list:[0-9]+'; then ok "ক্যালেন্ডার-ক্লিকে তালিকা-পুনর্নির্মাণ"; else bad "ক্যালেন্ডার-ক্লিক: তালিকা — $SW"; fi''', '৫ দ্বৈত-ok-গোছানো')

# ⑥ রেল-ক্লিক বিকল্প-চেক সরলীকরণ (jflat-ভিত্তিক)
rep('''contains "রেল-ক্লিক: পাতা-৩-সক্রিয়" "$RS" '"on":"3"' || contains "রেল-ক্লিক-বিকল্প" "$RS" 'on":"3'
''', '''if jflat "$RS" | grep -q 'on":3' || jflat "$RS" | grep -qF 'on":3'; then ok "রেল-ক্লিক: পাতা-৩-সক্রিয়"; else bad "রেল-ক্লিক — $RS"; fi
''', '৬ রেল-ক্লিক-চেক')

open(P, 'w', encoding='utf-8').write(src)
print('সম্পন্ন')
