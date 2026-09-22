#!/bin/bash
# lib-seed-users.sh — session246: stale-lf-সুইটের স্বয়ংসম্পূর্ণ-ইউজার-সেটআপ (register-API-পথ — প্রোডাকশন-প্রবাহ)
# ব্যবহার: source tests/lib-seed-users.sh; ensureUser "$J" testuser demo123 "টেস্ট ইউজার"
# চুক্তি: BASE ভ্যারিয়েবল কলার-সুইটে-সংজ্ঞাত; ইউজার-স্থায়ী (সিড-জঞ্জাল-পদ্ধতি-বহির্ভূত — লেগ্যাসি-ডেমো-ইউজার-সিমান্তিক; মেসেজ-অবশিষ্টাংশ row-level-অ্যাসার্ট-অস্পৃশ্য)
# ফেরত: stdout=স্টেটাস; rc 0=লগইন-প্রমাণিত
ensureUser(){
  local J="$1" U="$2" P="$3" NAME="${4:-টেস্ট ইউজার}" T C
  # ① সরাসরি-লগইন (ইউজার-আগেই-থাকলে এখানেই-শেষ — পুনঃরান-সস্তা)
  rm -f "$J"
  T=$(curl -s -c "$J" "$BASE/login" | grep -o 'name="_csrf" value="[^"]*"' | head -1 | sed 's/.*value="//;s/"$//')
  C=$(curl -s -b "$J" -c "$J" -o /dev/null -w "%{http_code}" --data-urlencode "username=$U" --data-urlencode "password=$P" --data-urlencode "_csrf=$T" "$BASE/login")
  if [ "$C" = "303" ] || [ "$C" = "302" ]; then echo "login-ok:$U"; return 0; fi
  # ② নিবন্ধন (register-API — multipart + action-query-CSRF; approval-gate ডিফল্ট-off → active)
  curl -s -c "$J" "$BASE/register" | grep -o 'action="/register?_csrf=[^"]*"' | head -1 | sed 's/.*_csrf=//;s/"$//' > /tmp/.lf-csrf.$$
  T=$(cat /tmp/.lf-csrf.$$); rm -f /tmp/.lf-csrf.$$
  if [ -z "$T" ]; then echo "no-csrf:$U"; return 1; fi
  curl -s -b "$J" -c "$J" -o /dev/null -X POST "$BASE/register?_csrf=$T" \
    -F "username=$U" -F "password=$P" -F "full_name=$NAME" -F "_csrf=$T"
  # ③ পুনঃলগইন
  rm -f "$J"
  T=$(curl -s -c "$J" "$BASE/login" | grep -o 'name="_csrf" value="[^"]*"' | head -1 | sed 's/.*value="//;s/"$//')
  C=$(curl -s -b "$J" -c "$J" -o /dev/null -w "%{http_code}" --data-urlencode "username=$U" --data-urlencode "password=$P" --data-urlencode "_csrf=$T" "$BASE/login")
  if [ "$C" = "303" ] || [ "$C" = "302" ]; then echo "registered+login-ok:$U"; return 0; fi
  echo "FAILED:$U:$C"; return 1
}
