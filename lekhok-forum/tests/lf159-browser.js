#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   tests/lf159-browser.js — সেশন ১৫৯ ব্রাউজার-E2E (playwright, এক-প্রসেস)
   স্যান্ডবক্স-লেসন: agent-browser CLI per-call fork → cgroup fork-exhaustion;
   playwright ইন-প্রসেস API = fork-চাপ-শূন্য (verify-session150-রীতি)।
   সুযোগ: রেল-সার্চ-ফিল্টার + কোর-শর্টকাট + সেকশন-টাইটেল/ব্যাজ + session156
   স্ক্রল-লক-রিগ্রেশন + জ্যামিতি + মোবাইল-390px + কনসোল-০।
   ═══════════════════════════════════════════════════════════════════════════ */
'use strict';
const path = require('path');
const { chromium } = require('playwright');

const BASE = process.env.LF_BASE || 'http://localhost:8080';
let PASS = 0, FAIL = 0;
const ok = (m) => { PASS++; console.log('  ✓ ' + m); };
const bad = (m, got, want) => { FAIL++; console.log(`  ✗ ${m} (got=${JSON.stringify(got)} want=${JSON.stringify(want)})`); };
const chk = (got, want, m) => { if (String(got) === String(want)) ok(m); else bad(m, got, want); };

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message));

  await page.goto(BASE + '/dashboard', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.fr-search159', { timeout: 15000 });

  console.log('── রেল-কাঠামো (1440×900)');
  chk(await page.locator('#frRail159 .fr-item').count(), 16, 'রেল-আইটেম ১৬');
  chk(await page.locator('.fr-sec-title157').count(), 3, 'সেকশন-টাইটেল ৩');
  chk(await page.locator('.fr-badge157').textContent(), 'আজকের', "ব্যাজ 'আজকের' (session157-ক্যানোনিকাল)");
  const coreHrefs = await page.locator('#frRail159 .fr-item').evaluateAll(
    (els) => els.slice(0, 4).map((e) => e.getAttribute('href')).join(',')
  );
  chk(coreHrefs, '/bookmarks,/on-this-day,/messages,/press', 'কোর-ব্লক ক্রম (সংরক্ষিত/মেমোরিজ/গ্রুপ/পেজ)');

  console.log('── সার্চ-ফিল্টার');
  await page.fill('#frSearch159', 'কুইজ');
  chk(await visibleHrefs(page), '/quiz', "'কুইজ' → একমাত্র /quiz");
  chk(await visibleTitles(page), 'দৈনন্দিন ফিচার', 'দৃশ্যমান টাইটেল = দৈনন্দিন');

  await page.fill('#frSearch159', 'লেখা');
  chk(await visibleHrefs(page), '/bookmarks,/on-this-day,/articles,/qa', "'লেখা' → ৪ আইটেম (label+desc)");
  chk(await visibleTitles(page), 'জ্ঞান ও সাহিত্য কর্নার', 'কেবল জ্ঞান-কর্নার টাইটেল');

  await page.fill('#frSearch159', 'zz99x');
  chk(await visibleHrefs(page), '', 'অমিল → ০ আইটেম');
  chk(await page.evaluate(() => !document.getElementById('frEmpty159').hidden), true, 'শূন্য-অবস্থা দৃশ্যমান');
  chk(await page.evaluate(() => document.querySelector('.feed-rail').classList.contains('fr-searching159')), true, 'fr-searching159 ক্লাস (সেপারেটর-লুকানো-মোড)');

  await page.fill('#frSearch159', '');
  chk(await page.locator('#frRail159 .fr-item:not([hidden])').count(), 16, 'ক্লিয়ার → ১৬ ফেরত');
  chk(await page.locator('.fr-sec-title157:not([hidden])').count(), 3, 'টাইটেল ৩ ফেরত');

  console.log('── session156 স্ক্রল-লক রিগ্রেশন + জ্যামিতি');
  chk(await page.evaluate(() => { window.scrollTo(0, 3000); return window.scrollY; }), 0, 'window-লক (scrollY=0)');
  /* session249-আধুনিকীকরণ: session164-এর 'ব্যালেন্সড ৩-কলাম' (ইউজার-স্পেক —
     বাম ২৬০/২৮০@1440, ফিড ৬০০, ডান ৩১০/৩৩০@1440) ইচ্ছাকৃত-ডিজাইন —
     পুরনো 320/348 (session156-যুগ) প্রত্যাশা আর-সঠিক নয় */
  chk(await page.evaluate(() => Math.round(document.querySelector('.feed-rail').getBoundingClientRect().width)), 280, 'রেল 280px (@1440+ — ব্যালেন্সড-৩-কলাম session164)');
  chk(await page.evaluate(() => Math.round(document.querySelector('.dash-right').getBoundingClientRect().width)), 330, 'ডান-সাইডবার 330px (@1440+ — ব্যালেন্সড-৩-কলাম session164)');
  chk(await page.evaluate(() => {
    const m = document.querySelector('.dash-main'), r = document.querySelector('.feed-rail');
    m.scrollTop = 800; return r.scrollTop;
  }), 0, 'ফিড-স্ক্রলে রেল-স্থির');
  chk(await page.evaluate(() => {
    const m = document.querySelector('.dash-main'), r = document.querySelector('.feed-rail');
    r.scrollTop = 120; return m.scrollTop;
  }), 800, 'রেল-স্ক্রলে ফিড-অপরিবর্তিত');
  chk(await page.evaluate(() => Math.round(document.querySelector('.btclf-topbar').getBoundingClientRect().top)), 0, 'টপবার top=0');
  await page.screenshot({ path: path.join('tests', 'lf159-desktop.png'), fullPage: false });
  ok('স্ক্রিনশট lf159-desktop.png');

  console.log('── মোবাইল 390×844');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(400);
  chk(await page.evaluate(() => getComputedStyle(document.body).overflow !== 'hidden'), true, 'মোবাইলে window-লক বিহীন');
  chk(await page.evaluate(() => getComputedStyle(document.querySelector('.feed-rail')).display), 'none', 'রেল-লুকানো (<1200px)');
  chk(await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth)), 0, 'অনুভূমিক-ওভারফ্লো ০ (নেগেটিভ = কনটেন্ট-সংকীর্ণ, session158 অ্যান্টি-শিফট)');
  await page.screenshot({ path: path.join('tests', 'lf159-mobile.png'), fullPage: false });
  ok('স্ক্রিনশট lf159-mobile.png');

  console.log('── কনসোল');
  const realErrors = consoleErrors.filter((e) => !/favicon|net::ERR_FAILED|404/.test(e));
  chk(realErrors.length, 0, 'কনসোল-এরর ০' + (realErrors.length ? ' → ' + realErrors[0].slice(0, 120) : ''));

  await browser.close();
  console.log(`\n════════ ব্রাউজার-E2E: PASS=${PASS} FAIL=${FAIL} ════════`);
  process.exit(FAIL ? 1 : 0);
})().catch((e) => { console.error('FATAL:', e.message); process.exit(2); });

async function visibleHrefs(page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('#frRail159 .fr-item'))
      .filter((e) => !e.hidden).map((e) => e.getAttribute('href')).join(',')
  );
}
async function visibleTitles(page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('.fr-sec-title157'))
      .filter((e) => !e.hidden).map((e) => e.textContent.trim()).join(',')
  );
}
