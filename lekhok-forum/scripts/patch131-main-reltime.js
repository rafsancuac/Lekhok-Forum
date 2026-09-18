#!/usr/bin/env node
/* সেশন ১৩১: main.js-এ LekhokRelTime UTC-সচেতন পার্স + Asia/Dhaka প্রদর্শন-প্যাচ (রিভার্সিবল নয় — অ্যানকার-কাউন্ট-ভেরিফাইড) */
const fs = require('fs');
const P = 'public/assets/js/main.js';
let s = fs.readFileSync(P, 'utf8');
const edits = [
  /* পার্সার: DB-নেম-লেস = UTC */
  ['const t=new Date(e).getTime();if(isNaN(t))return null;',
   'const t=_pTs131(e);if(isNaN(t))return null;'],
  /* >৭-দিন ফলব্যাক: হোস্ট/ক্লায়েন্ট-লোকাল get* → ঢাকা-পিনড (UTC+6 getUTC কৌশল) */
  ['const r=new Date(t);return i(r.getDate())+" "+l[r.getMonth()]+", "+i(r.getFullYear())',
   'const r=new Date(t+216e5);return i(r.getUTCDate())+" "+l[r.getUTCMonth()]+", "+i(r.getUTCFullYear())'],
  /* টুলটিপ: নেম-লেস-পার্স + ঢাকা-টাইমজোন */
  ['e.setAttribute("title",new Date(e.dataset.ts).toLocaleString("bn-BD"))',
   'e.setAttribute("title",_dTs131(e.dataset.ts))'],
];
let fail = 0;
for (const [from, to] of edits) {
  if (s.split(from).length - 1 !== 1) { console.error('ANCHOR-FAIL:', from.slice(0, 60)); fail = 1; continue; }
  s = s.replace(from, to);
}
if (fail) process.exit(1);
/* হেল্পার-ইনজেকশন — d-এর ঠিক আগে (একই IIFE-স্কোপ) */
const anchor = 'function d(e){(e||document).querySelectorAll("[data-ts]")';
if (s.split(anchor).length - 1 !== 1) { console.error('INJECT-ANCHOR-FAIL'); process.exit(1); }
const helpers = 'function _pTs131(s){s=String(s==null?"":s).trim();if(!s)return NaN;if(/^\\d{4}-\\d{2}-\\d{2}$/.test(s))return new Date(s+"T00:00:00Z").getTime();if(/^\\d{4}-\\d{2}-\\d{2}[ T]\\d{2}:\\d{2}(:\\d{2}(?:\\.\\d+)?)?$/.test(s))return new Date(s.replace(" ","T")+"Z").getTime();const d=new Date(s);return d.getTime()}function _dTs131(s){const t=_pTs131(s);if(isNaN(t))return String(s||"");try{return new Date(t).toLocaleString("bn-BD",{timeZone:"Asia/Dhaka"})}catch(e){const r=new Date(t+216e5);return r.getUTCDate()+" "+["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"][r.getUTCMonth()]+", "+r.getUTCFullYear()+" "+String(r.getUTCHours()).padStart(2,"0")+":"+String(r.getUTCMinutes()).padStart(2,"0")}}';
s = s.replace(anchor, helpers + anchor);
fs.writeFileSync(P, s);
console.log('PATCHED OK — main.js');
