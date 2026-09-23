#!/bin/bash
# s272-chfilter-suite.sh — session272 কনটেন্ট রিভিশন হিস্ট্রি (/admin/content/history) তাৎক্ষণিক-ফিল্টার সুইট (স্থায়ী — রিপো-কমিটেড)
# কভারেজ: ① কাঠামো (ch272 স্ট্রিপ + tr[data-ch-row]/data-kw সারি-সারফেস + শূন্য-অবস্থা + delete-ফর্ম (নতুন-ফিচার) +
#          no-regression: key-select / restore-ফর্ম / table/thead / subtitle / sidebar / empty-ব্রাঞ্চ (সোর্স-স্তর))
#          ② স্টাইল (ch272-ব্লক হেক্স-শূন্য টোকেন-শুধু; color-mix ফোকাস-রিং; kbd-পিল; reduced-motion-জোড়া;
#          640px-সংকোচন; :active-প্রেস; hidden-গার্ড ×৩ সঠিক-বাইট)
#          ③ আচরণ (__chQA হুক — সারফেস-শূন্যে-ও-সংজ্ঞায়িত; '#id'-একক-প্রোব (r.id অনন্য) + marker-value প্রোব +
#          saved_by-প্রোব + সর্বজনীন 'রিভিশন revision'; নো-ম্যাচ→শূন্য-অবস্থা; সব-hidden; clear→পুনরুদ্ধার+
#          চিপ-display:none; 'f'-ফোকাস + ফিল্ড-গার্ড-প্রোব (select[name=key]-থেকে 'f' → ফোকাস-চুরি-শূন্য);
#          Escape-ক্লিয়ার+ব্লার; **নো-কী-সারফেসেও হুক+ফোকাস জীবিত** (ac265-চুক্তি-প্রমাণ))
#          ④ 390px-hScroll-শূন্য + স্ক্রিনশট ×২
#          ⑤ **নতুন-ফিচার-ই২ই (revision-delete) + রিস্টোর-ই২ই + নেট-DB-রাইট-শূন্য-প্রমাণ**
# চুক্তি: ① **marker-সিড-চুক্তি (s267-বিস্তার):** content_revisions-এ ডিলিট-API-নেই-ছিল → এ-রাউন্ডে
#         POST /admin/content/history/delete (session272-ফিচার) যুক্ত → সুইট = POST /admin/content
#         (multipart -F, x-csrf-token-হেডার — s269-গোটচা) ×২ (old→new) দিয়ে marker-রিভিশন-সিড →
#         টেস্ট-উইন্ডো → restore(BASE_REV)/save('') দিয়ে settings-পুনরুদ্ধার → delete দিয়ে
#         revisions-পুনরুদ্ধার → **নেট-শূন্য-প্রমাণ (ids PRE == FINAL) + ক্র্যাশ-অবশেষ-ক্লিনার-পূর্বে**
#         ② ভিউয়ার = testadmin/demo123 (requireAdmin) ③ **নেমস্পেস:** .ch- প্রিফিক্স view+css-এ পূর্ব-শূন্য
#         (প্যাচ-FATAL-গার্ড) ④ অ্যাঙ্করড-চেক-প্রথা (session264-গোটচা): '/admin/content/history?key=' —
#         delete-সাবপাথ-সংঘর্ষ-নিরাপদ ⑤ eval-JSON-এস্কেপ-গ্রেপ (session267-গোটচা): 'h..:false'-এস্কেপ-সহনশীল
#         ⑥ rev_id-প্রতি-সারি ×২ (restore+delete ফর্ম — sort -u দিয়ে id-নিষ্কাশন)
set -u
ROOT="${LEKHOK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)}"
APP=$ROOT/lekhok-forum
BASE=http://localhost:8094
PASS=0; FAIL=0; SKIP=0
MKEY='content_home_stat1_label'
MOLD='qa272rev-3917-old'
MNEW='qa272rev-3917-new'
ok(){ PASS=$((PASS+1)); echo "  ✓ $1"; }
bad(){ FAIL=$((FAIL+1)); echo "  ✗ $1"; }
skip(){ SKIP=$((SKIP+1)); echo "  ○ $1"; }
contains(){ if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
containsF(){ if echo "$2" | grep -qF -- "$3"; then ok "$1"; else bad "$1 — প্যাটার্ন-অনুপস্থিত: $3"; fi; }
ev(){ agent-browser eval "$1" 2>/dev/null; }
. "$APP/tests/lib-qa-browser.sh" # session248 — browser-health গার্দ
J=/tmp/s272-ch-jar.txt
PAGE=/tmp/s272-ch-page.html
NPAGE=/tmp/s272-ch-nokey.html

fetch_page(){ curl -s -b "$J" -o "$PAGE" -w "%{http_code}" "$BASE/admin/content/history?key=$MKEY"; }
fetch_nokey(){ curl -s -b "$J" -o "$NPAGE" -w "%{http_code}" "$BASE/admin/content/history"; }
ids_in(){ grep -o 'name="rev_id" value="[0-9]*"' "$1" 2>/dev/null | grep -o '[0-9]*' | sort -u; }
id_newlist(){ comm -13 <(echo "$1" | sort -u) <(echo "$2" | sort -u); }

echo "── ধাপ-০: পরিবেশ (প্রোব → testadmin-লগইন → ক্র্যাশ-অবশেষ-ক্লিনার → marker-সিড) ──"
H=$(curl -s -m 2 "$BASE/api/health" 2>/dev/null)
if echo "$H" | grep -q '"status":"healthy"'; then ok "স্থায়ী-সার্ভার জীবিত (প্রোব)"; else
  (cd "$ROOT" && bash ensure-server.sh) || { echo "FATAL: সার্ভার-বুট ব্যর্থ"; exit 1; }
  ok "সার্ভার ensure-server-এ-বুট"
fi
rm -f "$J"
TOK=$(curl -s -b "$J" -c "$J" "$BASE/admin/login" | grep -o 'csrf-token" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"//')
LC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -c "$J" -X POST "$BASE/admin/login" --data-urlencode "username=testadmin" --data-urlencode "password=demo123" --data-urlencode "_csrf=$TOK")
if [ "$LC" = "302" ] || [ "$LC" = "303" ]; then ok "testadmin-লগইন ($LC)"; else bad "testadmin-লগইন-ব্যর্থ (HTTP $LC)"; fi

PC=$(fetch_page)
if [ "$PC" = "200" ]; then ok "হিস্ট্রি-পৃষ্ঠা 200 (key-অনুসন্ধিত)"; else bad "হিস্ট্রি-পৃষ্ঠা HTTP $PC"; fi
NK=$(fetch_nokey)
if [ "$NK" = "200" ]; then ok "নো-কী-পৃষ্ঠা 200"; else bad "নো-কী-পৃষ্ঠা HTTP $NK"; fi

# ক্র্যাশ-অবশেষ-ক্লিনার-পূর্বে (s267-প্রথা): marker-মান-সারি >০ → সব-ডিলিট (প্যাচ-পূর্ব-ক্র্যাশ-সুরক্ষা)
STALE=$(grep -cF "$MOLD" "$PAGE" || true)
if [ "$STALE" -ge 1 ]; then
  ok "ক্র্যাশ-অবশেষ-সনাক্ত ($STALE) — ক্লিনার-চালু"
  for RID in $(ids_in "$PAGE"); do
    curl -s -o /dev/null -b "$J" -X POST "$BASE/admin/content/history/delete" -H "x-csrf-token: $TOK" --data-urlencode "rev_id=$RID" >/dev/null 2>&1
  done
  PC=$(fetch_page)
  STALE2=$(grep -cF "$MOLD" "$PAGE" || true)
  if [ "$STALE2" = "0" ]; then ok "ক্র্যাশ-অবশেষ-পরিষ্কার (সব-মুছে)"; else bad "ক্লিনার-ব্যর্থ (stale=$STALE2)"; fi
else
  ok "ক্র্যাশ-অবশেষ-শূন্য (পরিষ্কার-শুরু)"
fi

PRE_IDS=$(ids_in "$PAGE")
PRE_N=$(echo "$PRE_IDS" | grep -c . || true)
ok "প্রি-রিভিশন-তালিকা সংগ্রহ ($PRE_N সারি — $MKEY)"

# marker-সিড #1: save(old) → revision(value=X0) সম্ভব (X0-নিরপেক্ষ)
RC1=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -X POST "$BASE/admin/content" -H "x-csrf-token: $TOK" -F "__page=home" -F "home_stat1_label=$MOLD")
if [ "$RC1" = "302" ] || [ "$RC1" = "303" ]; then ok "সিড#1 save(old) ($RC1)"; else bad "সিড#1-ব্যর্থ (HTTP $RC1)"; fi
PC=$(fetch_page)
S1_IDS=$(ids_in "$PAGE")
# marker-সিড #2: save(new) → revision(value=old) অবিশ্বযোগ্যভাবে (old≠new)
RC2=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -X POST "$BASE/admin/content" -H "x-csrf-token: $TOK" -F "__page=home" -F "home_stat1_label=$MNEW")
if [ "$RC2" = "302" ] || [ "$RC2" = "303" ]; then ok "সিড#2 save(new) ($RC2)"; else bad "সিড#2-ব্যর্থ (HTTP $RC2)"; fi
PC=$(fetch_page)
S2_IDS=$(ids_in "$PAGE")
BASE_REV=$(id_newlist "$PRE_IDS" "$S1_IDS" | head -1)
MARKER_REV=$(id_newlist "$S1_IDS" "$S2_IDS" | head -1)
ROWS=$(grep -o 'data-ch-row="[0-9]*"' "$PAGE" | wc -l)
KW=$(grep -o 'data-kw="' "$PAGE" | wc -l)
if [ -n "$MARKER_REV" ]; then ok "marker-রিভিশন প্রস্তুত (rev#$MARKER_REV — value=$MOLD)"; else bad "marker-রিভিশন-ব্যর্থ (সিড-যুগল-অকার্যকর)"; fi
if [ "$ROWS" -ge 1 ]; then ok "রিভিশন-সারফেস প্রস্তুত ($ROWS সারি)"; else bad "সারফেস-খালি (rows=$ROWS)"; fi
if [ "$KW" = "$ROWS" ] && [ "$ROWS" -ge 1 ]; then ok "সারফেস-সমতুল্য data-kw কভারেজ ($ROWS সারফেস)"; else bad "সারফেস/kw-বেমান (row=$ROWS kw=$KW)"; fi

# ডেটা-নির্ভর-প্রোব-পূর্বগণনা (রেন্ডার্ড-HTML-ই-সত্য)
IDP="#$MARKER_REV"
IDN=$(grep -oE 'data-kw="[^"]*"' "$PAGE" | grep -cF "${IDP} " || true)
VALN=$(grep -oE 'data-kw="[^"]*"' "$PAGE" | grep -cF "$MOLD" || true)
USRN=$(grep -oE 'data-kw="[^"]*"' "$PAGE" | grep -cF 'testadmin' || true)
UNIVN=$(grep -oE 'data-kw="[^"]*"' "$PAGE" | grep -c 'রিভিশন revision' || true)
if [ -n "$IDP" ] && [ "$IDN" = "1" ]; then ok "row-id একক-প্রোব প্রস্তুত ($IDP — অনন্য)"; else bad "id-প্রোব-অনন্যতা-ব্যর্থ (probe=$IDP n=$IDN)"; fi
if [ "$UNIVN" = "$ROWS" ] && [ "$ROWS" -ge 1 ]; then ok "সর্বজনীন-অ্যালায়াস 'রিভিশন revision' (প্রতি-সারফেস $UNIVN)"; else bad "সর্বজনীন-অ্যালায়াস ব্যর্থ (univ=$UNIVN rows=$ROWS)"; fi
if [ "$VALN" -ge 1 ]; then ok "marker-value প্রোব প্রস্তুত ($MOLD → $VALN)"; else bad "value-প্রোব-অনুপস্থিত"; fi
if [ "$USRN" -ge 1 ]; then ok "saved_by-প্রোব প্রস্তুত (testadmin → $USRN)"; else bad "saved_by-প্রোব-অনুপস্থিত"; fi

echo "── ধাপ-১: কাঠামো (ch272 স্ট্রিপ — no-regression) ──"
contains "ch272-ইনপুট রেন্ডার" "$(cat "$PAGE")" 'id="chFilter272"'
contains "ch272-কাউন্ট চিপ রেন্ডার" "$(cat "$PAGE")" 'id="chCount272"'
contains "ch272-ক্লিয়ার বাটন রেন্ডার" "$(cat "$PAGE")" 'id="chClear272"'
contains "ch-kbd-পিল affordance রেন্ডার" "$(cat "$PAGE")" 'ch-kbd-hint'
contains "শূন্য-অবস্থা বক্স (data-ch-empty)" "$(cat "$PAGE")" 'data-ch-empty'
contains "__chQA হুক উপস্থিত" "$(cat "$PAGE")" '__chQA'
contains "'f'-কী শ্রোতা (field-গার্ডসহ)" "$(cat "$PAGE")" "ch.key !== 'f'"
containsF "শূন্য-অবস্থা পূর্ব-লুকানো" "$(cat "$PAGE")" '<div class="ch-zero" id="chZero272" data-ch-empty hidden>'
contains "kw-এ #আইডি-প্রোব-উপস্থিত" "$(cat "$PAGE")" 'data-kw="#[0-9]*'
containsF "no-regression: key-সিলেক্ট (সার্ভার-ফিল্টার)" "$(cat "$PAGE")" 'name="key"'
containsF "no-regression: restore-ফর্ম" "$(cat "$PAGE")" 'action="/admin/content/restore"'
containsF "নতুন-ফিচার: delete-ফর্ম (প্রতি-সারি)" "$(cat "$PAGE")" 'action="/admin/content/history/delete"'
containsF "নতুন-ফিচার: delete-বাটন title-বিল্লা" "$(cat "$PAGE")" 'রিভিশন মুছে ফেলুন'
contains "no-regression: thead-কলাম (rev/সময়/কে/পুরনো মান)" "$(cat "$PAGE")" 'পুরনো মান'
contains "no-regression: ch272-স্ট্রিপ always-rendered" "$(cat "$PAGE")" 'ch-instant'
containsF "EJS-শাখা-সংরক্ষণ: নো-ডেটা 'card empty' (সোর্স-স্তর — দ্বৈত-শূন্য-বক্স-চুক্তি s265)" "$(cat "$APP/admin/views/admin/content-history.ejs")" 'class="empty"'
containsF "EJS-শাখা-সোর্স-অ্যাসার্ট: ch272-স্ট্রিপ সোর্স-স্তরে (empty-শাখার-বাইরে)" "$(cat "$APP/admin/views/admin/content-history.ejs")" 'chFilter272'
containsF "নো-কী-পৃষ্ঠায়ও স্ট্রিপ রেন্ডার (always-rendered-প্রমাণ)" "$(cat "$NPAGE")" 'chFilter272'
containsF "নো-কী-পৃষ্ঠায় নো-ডেটা বক্স (card empty)" "$(cat "$NPAGE")" 'কোনো রিভিশন নেই'
containsF "no-regression: sidebar (পার্শিয়াল-রেন্ডার)" "$(cat "$PAGE")" 'admin-sidebar'

echo "── ধাপ-২: স্টাইল (টোকেন-শুধু — guard-র্যাচেট-নিরাপদ) ──"
CHCSS=$(sed -n '/session272 — ch272 তাৎক্ষণিক-ফিল্টার স্টাইল/,/<\/style>/p' "$PAGE")
HEXN=$(echo "$CHCSS" | grep -oiE '#[0-9a-f][0-9a-f]{2,6}\b' | wc -l)
if [ "$HEXN" = "0" ]; then ok "ch272-ব্লক হেক্স-শূন্য (টোকেন-শুধু)"; else bad "ch272-ব্লকে $HEXN হেক্স (র্যাচেট-ঝুঁকি)"; fi
contains "ফোকাস-রিং color-mix টোকেন-টিন্ট" "$CHCSS" 'color-mix(in srgb, var(--lf-brandgreen)'
contains "kbd-পিল dashed affordance" "$CHCSS" '.ch-kbd-hint kbd'
contains "reduced-motion জোড়া" "$CHCSS" 'prefers-reduced-motion'
contains "640px সংকোচন (kbd-none)" "$CHCSS" '@media (max-width: 640px)'
contains "ফিল্টার-ফিডব্যাখ (:active scale)" "$CHCSS" '.ch-instant-clear:active { transform: scale(.96); }'
containsF "hidden-গার্ড-সারি (tr !important — সঠিক-বাইট)" "$CHCSS" 'tr[data-ch-row][hidden] { display: none !important; }'
containsF "hidden-গার্ড-চিপ" "$CHCSS" '.ch-count-chip[hidden] { display: none; }'
containsF "hidden-গার্ড-শূন্য-বক্স" "$CHCSS" '.ch-zero[hidden] { display: none; }'
containsF "নেমস্পেস-পৃথকতা (admin-বনাম ch-স্কোপ)" "$CHCSS" '.ch-instant { display: flex;'
containsF "নতুন-ফিচার-স্টাইল: অ্যাকশন-জোড়া flex" "$CHCSS" '.ch-act272 { display: flex;'

echo "── ধাপ-৩: আচরণ (agent-browser — সেশন-প্রি-ক্লিয়ার → fetch-POST লগইন) ──"
agent-browser set viewport 1280 900 >/dev/null 2>&1
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser open "$BASE/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/logout" >/dev/null 2>&1; sleep 0.4
agent-browser open "$BASE/admin/content/history?key=$MKEY" >/dev/null 2>&1; sleep 1.2
PREURL=$(agent-browser get url 2>/dev/null || echo '')
if echo "$PREURL" | grep -q 'admin/content/history'; then
  ok "testadmin-সেশন-সক্রিয় (সরাসরি-পথ)"
else
  agent-browser open "$BASE/admin/login" >/dev/null 2>&1; sleep 1
  LR=$(ev 'fetch("/admin/login",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},redirect:"manual",body:"username=testadmin&password=demo123&_csrf="+encodeURIComponent(document.querySelector("input[name=_csrf]").value)}).then(function(r){return String(r.status)+":"+r.type})' | tr -d '"')
  if echo "$LR" | grep -q 'opaqueredirect'; then ok "fetch-POST লগইন (303-opaque — কুকি-স্থাপিত)"; else bad "fetch-POST লগইন-ব্যর্থ ($LR)"; fi
  agent-browser open "$BASE/admin/content/history?key=$MKEY" >/dev/null 2>&1; sleep 1.2
fi
contains "ব্রাউজারে হিস্ট্রি-পৃষ্ঠা খোলা" "$(agent-browser get url 2>/dev/null)" 'admin/content/history'
contains "__chQA সংজ্ঞায়িত (সারফেস-শূন্যে-ও)" "$(ev 'typeof window.__chQA')" 'object'
T=$(ev 'window.__chQA.total()' | tr -d '"')
C=$(ev 'window.__chQA.count()' | tr -d '"')
if [ -n "$T" ] && [ "$T" = "$C" ] && [ "$T" = "$ROWS" ]; then ok "প্রাথমিক count==total==ROWS ($C)"; else bad "প্রাথমিক বেমান (total=$T count=$C rows=$ROWS)"; fi
agent-browser fill '#chFilter272' "$IDP" >/dev/null 2>&1; sleep 0.4
C1=$(ev 'window.__chQA.count()' | tr -d '"')
if [ -n "$C1" ] && [ "$C1" = "1" ]; then ok "row-id একক-প্রোব '$IDP' → ১-মিল (অনন্য)"; else bad "id-প্রোব ব্যর্থ (got=$C1 প্রত্যাশা=1)"; fi
agent-browser fill '#chFilter272' "$MOLD" >/dev/null 2>&1; sleep 0.4
C2=$(ev 'window.__chQA.count()' | tr -d '"')
if [ -n "$C2" ] && [ "$C2" = "$VALN" ]; then ok "marker-value প্রোব → পূর্বগণনা-মিল ($C2/$T)"; else bad "value-প্রোব ব্যর্থ (got=$C2 প্রত্যাশা=$VALN)"; fi
agent-browser fill '#chFilter272' 'testadmin' >/dev/null 2>&1; sleep 0.4
C3=$(ev 'window.__chQA.count()' | tr -d '"')
if [ -n "$C3" ] && [ "$C3" = "$USRN" ]; then ok "saved_by-প্রোব 'testadmin' → পূর্বগণনা-মিল ($C3/$T)"; else bad "saved_by-প্রোব ব্যর্থ (got=$C3 প্রত্যাশা=$USRN)"; fi
agent-browser fill '#chFilter272' 'রিভিশন revision' >/dev/null 2>&1; sleep 0.4
CHIPV=$(ev 'document.getElementById("chCount272").textContent' | tr -d '"')
if echo "$CHIPV" | grep -q "$ROWS / $T"; then ok "কাউন্ট-চিপ টেক্সট ($CHIPV)"; else bad "চিপ-টেক্সট ব্যর্থ (got=$CHIPV)"; fi
CHIPS=$(ev 'document.getElementById("chCount272").hidden' | tr -d '"')
if [ "$CHIPS" = "false" ]; then ok "চিপ সক্রিয়-প্রশ্নে দৃশ্যমান (hidden=false)"; else bad "চিপ-দৃশ্যমানতা ব্যর্থ (hidden=$CHIPS)"; fi
agent-browser fill '#chFilter272' zzzqqqxyz >/dev/null 2>&1; sleep 0.4
C4z=$(ev 'window.__chQA.count()' | tr -d '"')
EMPT=$(ev 'document.querySelector("[data-ch-empty]").hidden' | tr -d '"')
if [ "$C4z" = "0" ] && [ "$EMPT" = "false" ]; then ok "নো-ম্যাচ → কাউন্ট ০ + শূন্য-অবস্থা দৃশ্যমান"; else bad "শূন্য-অবস্থা ব্যর্থ (count=$C4z emptyHidden=$EMPT)"; fi
HID=$(ev 'Array.prototype.slice.call(document.querySelectorAll("tr[data-ch-row]")).filter(function(r){return r.hidden;}).length' | tr -d '"')
if [ "$HID" = "$T" ]; then ok "নো-ম্যাচে সব-সারফেস hidden ($HID/$T — tr-গার্ড-প্রমাণ)"; else bad "hidden-গণনা ব্যর্থ (got=$HID)"; fi
ev 'window.__chQA.clear()' >/dev/null 2>&1; sleep 0.3
C5=$(ev 'window.__chQA.count()' | tr -d '"')
if [ "$C5" = "$T" ]; then ok "__chQA.clear() → পুনরুদ্ধার ($T সারফেস)"; else bad "clear-পুনরুদ্ধার ব্যর্থ (got=$C5)"; fi
CHIPD=$(ev 'getComputedStyle(document.getElementById("chCount272")).display' | tr -d '"')
if [ "$CHIPD" = "none" ]; then ok "clear-পরে কাউন্ট-চিপ display:none (hidden-গার্ড)"; else bad "কাউন্ট-চিপ দৃশ্যমান-রেগেছে (display=$CHIPD)"; fi
ev 'document.body.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true,cancelable:true}))' >/dev/null 2>&1; sleep 0.3
AE=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
if [ "$AE" = "chFilter272" ]; then ok "'f'-কী → ফিল্টার-ফোকাস (body-বাবল, cancelable:true)"; else bad "'f'-ফোকাস ব্যর্থ (active=$AE)"; fi
FG=$(ev 'var s=document.querySelector("select[name=key]");s.focus();s.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true,cancelable:true}));document.activeElement.tagName' | tr -d '"')
if [ "$FG" = "SELECT" ]; then ok "ফিল্ড-গার্ড: key-select-থেকে 'f' → ফোকাস-চুরি-শূন্য"; else bad "ফিল্ড-গার্ড ব্যর্থ (active=$FG)"; fi
ev 'document.getElementById("chFilter272").value="probe272";document.getElementById("chFilter272").dispatchEvent(new Event("input"));document.getElementById("chFilter272").dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}))' >/dev/null 2>&1; sleep 0.3
EV=$(ev 'document.getElementById("chFilter272").value' | tr -d '"')
AE2=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
if [ -z "$EV" ] && [ "$AE2" != "chFilter272" ]; then ok "Escape → মান-শূন্য + ব্লার"; else bad "Escape ব্যর্থ (value=$EV active=$AE2)"; fi
agent-browser open "$BASE/admin/content/history" >/dev/null 2>&1; sleep 1
NH=$(ev 'typeof window.__chQA === "object" && window.__chQA.total() === 0' | tr -d '"')
if [ "$NH" = "true" ]; then ok "নো-কী-সারফেস: হুক জীবিত + total==০ (শূন্য-সারফেস-চুক্তি)"; else bad "নো-কী-হুক ব্যর্থ ($NH)"; fi
ev 'document.body.dispatchEvent(new KeyboardEvent("keydown",{key:"f",bubbles:true,cancelable:true}))' >/dev/null 2>&1; sleep 0.3
AE3=$(ev 'document.activeElement && document.activeElement.id' | tr -d '"')
if [ "$AE3" = "chFilter272" ]; then ok "নো-কী-সারফেসেও 'f'-ফোকাস কার্যকর (ac265-চুক্তি)"; else bad "নো-কী-'f'-ব্যর্থ (active=$AE3)"; fi
agent-browser open "$BASE/admin/content/history?key=$MKEY" >/dev/null 2>&1; sleep 1

echo "── ধাপ-৪: মোবাইল-390px + স্ক্রিনশট ──"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.6
HS=$(ev "JSON.stringify({ h:document.documentElement.scrollWidth>document.documentElement.clientWidth })" 2>/dev/null)
if echo "$HS" | grep -q 'h..:false'; then ok "390px hScroll-শূন্য"; else bad "390px-এ অনুভূমিক-স্ক্রল ($HS)"; fi
BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
agent-browser set viewport 1280 900 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s272-chfilter-desk.png" >/dev/null 2>&1
if [ -s "$APP/tests/s272-chfilter-desk.png" ]; then ok "s272-chfilter-desk.png"; else bad "ডেস্কটপ-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 0.5
agent-browser screenshot "$APP/tests/s272-chfilter-mobile390.png" >/dev/null 2>&1
if [ -s "$APP/tests/s272-chfilter-mobile390.png" ]; then ok "s272-chfilter-mobile390.png"; else bad "মোবাইল-স্ক্রিনশট ব্যর্থ"; fi
agent-browser set viewport 1280 900 >/dev/null 2>&1

echo "── ধাপ-৫: নতুন-ফিচার-ই২ই (revision-delete) + রিস্টোর + নেট-শূন্য-প্রমাণ ──"
# ৫-ক: settings-পুনরুদ্ধার — BASE_REV (value=X0) থাকলে restore (রিস্টোর-ই২ই); নইলে save('')
if [ -n "$BASE_REV" ]; then
  RR=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -X POST "$BASE/admin/content/restore" -H "x-csrf-token: $TOK" --data-urlencode "rev_id=$BASE_REV")
  if [ "$RR" = "302" ] || [ "$RR" = "303" ]; then ok "রিস্টোর-ই২ই (rev#$BASE_REV → settings=X0 পুনরুদ্ধার) ($RR)"; else bad "রিস্টোর-ব্যর্থ (HTTP $RR)"; fi
else
  RF=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -X POST "$BASE/admin/content" -H "x-csrf-token: $TOK" -F "__page=home" -F "home_stat1_label=")
  if [ "$RF" = "302" ] || [ "$RF" = "303" ]; then ok "settings-পুনরুদ্ধার-বিকল্প (save('') — ডিফল্ট-রেন্ডার সমতুল্য) ($RF)"; else bad "save('')-ব্যর্থ (HTTP $RF)"; fi
fi
# ৫-খ: delete-ই২ই — সব-নতুন-রিভিশন মুছুন (marker + restore/save-বর্জ্য)
PC=$(fetch_page)
NOW_IDS=$(ids_in "$PAGE")
DEL_IDS=$(id_newlist "$PRE_IDS" "$NOW_IDS")
DEL_N=$(echo "$DEL_IDS" | grep -c . || true)
if [ "$DEL_N" -ge 1 ]; then
  ok "delete-ই২ই শুরু ($DEL_N নতুন-রিভিশন)"
  DFAIL=0
  for RID in $DEL_IDS; do
    DRC=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" -X POST "$BASE/admin/content/history/delete" -H "x-csrf-token: $TOK" --data-urlencode "rev_id=$RID")
    case "$DRC" in 302|303) ;; *) DFAIL=$((DFAIL+1));; esac
  done
  if [ "$DFAIL" = "0" ]; then ok "delete-ফিচার ই২ই প্রমাণ ($DEL_N/$DEL_N সফল — নতুন-রাউট কার্যকর)"; else bad "delete-আংশিক-ব্যর্থ ($DFAIL ফেল)"; fi
else
  skip "delete-ই২ই (নতুন-রিভিশন-শূন্য — সিড-বিকল্প-পথ)"
fi
PC=$(fetch_page)
FIN_IDS=$(ids_in "$PAGE")
FIN_N=$(echo "$FIN_IDS" | grep -c . || true)
MLEFT=$(grep -cF "$MOLD" "$PAGE" || true)
if [ "$FIN_IDS" = "$PRE_IDS" ] && [ "$FIN_N" = "$PRE_N" ]; then
  ok "নেট-DB-রাইট-শূন্য প্রমাণ (revisions $PRE_N → $FIN_N — ids অপরিবর্তিত)"
else
  bad "নেট-শূন্য-প্রমাণ ব্যর্থ (pre=$PRE_N fin=$FIN_N)"
fi
if [ "$MLEFT" = "0" ]; then ok "marker-অবশেষ-শূন্য ($MOLD অনুপস্থিত)"; else bad "marker-অবশেষ ($MLEFT)"; fi

echo "════════════════════════════════"
echo "PASS=$PASS FAIL=$FAIL SKIP=$SKIP"
if [ "$FAIL" = "0" ]; then echo "ALL GREEN ✓"; exit 0; else echo "FAILURES ✗"; exit 1; fi
