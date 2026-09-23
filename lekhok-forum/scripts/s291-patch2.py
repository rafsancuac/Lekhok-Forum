#!/usr/bin/env python3
# s291-patch2.py — session291-অনুপূরক: eager-কাউন্টার (নির্ধারক-ক্যাপ-প্রমাণ)
# প্রেক্ষাপট: মিড-স্টেট pending/lazy-অ্যাসার্ট অনির্ধারক (IO-ফায়ারে paint-এর-সিঙ্ক is-pending-রিমুভাল —
# lazy++ রেন্ডার-সমাপ্তি-পরে) → ক্যাপ-প্রমাণ eager-কাউন্টারে (eager-শাখায়-একক-বৃদ্ধি — IO-অপেক্ষাকৃত)
# + is-lazy-শ্রেণি (কিউ-স্থায়ী-মার্কার) দ্বৈত-প্রমাণ। মার্কার: ep291Eager (idempotent ×N)।
import sys

EJS = '/home/z/lekhok-forum/lekhok-forum/lekhok-forum/views/user/epaper.ejs'
MARK = 'ep291Eager'

def die(m):
    print('PATCH2-FAIL: ' + m)
    sys.exit(1)

ej = open(EJS, encoding='utf-8').read()
if MARK in ej:
    print('PATCH2-SKIP: মার্কার-উপস্থিত (idempotent)')
    sys.exit(0)

A1 = '  var ep291Lazy = 0, ep291IO = null;\n'
A2 = '      if (RAIL_PRE_MAX > 0 && n > RAIL_PRE_MAX) { ep291Queue(items[n - 1], n, st, cache, tok); return step(); }\n'
A3 = "    lazy: function () { return ep291Lazy; },\n"
for name, a in [('A1', A1), ('A2', A2), ('A3', A3)]:
    if ej.count(a) != 1:
        die('%s-অ্যাঙ্কর-কাউন্ট=%d (১-প্রত্যাশিত)' % (name, ej.count(a)))

ej = ej.replace(A1, A1 + '  var ep291Eager = 0; // session291: eager-শাখা-কাউন্টার (নির্ধারক-ক্যাপ-প্রমাণ — IO-অপেক্ষাকৃত)\n', 1)
ej = ej.replace(A2, A2 + '      ep291Eager++;\n', 1)
ej = ej.replace(A3, A3 + '    eager: function () { return ep291Eager; },\n', 1)

open(EJS, 'w', encoding='utf-8').write(ej)

ej = open(EJS, encoding='utf-8').read()
if ej.count('ep291Eager') < 3:
    die('ep291Eager-গণনা=%d (≥৩-প্রত্যাশিত)' % ej.count('ep291Eager'))
if 'eager: function () { return ep291Eager; }' not in ej:
    die('হুক-ফিল্ড-অনুপস্থিত')
print('PATCH2-OK: eager-কাউন্টার (ডেক্লেয়ারেশন + গেট-পরে-বৃদ্ধি + __ep291QA.eager)')
