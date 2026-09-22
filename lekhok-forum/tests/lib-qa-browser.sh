# tests/lib-qa-browser.sh — শেয়ার্ড browser-health গার্ড (session248; স্থায়ী — রিপো-কমিটেড)
# ঝুঁকি-শ্রেণি (ব্যাটারি-প্রমাণিত ×২): ২২-সুইট-ক্রমে Chrome-প্রসেস-মৃত্যু (মেমরি-চাপ/crash)
#   → পরবর্তী সুইটের agent-browser কল স্টেল-উইন্ডোতে পড়ে (লগইন about:blank / স্ক্রিনশট-ব্যর্থ)
#   → daemon on-demand-রিলাঞ্চ করে কিন্তু রিলাঞ্চ-সময় > সুইটের রিট্রি-জানালা
# চুক্তি: balive = daemon+browser-জীবিত-প্রমাণ (≤20s; জীবিত-হলে তাৎক্ষণিক-রিটার্ন — ওভারহেড-শূন্য)
# ব্যবহার: মৃত্যু-সন্দেহ-পয়েন্টে (লগইন-পূর্ব/স্ক্রিনশট-পূর্ব) dead-detect-সহ:
#   BHC=$(agent-browser get url 2>/dev/null || echo ''); [ -z "$BHC" ] && balive || true
#   → রিলাঞ্চ-পরে সেশন/পৃষ্ঠা হারায় — প্রয়োজনে পুনঃ-open + installErrs পুনঃ-আর্ম করুন
balive(){
  local i
  for i in $(seq 1 20); do
    if agent-browser get url >/dev/null 2>&1; then return 0; fi
    sleep 1
  done
  return 1
}
