#!/usr/bin/env python3
# s291-patch3.py — session291-অনুপূরক: pending()-সেলেক্টর-সংশোধন
# গোটচা: is-pending শ্রেণি .ep-rail-item-এ নয় — ভিতরের .ep-rail-thumb স্প্যানে
# (b.innerHTML = '<span class="ep-rail-thumb is-pending">') → item-সেলেক্টর সর্বদা-শূন্য-গণনা
# (শূন্য-সত্য-অ্যাসার্ট-ঝুঁকি) → thumb-সেলেক্টর-ই সঠিক। মার্কার: ep291-thumb-pending-fix।
import sys

EJS = '/home/z/lekhok-forum/lekhok-forum/lekhok-forum/views/user/epaper.ejs'
MARK = 'ep291-thumb-pending-fix'
BAD = "pending: function () { return elRail ? elRail.querySelectorAll('.ep-rail-item.is-pending').length : -1; },"
GOOD = "pending: function () { return elRail ? elRail.querySelectorAll('.ep-rail-thumb.is-pending').length : -1; }, // ep291-thumb-pending-fix"

ej = open(EJS, encoding='utf-8').read()
if MARK in ej:
    print('PATCH3-SKIP: মার্কার-উপস্থিত (idempotent)')
    sys.exit(0)
if ej.count(BAD) != 1:
    print('PATCH3-FAIL: BAD-সেলেক্টর-কাউন্ট=%d' % ej.count(BAD))
    sys.exit(1)
ej = ej.replace(BAD, GOOD, 1)
open(EJS, 'w', encoding='utf-8').write(ej)
ej = open(EJS, encoding='utf-8').read()
if GOOD not in ej or BAD in ej:
    print('PATCH3-FAIL: পোস্ট-যাচাই')
    sys.exit(1)
print('PATCH3-OK: pending() → .ep-rail-thumb.is-pending (বাস্তব-কিউ-গণনা)')
