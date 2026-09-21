/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * scripts/migrate-home-leader-cards.js — Task63: HomeLeadershipSlot (স্থির ৮-স্লট)
 * → HomeLeaderCard (ডাইনামিক কার্ড) এক-বারের ডাটা-মাইগ্রেশন।
 *
 * চালানো: DATABASE_URL="file:../db/custom.db" node scripts/migrate-home-leader-cards.js
 * নোট: raw-SQL — পুরনো/নতুন কোনো Prisma-ক্লায়েন্ট-জেনারেশনের ওপর নির্ভর করে না।
 *   ① HomeLeadershipSlot-র প্রতিটি সারি → HomeLeaderCard-এ কপি (category=section,
 *      order = হোয়াইটলিস্ট-ক্রম অনুযায়ী সেকশন-ভিত্তিক ১..n)
 *   ② ডামি-উপদেষ্টা রক্ষাকবচ: বর্তমান-উপদেষ্টা-স্লটের কার্ড isActive=false করে মাইগ্রেট
 *      (ইউজার-স্পেক: উপদেষ্টা নিয়োগ না-দেওয়া পর্যন্ত কার্ড হাইড)
 *   ③ ইতিমধ্যে-মাইগ্রেটেড হলে পুনঃচালনা-নিরাপদ (idempotent — খালি-টেবিলে কিছুই না)
 */
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient({ log: [] });

/* slotKey → সেকশনের ভেতরে প্রদর্শন-ক্রম (আগের whitelist-ক্রমের প্রতিচ্ছবি) */
const SECTION_ORDER = {
  FOUNDING: ['founder_president', 'founder_general_secretary', 'founding_advisor_1', 'founding_advisor_2'],
  CURRENT: ['current_president', 'current_general_secretary', 'current_advisor_1', 'current_advisor_2'],
};
/* ডামি-উপদেষ্টা রক্ষাকবচ — এই স্লট থেকে আসা কার্ড লুকানো অবস্থায় মাইগ্রেট হবে */
const FORCE_HIDE = new Set(['current_advisor_1', 'current_advisor_2']);

(async () => {
  try {
    let rows;
    try {
      rows = await db.$queryRawUnsafe('SELECT slotKey, section, name, role, term, quote, imageUrl, isActive FROM HomeLeadershipSlot');
    } catch (e) {
      console.log('MIGRATE: HomeLeadershipSlot টেবিল নেই (আগেই-ড্রপ/আগেই-মাইগ্রেটেড) — idempotent-exit');
      return;
    }
    const list = Array.isArray(rows) ? rows : [];
    if (list.length === 0) {
      console.log('MIGRATE: HomeLeadershipSlot খালি — কপি-করার কিছু নেই (idempotent-exit)');
      return;
    }
    const existing = await db.$queryRawUnsafe('SELECT COUNT(*) AS n FROM HomeLeaderCard');
    if (Number(existing[0].n) > 0) {
      console.log('MIGRATE: HomeLeaderCard-এ ইতিমধ্যে ' + existing[0].n + ' কার্ড আছে — ডুপ-এড়াতে বাদ (idempotent-exit)');
      return;
    }
    let copied = 0;
    for (const r of list) {
      const section = r.section === 'CURRENT' ? 'CURRENT' : 'FOUNDING';
      const orderIdx = (SECTION_ORDER[section] || []).indexOf(r.slotKey);
      const order = orderIdx >= 0 ? orderIdx + 1 : copied + 1;
      const isActive = FORCE_HIDE.has(r.slotKey) ? false : Boolean(r.isActive);
      await db.$executeRawUnsafe(
        'INSERT INTO HomeLeaderCard (id, category, name, role, term, quote, imageUrl, isActive, "order", createdAt, updatedAt) VALUES (lower(hex(randomblob(12))), ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
        section, r.name || '', r.role || '', r.term || '', r.quote || '', r.imageUrl || '', isActive ? 1 : 0, order
      );
      copied++;
      console.log(`  → ${r.slotKey} → [${section}] ${r.name || '(খালি)'} order=${order} isActive=${isActive}`);
    }
    console.log(`MIGRATE OK: ${copied} কার্ড কপি হয়েছে`);
  } catch (e) {
    console.error('MIGRATE FAILED:', e.message);
    process.exitCode = 1;
  } finally {
    await db.$disconnect();
  }
})();
