#!/usr/bin/env node
// s240-unit.js — session240 trendN-সাধারণীকরণ রিগ্রেশন (helpers/support-center.js)
// চালানো: TZ=UTC node tests/s240-unit.js  (trend7-বাকেটিং TZ-নির্ভর — সুইট-পিন UTC; s231-unit-রীতি)
// চুক্তি: ① trend7 ≡ trendN(…,7) বাইট-অভিন্ন (সব-পুরোনো-সুইট-অ্যাসার্ট-রক্ষা) ② D-গেট শুধু ৭/৩০ — অন্য-মানে ৭-ফলব্যাক
//         ③ ৩০-দিন-সিরিজে শেষ-ইনডেক্স = staleCount-সমস্বর (কার্ড-মান-স্পর্শক-গ্যারান্টি trend7-চুক্তির-সম্প্রসারণ)
'use strict';
const SC = require('../helpers/support-center');
let P = 0, F = 0;
function ok(c, m) { if (c) { P++; console.log('  ✓ ' + m); } else { F++; console.log('  ✗ ' + m); } }

const NOW = new Date('2026-09-22T10:00:00Z').getTime();
const rows = [
  { id: 1, status: 'PENDING', created_at: '2026-09-22 09:00:00', note_history: null },
  { id: 2, status: 'PENDING', created_at: '2026-09-17 08:00:00', note_history: null },
  { id: 3, status: 'RESOLVED', created_at: '2026-09-21 06:00:00',
    note_history: JSON.stringify([{ t: 'status', from: 'IN_PROGRESS', to: 'RESOLVED', at: '2026-09-21T12:00:00.000Z' }]) },
];
const t7 = SC.trend7(rows, NOW);
const tN7 = SC.trendN(rows, NOW, 7);
const t30 = SC.trendN(rows, NOW, 30);

ok(JSON.stringify(t7) === JSON.stringify(tN7), 'trend7 ≡ trendN(7) বাইট-অভিন্ন (ডেলিগেশন-চুক্তি)');
ok(t30.newPerDay.length === 30 && t30.resolvedPerDay.length === 30 && t30.stalePerDay.length === 30 && t30.avgPerDay.length === 30 && t30.dayLabels.length === 30, '৩০-দিন-সিরিজ ×৫-অ্যারে ৩০-দৈর্ঘ্য');
ok(t30.newPerDay[29] === 1, 'trendN(30) newPerDay[29]=১ (আজ-নতুন — সর্বশেষ-ইনডেক্স)');
ok(t30.resolvedPerDay[28] === 1, 'trendN(30) resolvedPerDay[28]=১ (গতকাল-সমাধান)');
ok(t30.stalePerDay[29] === SC.staleCount(rows), 'trendN(30) stalePerDay[29]=staleCount-সমস্বর (স্পর্শক-গ্যারান্টি)');
ok(t30.newPerDay.slice(0, 21).every(v => v === 0), '৩০-দিন-উইন্ডোর বাইরে-শূন্য (২১+ দিন-পুরোনো-রো নেই)');
ok(t30.dayLabels[29] === t7.dayLabels[6], 'dayLabels-শেষ-উপাদান সমস্বর (আজ-লেবেল এক-উৎস)');
ok(SC.trendN(rows, NOW, 15).newPerDay.length === 7, 'D-গেট: অবৈধ-ব্যাপ্তি (15) → ৭-ফলব্যাক');
ok(SC.trendN(rows, NOW).newPerDay.length === 7, 'D-গেট: days-বিহীন-ডাক → ৭-ফলব্যাক');
ok(SC.trendN(null, NOW, 30).newPerDay.every(v => v === 0), 'trendN never-throws (null-rows)');
ok(SC.trendN([{ id: 9, status: 'PENDING', created_at: 'করাপ্ট' }], NOW, 30).newPerDay.every(v => v === 0), 'trendN করাপ্ট-তারিখ-নিরাপদ');
ok(SC.trendN(rows, NaN, 30).stalePerDay[29] === 1, 'trendN NaN-now-নিরাপদ (Date.now-ফলব্যাক)');

console.log('');
console.log('s240-unit: ' + P + '/' + (P + F));
process.exit(F === 0 ? 0 : 1);
