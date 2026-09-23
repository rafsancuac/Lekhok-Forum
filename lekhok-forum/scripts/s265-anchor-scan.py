#!/usr/bin/env python3
# s265-anchor-scan.py — session264-বাকি-প্রস্তাব: লেগেসি-সুইটের অ্যাঙ্কর-শূন্য URL-grep স্ক্যান
# খোঁজে: tests/*.sh-এ এমন grep যেখানে টার্গেট-পেজ URL (যেমন /admin) লগইন-পেজের
# (/admin/login) উপসর্গ → সেশন-মিথ্যা-সক্রিয়-গার্ড ঝুঁকি (session264 গোটচা)।
# নিরাপদ রূপ: '/admin/?$' (অ্যাঙ্করড) বা '/admin/login' (আসল-লগইন) বা '/admin?' ইত্যাদি।
import re
import glob
import sys

PAT_GREP_URL = re.compile(
    r"grep\s+(?:-q\S*\s+|-q\S*\s+-\S+\s+)?[\"']([^\"']*?(?:/admin|/moderator)[^\"']*)[\"']"
)

def is_risky(pat: str) -> bool:
    p = pat.strip()
    # নিরাপদ রূপসমূহ
    if re.search(r"\?\$\$|\?\$\b|/\?\$|'\$$|\$$", p):  # ends with $ anchor
        return False
    if "/admin/login" in p or "/moderator/login" in p:
        return False
    if re.search(r"[a-z-]\?", p):  # /admin?x= — query → উপসর্গ-ঝুঁকি নেই (login-পেজে ? নেই)
        return False
    # ঝুঁকি: পেজ-পাথ যা /admin/login বা /moderator/*-login এর উপসর্গ হতে পারে
    for login in ("/admin/login", "/moderator/login"):
        if login.startswith(p) and p not in ("", "/"):
            return True
    return False

hits = []
for f in sorted(glob.glob("tests/*.sh")):
    try:
        lines = open(f, encoding="utf-8").read().splitlines()
    except Exception:
        continue
    for i, line in enumerate(lines, 1):
        if line.strip().startswith("#"):
            continue
        for m in PAT_GREP_URL.finditer(line):
            pat = m.group(1)
            if is_risky(pat):
                hits.append((f, i, pat, line.strip()[:140]))

for f, i, pat, ctx in hits:
    print(f"{f}:{i}: pattern={pat!r}")
    print(f"    {ctx}")
print("TOTAL-RISKY:", len(hits))
