#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
s276-epaperfix.py — session276 বাগ-ফিক্স: epaper.css hex-ratchet লঙ্ঘন-সংশোধন (s226-অবদান)
মূল-কারণ: session-226 epaper.css-এ ৫টি lf-টোকেন (--lf-ink/-ink-mute/-ink-soft/-accent-soft/-accent-glow)
tokens.css-এ-ই-অনুপস্থিত ছিল — ইনলাইন-ফলব্যাক-নির্ভর + ৪৭ হেক্স → guard ratchet (baseline ০) ভাঙে।

ফিক্স (ডিজাইন-সিস্টেম-সঠিক পথ):
1. tokens.css-এ অনুপস্থিত-টোকেন ×৬ সংযোজন (সমতুল্য-টোকেন-অ্যালায়াস + নতুন-মান ×২)
2. epaper.css: হেক্স-ফলব্যাক-স্ট্রিপ (টোকেন-এখন-বিদ্যমান) + কাঁচা-হেক্স → টোকেন (#fff→--lf-white, #E8A700→--lf-gold-badge)
3. পোস্ট-অ্যাসার্ট: epaper.css হেক্স-গণনা ০ + var()-গণনা-অপরিবর্তিত + রেন্ডার-স্পট
idempotent: পুনঃরানে SKIP।
"""
import re, sys

def fatal(msg):
    print('FATAL:', msg); sys.exit(1)

TOK = 'public/assets/css/tokens.css'
EP = 'public/assets/css/epaper.css'

tok = open(TOK, encoding='utf-8').read()
ep = open(EP, encoding='utf-8').read()
ep_orig_len = len(ep)

# ── idempotency: epaper-ফেজ-সম্পন্ন হলে (হেক্স-০) SKIP ──
if len(re.findall(r'#[0-9a-fA-F]{3,8}\b', ep)) == 0 and 'session276-epaper-family' in tok:
    print('SKIP: epaper.css হেক্স-০ + tokens.css সংযোজিত — সম্পূর্ণ-সংশোধিত')
    sys.exit(0)

# ── idempotency ──
if 'session276-epaper-family' in tok:
    print('SKIP: tokens.css সংশোধন-পূর্ব-উপস্থিত')
else:
    ADD = """
  /* session276-epaper-family — s226-epaper.css-ব্যবহৃত-অনুপস্থিত lf-টোকেন-সংযোজন (ফলব্যাক-নির্ভরতা-অপসারণ) */
  --lf-ink: var(--lf-fb-ink);
  --lf-ink-mute: var(--lf-text-tertiary);
  --lf-ink-soft: #4B4C4F;
  --lf-accent-soft: var(--accent-soft);
  --lf-accent-glow: var(--accent-glow);
  --lf-gold-badge: #E8A700;
"""
    if '--lf-gold-badge' in tok: fatal('tokens.css-এ --lf-gold-badge প্রি-উপস্থিত (অসঙ্গতি)')
    m = re.search(r'\n\}\n', tok)
    if not m: fatal('tokens.css :root-বন্ধ-অ্যাঙ্কর পাওয়া-যায়নি')
    tok = tok[:m.start()] + ADD + '}\n' + tok[m.end():]
    # পোস্ট-অ্যাসার্ট: টোকেন ×৬ উপস্থিত
    for t in ('--lf-ink:', '--lf-ink-mute:', '--lf-ink-soft:', '--lf-accent-soft:', '--lf-accent-glow:', '--lf-gold-badge:'):
        if t not in tok: fatal(f'tokens.css-সংযোজন-ব্যর্থ: {t}')
    open(TOK, 'w', encoding='utf-8').write(tok)
    print('OK: tokens.css — অনুপস্থিত-টোকেন ×৬ সংযোজন (--lf-ink/-ink-mute/-ink-soft/-accent-soft/-accent-glow/-gold-badge)')

# ── epaper.css সংশোধন ──
pre_varcount = ep.count('var(--lf-')
pre_hexcount = len(re.findall(r'#[0-9a-fA-F]{3,8}\b', ep))

# 1) হেক্স-ফলব্যাক-স্ট্রিপ: var(--lf-X, #hex) → var(--lf-X)
ep2, n_fb = re.subn(r'var\((--lf-[a-z0-9-]+),\s*#[0-9a-fA-F]{3,8}\)', r'var(\1)', ep)
# 2) rgba-ফলব্যাক-স্ট্রিপ (টোকেন-এখন-বিদ্যমান)
ep2, n_rgba = re.subn(r'var\((--lf-accent-(?:soft|glow)),\s*rgba\([^)]*\)\)', r'var(\1)', ep2)
# 3) কাঁচা-হেক্স → টোকেন
for pat, rep, label in [
    (r'#fff\b', 'var(--lf-white)', '#fff→--lf-white'),
    (r'#E8A700\b', 'var(--lf-gold-badge)', '#E8A700→--lf-gold-badge'),
    (r'#006A4E\b', 'var(--lf-brand-primary)', '#006A4E-অবশিষ্ট→--lf-brand-primary'),
    (r'#FDFDFC\b', 'var(--lf-surface-tint)', '#FDFDFC-অবশিষ্ট→--lf-surface-tint'),
    (r'#E4E6EB\b', 'var(--lf-ui-border)', '#E4E6EB-অবশিষ্ট→--lf-ui-border'),
    (r'#8A8D91\b', 'var(--lf-text-tertiary)', '#8A8D91-অবশিষ্ট→--lf-text-tertiary'),
    (r'#1C1E21\b', 'var(--lf-fb-ink)', '#1C1E21-অবশিষ্ট→--lf-fb-ink'),
    (r'#4B4C4F\b', 'var(--lf-ink-soft)', '#4B4C4F-অবশিষ্ট→--lf-ink-soft'),
    (r'#FFFAFA\b', 'var(--lf-surface-snow)', '#FFFAFA-অবশিষ্ট→--lf-surface-snow'),
    (r'#111\b', 'var(--lf-ink-max)', '#111-অবশিষ্ট→--lf-ink-max'),
]:
    ep2 = re.sub(pat, rep, ep2, flags=re.I)

post_hexcount = len(re.findall(r'#[0-9a-fA-F]{3,8}\b', ep2))
post_varcount = ep2.count('var(--lf-')
if post_hexcount != 0: fatal(f'epaper.css হেক্স-অবশিষ্ট: {re.findall(r"#[0-9a-fA-F]{3,8}\b", ep2)[:6]}')
# কাঁচা-হেক্স→টোকেন রূপান্তর var()-গণনা বাড়ায়: #fff×২ + #E8A700×১ + #006A4E-কাঁচা×১ = +৪
if post_varcount != pre_varcount + 4: fatal(f'var()-গণনা-অপ্রত্যাশিত {pre_varcount}→{post_varcount} (প্রত্যাশা +৪)')
if n_fb != 43: fatal(f'হেক্স-ফলব্যাক-স্ট্রিপ-গণনা {n_fb} (প্রত্যাশা ৪৩)')
if pre_hexcount != 47: fatal(f'প্রি-হেক্স-গণনা {pre_hexcount} (প্রত্যাশা ৪৭)')
open(EP, 'w', encoding='utf-8').write(ep2)
print(f'OK: epaper.css — হেক্স-ফলব্যাক-স্ট্রিপ ×{n_fb} + rgba-ফলব্যাক-স্ট্রিপ ×{n_rgba} + কাঁচা-হেক্স→টোকেন ×{pre_hexcount - n_fb} ({ep_orig_len} → {len(ep2)} বাইট)')
print(f'  হেক্স-গণনা {pre_hexcount} → {post_hexcount} (ratchet-baseline ০ ✓), var(--lf- গণনা {pre_varcount} → {post_varcount} (+৪ কাঁচা-রূপান্তর)')
print('EPAPERFIX-DONE')
