#!/usr/bin/env node
/* ── session121: view-template duplicate-node audit (union-merge accident guard) ──
   প্রেক্ষাপট: ক্রস-এজেন্ট union-মার্জে দুবার ভিউ-টেমপ্লেটে একই নোড ঢুকে যাওয়া
   বারবার-দেখা দুর্ঘটনা-শ্রেণি (session12: article-single-এ comments-h ×২ —
   সাবমিটে "মন্তব্য (২)"/"মন্তব্য (1)" অসামঞ্জস্য-যুগল)। মার্জ-পরে এক-কমান্ড অডিট।

   চেক:
     1) এক-ফাইলে স্ট্যাটিক id="..." ডুপ্লিকেট (EJS-ইন্টারপোলেটেড আইডি ও JS-টেমপ্লেট-স্ট্রিং বাদ)
     2) `class="comments-h"` এক-ফাইলে >১ (session12-দুর্ঘটনার সঠিক-সিগনেচার)
     3) data-post-link কনটেইনার (.comments-list/.qa-answers-list) এক-ফাইলে >১
        — ইঞ্জিন প্রথমটাই ধরে, দ্বিতীয়টা মৃত/অপ্রত্যাশিত
     4) id="notifDropdown" / id="notifBadge" শেয়ার্ড-শেল ডুপ্লিকেট (header-ইনক্লুড ×২ ধরার প্রক্সি)

   বেসলাইন-হোয়াইটলিস্ট: নিচের ডুপ্লিকেটগুলো যাচাইকৃত-বেনাইন (EJS আইফ/এলস-আইফ
   মিউচুয়ালি-এক্সক্লুসিভ ব্রাঞ্চ — রানটাইমে একসাথে রেন্ডার হয় না)। ভিউ ঠিক করলে
   বেসলাইন-এন্ট্রি সরিয়ে দেওয়া উৎসাহিত।

   এক্সিট: ফাইন্ডিং থাকলে 1, না-হলে 0 (CI-বান্ধব)।   ব্যবহার: npm run audit:views
*/
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'views');
const findings = [];
let fileCount = 0;

/* যাচাইকৃত-বেনাইন (মিউচুয়ালি-এক্সক্লুসিভ EJS ব্রাঞ্চ): "file :: detail" হুবহু-ম্যাচ */
const BASELINE = new Set([
  'lekhok-resource-detail.ejs :: duplicate-id id="rsxdAct" ×4',   // res_type আইফ/এলস-আইফ চেইন
  'user/profile.ejs :: duplicate-id id="profile3DotMenu" ×3',     // isOwner/লগড-ইন/গেস্ট ব্রাঞ্চ
  'user/profile.ejs :: duplicate-id id="pfCopyLink" ×2',          // লগড-ইন/গেস্ট ব্রাঞ্চ
]);

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (name.endsWith('.ejs')) audit(p);
  }
}

function audit(path) {
  fileCount++;
  const src = readFileSync(path, 'utf8');
  const rel = path.slice(root.length + 1);
  const check = (label, detail) => findings.push({ file: rel, label, detail });

  // 1) স্ট্যাটিক id ডুপ্লিকেট (<% বা JS-টেমপ্লেট-স্ট্রিং-চিহ্ন থাকা আইডি স্কিপ)
  const ids = {};
  for (const m of src.matchAll(/\bid="([^"]+)"/g)) {
    const id = m[1];
    if (id.includes('<%') || /[+'`]/.test(id)) continue;
    ids[id] = (ids[id] || 0) + 1;
  }
  for (const [id, n] of Object.entries(ids)) {
    if (n > 1 && !BASELINE.has(rel + ' :: duplicate-id id="' + id + '" ×' + n)) {
      check('duplicate-id', `id="${id}" ×${n}`);
    }
  }

  // 2) comments-h ডুপ্লিকেট — session12-union-দুর্ঘটনার সিগনেচার
  const ch = (src.match(/class="[^"]*\bcomments-h\b[^"]*"/g) || []).length;
  if (ch > 1) check('comments-h-dup', `comments-h ×${ch}`);

  // 3) থ্রেড-কনটেইনার ডুপ্লিকেট
  for (const sel of ['comments-list', 'qa-answers-list']) {
    const n = (src.match(new RegExp(`class="[^"]*\\b${sel}\\b[^"]*"`, 'g')) || []).length;
    if (n > 1) check('thread-container-dup', `.${sel} ×${n}`);
  }

  // 4) শেয়ার্ড-শেল আইডি ডুপ্লিকেট (header ×২-ইনক্লুড প্রক্সি)
  for (const id of ['notifDropdown', 'notifBadge', 'notifList']) {
    const n = (src.match(new RegExp(`id="${id}"`, 'g')) || []).length;
    if (n > 1) check('shared-shell-dup', `id="${id}" ×${n}`);
  }
}

walk(root);

if (findings.length) {
  console.error(`✗ audit:views — ${findings.length} ফাইন্ডিং (${fileCount} .ejs স্ক্যান):`);
  for (const f of findings) console.error(`  [${f.label}] views/${f.file} — ${f.detail}`);
  process.exit(1);
} else {
  console.log(`✓ audit:views — পরিষ্কার (${fileCount} .ejs স্ক্যান, duplicate-node-শূন্য)`);
}
