#!/usr/bin/env node
// s231-unit.js — helpers/support-center.js পিওর-ফাংশন রিগ্রেশন (trend7/digestStats/parseHistory)
// চালানো: TZ=UTC node tests/s231-unit.js  (local-midnight-বাকেটিং TZ-নির্ভর — সুইট-পিন UTC; session227-থ্রেশহোল্ড-চুক্তি: সীমা-থেকে-দূরে-মান)
'use strict';
const SC = require('../helpers/support-center');
let P = 0, F = 0;
function ok(c, m) { if (c) { P++; console.log('  ✓ ' + m); } else { F++; console.log('  ✗ ' + m); } }

const NOW = new Date('2026-09-22T10:00:00Z').getTime();
const rows = [
  { id: 1, status: 'PENDING', created_at: '2026-09-22 09:00:00', note_history: null },            // আজ-নতুন (১ঘ বয়স)
  { id: 2, status: 'PENDING', created_at: '2026-09-17 08:00:00', note_history: null },            // ৫-দিন-স্টেল
  { id: 3, status: 'RESOLVED', created_at: '2026-09-21 06:00:00',                                  // গতকাল-সমাধান (৬ঘ-সময়)
    note_history: JSON.stringify([{ t: 'status', from: 'IN_PROGRESS', to: 'RESOLVED', at: '2026-09-21T12:00:00.000Z' }]) },
];
const t = SC.trend7(rows, NOW);
ok(t.newPerDay[6] === 1, 'trend7 newPerDay[6]=১ (আজ-নতুন)');
ok(t.resolvedPerDay[5] === 1, 'trend7 resolvedPerDay[5]=১ (গতকাল-সমাধান)');
ok(t.stalePerDay[6] === 1 && t.stalePerDay[5] === 1, 'trend7 stalePerDay[6]=staleCount-সমস্বর + [5]=১');
ok(t.dayLabels.length === 7 && typeof t.dayLabels[6] === 'string', 'trend7 dayLabels ৭-দৈর্ঘ্য');
const d = SC.digestStats(rows, NOW);
ok(d.fresh24 === 1, 'digestStats fresh24=১');
ok(d.resolved24 === 1, 'digestStats resolved24=১ (২৪ঘ-বে)');
ok(d.stale === 1, 'digestStats stale=staleCount-এক-উৎস');
ok(d.oldestOpenDays === 5, 'digestStats oldestOpenDays=৫');
ok(d.avgResolveHours === 6, 'digestStats avgResolveHours=৬ (০৬→১২ঘ)');
ok(SC.trend7(null, NOW).newPerDay.every(v => v === 0), 'trend7 never-throws (null-rows)');
ok(SC.digestStats([], NOW).fresh24 === 0, 'digestStats never-throws (খালি-rows)');
ok(SC.digestStats([{ id: 9, status: 'PENDING', created_at: 'করাপ্ট' }], NOW).stale === 0, 'digestStats করাপ্ট-তারিখ-নিরাপদ');
ok(JSON.stringify(SC.parseHistory('not-json')) === '[]', 'parseHistory করাপ্ট-নিরাপদ');
console.log('s231-unit: ' + P + '/' + (P + F));
process.exit(F ? 1 : 0);
