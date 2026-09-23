#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
s273-patch2.py — session273 সংশোধনী: su273 data-kw-তে রোল/স্ট্যাটাস-মানের ল্যাটিন-অ্যালায়াস
(av271-পরিবার-চুক্তি: মান-টোকেনও দ্বিভাষিক — 'মডারেটর moderator', 'সক্রিয় active')
skip-if-present idempotent (ROLE_ALIAS273 মার্কার) + in-memory → assert → write
"""
import re, sys

VIEW = 'admin/views/admin/super/users.ejs'
view = open(VIEW, encoding='utf-8').read()

def fatal(msg):
    print('FATAL:', msg); sys.exit(1)

if 'ROLE_ALIAS273' in view:
    print('SKIP: ROLE_ALIAS273 পূর্ব-উপস্থিত — idempotent রান')
    sys.exit(0)

OLD = """              'রোল role', ROLE_LABEL[u.role] || u.role,
              'স্ট্যাটাস status', STATUS_LABEL[u.status] || u.status,"""
NEW = """              'রোল role', ROLE_LABEL[u.role] || u.role,
              /* ROLE_ALIAS273 — মান-টোকেনও দ্বিভাষিক (av271-চুক্তি) */
              ({ user: 'user', moderator: 'moderator', admin: 'admin', superadmin: 'superadmin' })[u.role] || '',
              'স্ট্যাটাস status', STATUS_LABEL[u.status] || u.status,
              ({ active: 'active', pending: 'pending', banned: 'banned', inactive: 'inactive' })[u.status] || '',"""

if view.count(OLD) != 1: fatal(f'OLD-অ্যাঙ্কর অনন্য-নয় (n={view.count(OLD)})')
view2 = view.replace(OLD, NEW, 1)

# পোস্ট-অ্যাসার্ট
assert 'ROLE_ALIAS273' in view2
assert view2.count("({ user: 'user', moderator: 'moderator', admin: 'admin', superadmin: 'superadmin' })[u.role]") == 1
assert view2.count("({ active: 'active', pending: 'pending', banned: 'banned', inactive: 'inactive' })[u.status]") == 1
assert view2.count("data-kw=") == view.count("data-kw=")  # টেমপ্লেট-স্তর অপরিবর্তিত
m = re.search(r'/\* session273 — su273 তাৎক্ষণিক-ফিল্টার স্টাইল.*?</style>', view2, re.S)
if not m: fatal('স্টাইল-ব্লক-নিষ্কাশন ব্যর্থ')
if re.findall(r'#[0-9a-fA-F]{3,8}\b', m.group(0)): fatal('স্টাইল-ব্লকে হেক্স')

open(VIEW, 'w', encoding='utf-8').write(view2)
print(f'PATCHED-2: {VIEW} ({len(view)} → {len(view2)} বাইট) — রোল/স্ট্যাটাস-অ্যালায়াস যুক্ত')
