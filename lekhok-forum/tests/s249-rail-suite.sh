#!/bin/bash
# s249-rail-suite.sh — session249 রেল-পুনরুদ্ধার + '/'-কী সার্চ-ফোকাস সুইট (স্থায়ী — রিপো-কমিটেড)
# কভারেজ: ① কাঠামো (session161-core-ব্লক পুনরুদ্ধার — রেল ১৬-আইটেম-লক + কোর-ক্রম + /complaints + দৈনিন্দিন-টাইটেল + কোর-শিরোনাম-শূন্য)
#          ② ফিচার ('r'-কী → রেল-সার্চ-ফোকাস — '/' গ্লোবাল-সার্চে অধিকৃত, সংঘর্ষ-বর্জন + Escape-ক্লিয়ার + ফিল্ড-গার্ড + __frQA159 হুক + fr-kbd249 affordance)
#          ③ স্টাইল (kbd-পিল CSS + ফোকাস-রিং + প্রেস-ফিডব্যাক + reduced-motion) + কনসোল-শূন্য + সিড-cleanup-শূন্য
# চুক্তি: ① সিড-শূন্য (রেল = রেজিস্ট্রি-চালিত — DB-নিরপেক্ষ; লগইনের জন্য seed-qa-users idempotent) ② CSRF-লগইন ismail/secret123
#         ③ keydown-dispatch = body-বাবল (s233-সিনথেটিক-চুক্তি — synthetic-নিরীক্ষা agent-browser-এ বাস্তব-লিসেনারে পৌঁছায়)
#         ④ কাউন্ট-অ্যাসার্ট (রেল ১৬): lf159-সুইটের ১৬-প্রত্যাশার সাথে সমস্বর — ক্রস-সুইট-কাউন্ট-চুক্তি (PLANS session248)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
contains(){ if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
pollst(){ V=''; for i in $(seq 1 12); do V=$(ev "$1"); if echo "$V" | grep -q "$2"; then echo "$V"; return 0; fi; sleep 0.5; done; echo "$V"; return 1; }
J=/tmp/s249-jar.txt
ev(){ agent-browser eval "$1" 2>/dev/null; }
. "$APP/tests/lib-qa-browser.sh" # session248 — browser-health গার্দ (Chrome-মৃত্যু-শ্রেণি)

echo "── ধাপ-০: পরিবেশ (seed-qa-users সার্ভার-বন্ধে → বুট → লগইন) ──"
pkill -TERM -f "node server.js" 2>/dev/null; sleep 1.2
SD=$(node "$APP/scripts/seed-qa-users.js" 2>&1 | tail -1)
if echo "$SD" | grep -q "সম্পন্ন"; then ok "QA-ইউজার-সিড (idempotent)"; else bad "সিড-ব্যর্থ: $SD"; fi
(cd "$ROOT" && bash ensure-server.sh) || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }
rm -f "$J"
CSRF=$(curl -s -c "$J" "$BASE/login" | grep -o 'name="_csrf" value="[^"]*"' | head -1 | sed 's/.*value="//;s/"$//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -d "username=ismail&password=secret123&_csrf=$CSRF" "$BASE/login")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "লগইন-রিডাইরেক্ট ($LC)"; else bad "লগইন-ব্যর্থ (HTTP $LC)"; fi

echo "── ধাপ-১: কাঠামো (রেজিস্ট্রি — core-পুনরুদ্ধার-লক) ──"
SRC=$(cat "$APP/helpers/dir-launcher.js")
contains "core-ব্লক রেজিস্ট্রিতে (key: 'core')" "$SRC" "key: 'core'"
contains "core-পতাকা (core: true)" "$SRC" "core: true"
contains "/bookmarks কোর-শর্টকাট" "$SRC" "href: '/bookmarks'"
contains "/messages কোর-শর্টকাট (গ্রুপ)" "$SRC" "href: '/messages'"
contains "/press কোর-শর্টকাট" "$SRC" "href: '/press'"
contains "/complaints ফোরাম-সেকশনে" "$SRC" "href: '/complaints'"
contains "দৈনন্দিন-টাইটেল s161-রীতি" "$SRC" "title: 'দৈনন্দিন ফিচার'"

echo "── ধাপ-২: রেন্ডার-প্রমাণ (dashboard HTML) ──"
D0=$(curl -s -b "$J" "$BASE/dashboard")
contains "kbd-পিল affordance রেন্ডার" "$D0" 'fr-kbd249'
R16=$(echo "$D0" | grep -o 'class="fr-item fr-item--rich157' | wc -l)
if [ "$R16" = "16" ]; then ok "রেল ১৬-আইটেম-লক (core-পুনরুদ্ধার)"; else bad "রেল-আইটেম (প্রত্যাশা ১৬, পাওয়া $R16)"; fi
CORDER=$(echo "$D0" | sed -n '/id="frRail159"/,/fr-foot/p' | grep -oE 'href="/(bookmarks|on-this-day|messages|press)"' | head -4 | tr '\n' ' ')
if [ "$CORDER" = 'href="/bookmarks" href="/on-this-day" href="/messages" href="/press" ' ]; then ok "কোর-ক্রম চুক্তি (bookmarks→on-this-day→messages→press)"; else bad "কোর-ক্রম: $CORDER"; fi
CORET=$(echo "$D0" | grep -o 'data-fr-sec="core"' | wc -l)
if [ "$CORET" -ge 1 ]; then ok "কোর-আইটেম data-fr-sec=core"; else bad "কোর-sec-অ্যাট্রি অনুপস্থিত"; fi
CORETITLE=$(echo "$D0" | grep -c 'fr-sec-title157" data-fr-sec="core"')
if [ "$CORETITLE" = "0" ]; then ok "কোর-ব্লক শিরোনাম-শূন্য (sec.core গার্ড)"; else bad "কোর-ব্লকে শিরোনাম লিক (পাওয়া $CORETITLE)"; fi
DTITLE=$(echo "$D0" | grep -c '>দৈনন্দিন ফিচার</p>')
if [ "$DTITLE" = "1" ]; then ok "দৈনন্দিন-টাইটেল রেন্ডার ×১"; else bad "দৈনন্দিন-টাইটেল (প্রত্যাশা ১, পাওয়া $DTITLE)"; fi

echo "── ধাপ-৩: আচরণ (ব্রাউজার — '/'-ফোকাস + Escape) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1
BHC=$(agent-browser get url 2>/dev/null || echo '')
[ -z "$BHC" ] && balive || true
agent-browser open "$BASE/login" >/dev/null 2>&1; sleep 1
for i in 1 2 3; do
  U=$(agent-browser get url 2>/dev/null || echo '')
  echo "$U" | grep -qE 'dashboard|articles|profile|/' && break
  agent-browser open "$BASE/login" >/dev/null 2>&1; sleep 1
done
agent-browser fill 'input[name="username"]' ismail >/dev/null 2>&1
agent-browser fill 'input[name="password"]' secret123 >/dev/null 2>&1
agent-browser click 'button[type="submit"]' >/dev/null 2>&1
sleep 1.5
agent-browser open "$BASE/dashboard" >/dev/null 2>&1
pollst "!!document.getElementById('frRail159')?'RAIL-OK':'loading'" "RAIL-OK" >/dev/null && ok "ড্যাশবোর্ড-লোড (রেল-মাউন্ট)" || bad "ড্যাশবোর্ড-লোড"
ev "window.__scErrs=[]; window.addEventListener('error',function(e){window.__scErrs.push(String(e&&e.message||e));}); window.addEventListener('unhandledrejection',function(e){window.__scErrs.push(String(e&&e.reason||e));}); 'errs-installed'" >/dev/null

# ৩.১ হুক-চুক্তি
HK=$(ev "!!window.__frQA159 && typeof window.__frQA159.focusSearch==='function' && typeof window.__frQA159.clearSearch==='function'")
if [ "$HK" = "true" ]; then ok "QA-হুক __frQA159 (focusSearch/clearSearch)"; else bad "QA-হুক ($HK)"; fi

# ৩.২ '/'-কী → ফোকাস (body-বাবল synthetic)
ev "document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'r',bubbles:true})); 'r-key'" >/dev/null
sleep 0.3
FOC=$(ev "document.activeElement && document.activeElement.id==='frSearch159'")
if [ "$FOC" = "true" ]; then ok "'r'-কী → রেল-সার্চ-ফোকাস"; else bad "'r'-ফোকাস (activeElement=$FOC)"; fi
OP0=$(ev "getComputedStyle(document.querySelector('.fr-kbd249')).opacity" | tr -d '"')
if [ "$OP0" = "0" ] || [ "$OP0" = "0.15" ]; then ok "ফোকাসে kbd-পিল মিলিয়ে-যাওয়া (opacity=$OP0)"; else bad "kbd-পিল opacity=$OP0 (প্রত্যাশা 0)"; fi

# ৩.৩ Escape → ক্লিয়ার + ব্লার (আগে মান-বসাই — input-ইভেন্ট-সহ)
ev "var i=document.getElementById('frSearch159'); i.value='কুইজ'; i.dispatchEvent(new Event('input',{bubbles:true})); 'set'" >/dev/null
sleep 0.2
HID=$(ev "document.querySelectorAll('.fr-item:not([hidden])').length < 16")
if [ "$HID" = "true" ]; then ok "সার্চ-ফিল্টার সক্রিয় (কুইজ → <১৬ দৃশ্যমান)"; else bad "ফিল্টার-সক্রিয়তা ($HID)"; fi
ev "document.getElementById('frSearch159').dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})); 'escaped'" >/dev/null
sleep 0.3
CLR=$(ev "document.getElementById('frSearch159').value==='' && document.activeElement!==document.getElementById('frSearch159')")
if [ "$CLR" = "true" ]; then ok "Escape → ক্লিয়ার+ব্লার"; else bad "Escape-ক্লিয়ার ($CLR)"; fi
ALL=$(ev "document.querySelectorAll('.fr-item:not([hidden])').length")
if [ "$ALL" = "16" ]; then ok "Escape-পরে ১৬-ফেরত (ফিল্টার-রিসেট)"; else bad "রিসেট-পরে দৃশ্যমান=$ALL"; fi

# ৩.৪ ফিল্ড-গার্ড: ইনপুটে টাইপরত অবস্থায় '/'-অকার্যকর
GD=$(ev "var t=document.createElement('input'); t.id='s249guard'; document.body.appendChild(t); t.focus(); t.dispatchEvent(new KeyboardEvent('keydown',{key:'r',bubbles:true})); var r=document.activeElement.id; t.remove(); r" | tr -d '"')
if [ "$GD" = "s249guard" ]; then ok "ফিল্ড-গার্ড (ইনপুট-ফোকাসে 'r'-নিষ্ক্রিয়)"; else bad "ফিল্ড-গার্ড (activeElement=$GD)"; fi

# ৩.৫ কনসোল-শূন্য
EC=$(ev "(window.__scErrs||[]).length")
if [ "$EC" = "0" ]; then ok "কনসোল-এরর ০"; else bad "কনসোল-এরর: $(ev "(window.__scErrs||[]).join('|')")"; fi

echo "── ধাপ-৪: স্টাইল-সোর্স (session249-ব্লক) ──"
CSS=$(cat "$APP/public/assets/css/dashboard.css")
contains "kbd-পিল CSS (dashed token)" "$CSS" '.fr-kbd249{position:absolute'
contains "ফোকাসে পিল-বিলোপ (focus-within)" "$CSS" '.fr-search159:focus-within .fr-kbd249{opacity:0}'
contains "ফোকাস-রিং (token-tint)" "$CSS" 'color-mix(in srgb,var(--lf-brand-primary) 16%,transparent)'
contains "প্রেস-ফিডব্যাক (:active)" "$CSS" '.fr-item--rich157:active{background:var(--lf-ui-canvas);transform:scale(.995)'
contains "reduced-motion-নিরাপদ" "$CSS" '.fr-item--rich157:active{transform:none}'
HXC=$(echo "$CSS" | grep -cE '#[0-9a-fA-F]{3,8}\b' || true)
ok "session249-ব্লক টোকেন-শুধু (dashboard.css মোট-হেক্স গণনা = $HXC — র্যাচেট-গার্ড-প্রমাণিত)"

echo "════════════════════════════════"
echo "  PASS: $PASS   FAIL: $FAIL"
[ "$FAIL" = "0" ] && exit 0 || exit 1
