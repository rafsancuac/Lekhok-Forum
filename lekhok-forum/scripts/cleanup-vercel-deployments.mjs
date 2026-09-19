#!/usr/bin/env node
/**
 * lekhok-forum/scripts/cleanup-vercel-deployments.mjs (session171)
 *
 * ভার্সেল-অ্যাকাউন্টের পুরনো ডিপ্লয়মেন্ট পরিষ্কার — সর্বশেষ Nটি রেখে বাকিগুলো ডিলিট।
 *
 * কেন দরকার: প্রতিটি ডিপ্লয়মেন্টের ফাংশন-বান্ডেল (node_modules + public/** + views/**)
 * ভার্সেলে স্থায়ীভাবে জমা থাকে; পুরনোগুলো মুছলে "Functions Storage" সীমা
 * (Hobby প্ল্যান: ১০ GB) ফিরে আসে এবং অ্যাকাউন্ট সুস্থ থাকে।
 *
 * ব্যবহার:
 *   # প্রথমে ড্রাই-রান — কী মোছা হবে শুধু দেখাবে, কিছুই মুছবে না
 *   VERCEL_TOKEN=xxxx node lekhok-forum/scripts/cleanup-vercel-deployments.mjs --dry-run
 *
 *   # আসল ডিলিট (ডিফল্ট: সর্বশেষ ৫টি রেখে)
 *   VERCEL_TOKEN=xxxx node lekhok-forum/scripts/cleanup-vercel-deployments.mjs
 *
 *   # রাখার সংখ্যা বদলাতে
 *   VERCEL_TOKEN=xxxx node lekhok-forum/scripts/cleanup-vercel-deployments.mjs --keep 10
 *
 * পরিবেশ-ভেরিয়েবল:
 *   VERCEL_TOKEN      (আবশ্যিক) https://vercel.com/account/settings/tokens থেকে
 *   VERCEL_ORG_ID     (ঐচ্ছিক) টিম-অ্যাকাউন্ট হলে; ব্যক্তিগত অ্যাকাউন্টে লাগে না
 *   VERCEL_PROJECT_ID (ঐচ্ছিক) না দিলে নাম-দিয়ে খুঁজে নেয় (VERCEL_PROJECT_NAME, ডিফল্ট "lekhok-forum")
 *   KEEP_COUNT        (ঐচ্ছিক) ডিফল্ট ৫ — --keep ফ্ল্যাগে ওভাররাইড
 *   VERCEL_API_BASE   (ঐচ্ছিক) টেস্ট-মকের জন্য; ডিফল্ট https://api.vercel.com
 *
 * নিরাপত্তা-নিশ্চয়তা:
 *   - সর্বশেষ KEEP_COUNT-টি সবসময় অক্ষত (বর্তমানে-লাইভ ডিপ্লয়মেন্ট সবসময় এর ভেতরে)
 *   - BUILDING / QUEUED / INITIALIZING অবস্থার ডিপ্লয়মেন্ট কখনো স্পর্শ হয় না
 *   - ভার্সেল নিজেই কারেন্ট-প্রোডাকশন-ডিপ্লয়মেন্ট ডিলিটে বাধা দেয় — স্ক্রিপ্ট তাকে স্কিপ-লগ করে
 */

import { appendFileSync } from 'node:fs';

const API_BASE = (process.env.VERCEL_API_BASE || 'https://api.vercel.com').replace(/\/+$/, '');
const TOKEN = process.env.VERCEL_TOKEN || '';
const TEAM_ID = process.env.VERCEL_ORG_ID || process.env.VERCEL_TEAM_ID || '';
const PROJECT_ID = process.env.VERCEL_PROJECT_ID || '';
const PROJECT_NAME = process.env.VERCEL_PROJECT_NAME || 'lekhok-forum';

const argv = process.argv.slice(2);
const hasFlag = (f) => argv.includes(f);
const flagValue = (f) => {
  const i = argv.indexOf(f);
  return i !== -1 ? argv[i + 1] : undefined;
};

const DRY_RUN = hasFlag('--dry-run') || hasFlag('-n');
const KEEP_COUNT = (() => {
  const raw = flagValue('--keep') ?? flagValue('-k') ?? process.env.KEEP_COUNT ?? '5';
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n >= 1 ? n : 5;
})();

// কেবল শেষ-হওয়া অবস্থার ডিপ্লয়মেন্টই মোছা যায়; চলমানগুলো স্পর্শ-নিষিদ্ধ
const DELETABLE = new Set(['READY', 'ERROR', 'CANCELED', 'DEACTIVATED', 'DELETED']);
const ACTIVE = new Set(['QUEUED', 'BUILDING', 'INITIALIZING']);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function fatal(msg) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

if (!TOKEN) {
  fatal(
    [
      'VERCEL_TOKEN পাওয়া যায়নি।',
      '',
      '  ১) https://vercel.com/account/settings/tokens → "Add New…" বাটন',
      '  ২) Scope: আপনার অ্যাকাউন্ট, Expiration: স্বল্প মেয়াদ (যেমন ৩০ দিন)',
      '  ৩) চালান:',
      '     VERCEL_TOKEN=xxxx node lekhok-forum/scripts/cleanup-vercel-deployments.mjs --dry-run',
      '',
      '  GitHub-অ্যাকশনে অটো-চালাতে রিপো → Settings → Secrets → Actions-এ',
      '  VERCEL_TOKEN / VERCEL_ORG_ID / VERCEL_PROJECT_ID সিক্রেট যোগ করুন',
      '  (.github/workflows/vercel-cleanup.yml প্রতিদিন রাত ১২টায় ঢাকা-সময়ে চলে)',
    ].join('\n'),
  );
}

function apiUrl(path, params = {}) {
  const u = new URL(API_BASE + path);
  if (TEAM_ID) u.searchParams.set('teamId', TEAM_ID);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') u.searchParams.set(k, String(v));
  }
  return u;
}

async function vercel(path, { method = 'GET', params } = {}) {
  let res;
  for (let attempt = 1; attempt <= 4; attempt++) {
    res = await fetch(apiUrl(path, params), {
      method,
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    if (res.status === 429 || res.status >= 500) {
      const wait = attempt * 2000;
      console.warn(`   ⏳ ভার্সেল ${res.status} — ${wait / 1000}s পরে আবার (চেষ্টা ${attempt}/৪)…`);
      await sleep(wait);
      continue;
    }
    break;
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    let code = '';
    try {
      code = JSON.parse(body)?.error?.code || '';
    } catch {
      /* আউটপুট নন-জেসন */
    }
    const err = new Error(`HTTP ${res.status}${code ? ` (${code})` : ''} — ${body.slice(0, 240)}`);
    err.status = res.status;
    err.code = code;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

async function resolveProjectId() {
  if (PROJECT_ID) {
    console.log(`🏷️  প্রজেক্ট-আইডি পরিবেশ থেকে নেওয়া হলো: ${PROJECT_ID}`);
    return PROJECT_ID;
  }
  console.log(`🔍 নাম-দিয়ে প্রজেক্ট খোঁজা হচ্ছে: "${PROJECT_NAME}" …`);
  const data = await vercel('/v9/projects', { params: { search: PROJECT_NAME, limit: 20 } });
  const list = data?.projects || [];
  const exact = list.find((p) => p.name === PROJECT_NAME) || list[0];
  if (!exact) {
    fatal(
      `"${PROJECT_NAME}" নামে কোনো প্রজেক্ট পাওয়া যায়নি।\n` +
        `   VERCEL_PROJECT_ID সেট করুন (Vercel ড্যাশবোর্ড → প্রজেক্ট → Settings → General → Project ID)।` +
        (TEAM_ID ? '' : `\n   টিম-অ্যাকাউন্ট হলে VERCEL_ORG_ID-ও দরকার হতে পারে।`),
    );
  }
  console.log(`   ✅ পাওয়া গেছে: ${exact.name} (${exact.id})`);
  return exact.id;
}

async function listDeployments(projectId) {
  const all = [];
  let until;
  for (let page = 0; page < 10; page++) {
    const data = await vercel('/v6/deployments', {
      params: { projectId, limit: 100, ...(until ? { until } : {}) },
    });
    const deps = data?.deployments || [];
    all.push(...deps);
    const next = data?.pagination?.next;
    if (!next || deps.length === 0 || deps.length < 100) break;
    until = next;
  }
  // সর্বশেষ প্রথম
  all.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return all;
}

function fmtWhen(ts) {
  if (!ts) return '—';
  return new Date(ts).toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
}

function rowLabel(d) {
  const target = d.target === 'production' ? 'প্রোডাকশন' : 'প্রিভিউ';
  return `${d.uid}  ${(d.url || '').slice(0, 46)}  [${d.readyState || d.state} · ${target}]  ${fmtWhen(d.createdAt)}`;
}

function writeStepSummary(lines) {
  const p = process.env.GITHUB_STEP_SUMMARY;
  if (!p) return;
  try {
    appendFileSync(p, lines.join('\n') + '\n');
  } catch {
    /* সামারি-লেখা ব্যর্থ হলে কাজ থামে না */
  }
}

/* ───────────────────────── মূল প্রবাহ ───────────────────────── */

console.log('🧹 লেখক-ফোরাম — ভার্সেল ডিপ্লয়মেন্ট-ক্লিনআপ (session171)');
console.log(`   মোড: ${DRY_RUN ? '🧪 ড্রাই-রান (কিছু মুছবে না)' : '💥 আসল ডিলিট'} · রাখা হবে: ${KEEP_COUNT}টি\n`);

const projectId = await resolveProjectId();
const all = await listDeployments(projectId);

if (all.length === 0) fatal('এই প্রজেক্টে কোনো ডিপ্লয়মেন্ট পাওয়া যায়নি।');

console.log(`\n📊 মোট ডিপ্লয়মেন্ট: ${all.length}`);

const keep = all.slice(0, KEEP_COUNT);
const rest = all.slice(KEEP_COUNT);

console.log(`\n🟢 রাখা হচ্ছে (${keep.length}):`);
for (const d of keep) console.log(`   • ${rowLabel(d)}`);

const toDelete = rest.filter((d) => DELETABLE.has(d.readyState || d.state || ''));
const busy = rest.filter((d) => ACTIVE.has(d.readyState || d.state || ''));
const otherState = rest.filter(
  (d) => !DELETABLE.has(d.readyState || d.state || '') && !ACTIVE.has(d.readyState || d.state || ''),
);

if (busy.length) {
  console.log(`\n⏭️  চলমান অবস্থার ${busy.length}টি এবার স্পর্শ করা হয়নি (পরের রানে মুছবে):`);
  for (const d of busy) console.log(`   • ${rowLabel(d)}`);
}
if (otherState.length) {
  console.log(`\n⏭️  অজানা-অবস্থার ${otherState.length}টি স্কিপ করা হয়েছে:`);
  for (const d of otherState) console.log(`   • ${rowLabel(d)}`);
}

if (toDelete.length === 0) {
  console.log('\n✨ মোছার মতো কিছু নেই — সব পরিষ্কার!');
  writeStepSummary(['## Vercel Cleanup', '', 'মোছার মতো পুরনো ডিপ্লয়মেন্ট নেই ✅']);
  process.exit(0);
}

console.log(`\n🔴 মোছা হবে (${toDelete.length}):`);
for (const d of toDelete) console.log(`   • ${rowLabel(d)}`);

let realDeleted = 0;
let wouldDelete = 0;
let skipped = 0;
let failed = 0;
let forbiddenAll = true;

for (const d of toDelete) {
  const label = `${d.uid} ${(d.url || '').slice(0, 46)}`;
  if (DRY_RUN) {
    wouldDelete++;
    console.log(`🧪 (ড্রাই-রান) মোছা হতো: ${label}`);
    continue;
  }
  try {
    await vercel(`/v13/deployments/${d.uid}`, { method: 'DELETE' });
    realDeleted++;
    forbiddenAll = false;
    console.log(`🗑️  মোছা হয়েছে: ${label}`);
  } catch (e) {
    if (e.status === 400 || e.status === 403 || e.status === 409) {
      skipped++;
      console.warn(`⚠️  স্কিপ (${e.code || 'সুরক্ষিত'}): ${label} — সম্ভবত বর্তমানে-লাইভ/সংযুক্ত`);
    } else {
      failed++;
      forbiddenAll = false;
      console.error(`❌ ব্যর্থ: ${label} — ${e.message}`);
    }
  }
  await sleep(250); // হালকা রেট-লিমিট নিরাপত্তা
}

console.log('\n════════════════════════════════════════');
if (DRY_RUN) {
  console.log(`🧪 ড্রাই-রান শেষ — ${wouldDelete}টি মোছা হতো, কিছুই মুছা হয়নি।`);
  console.log('   নিশ্চিত হলে একই কমান্ড --dry-run ছাড়া চালান।');
} else {
  console.log(`✅ মোছা হয়েছে: ${realDeleted} · ⚠️ স্কিপ: ${skipped} · ❌ ব্যর্থ: ${failed}`);
  if (forbiddenAll && realDeleted === 0 && skipped > 0) {
    console.log('   💡 সব-স্কিপ হলে টোকেনের Scope/পারমিশন যাচাই করুন (Full Account দিন)।');
  }
  console.log('   💡 Functions Storage ড্যাশবোর্ডে কিছুক্ষণ পরে কমতে দেখাবে (মেট্রিক-বিলম্ব)।');
}
console.log('════════════════════════════════════════\n');

writeStepSummary([
  '## Vercel Deployment Cleanup',
  '',
  `- মোট: ${all.length} · রাখা হয়েছে: ${keep.length}`,
  `- ${DRY_RUN ? '🧪 ড্রাই-রানে মোছা হতো' : '🗑️ মোছা হয়েছে'}: ${DRY_RUN ? wouldDelete : realDeleted} · স্কিপ: ${skipped} · ব্যর্থ: ${failed}`,
  '',
  '| Deployment | State | Created |',
  '|---|---|---|',
  ...toDelete.map((d) => `| \`${d.uid}\` | ${d.readyState || d.state} | ${fmtWhen(d.createdAt)} |`),
]);

process.exit(failed > 0 ? 1 : 0);
