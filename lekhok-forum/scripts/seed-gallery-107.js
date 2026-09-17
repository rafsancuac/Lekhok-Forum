/**
 * scripts/seed-gallery-104.js — সেশন ১০৪
 * ═══════════════════════════════════════════════════════════════════════════
 * চিত্রশালা পেজিনেশন-ডেমো: ১০টি ডেমো-ছবি সিড করে (>২৪-কার্ডে load-more
 * ইঞ্জিন সক্রিয় হওয়ার প্রমাণের জন্য)। ছবি = সার্ভারের নিজস্ব /img/cover/
 * জেনারেটর-সংখা (SVG — কোনো বাইনারি ফাইল লাগে না, লাইটবক্স/ডাউনলোডেও কাজ করে)।
 * ⚠️ সার্ভার বন্ধ করে চালান (sql.js in-memory clobber-ঝুঁকি — seed-resources-101
 * নোট দেখুন)। আইডি-ইমপোটেন্ট: একই টাইটেল-প্রিফিক্স থাকলে পুনঃসিড-শূন্য।
 * চালানো: node scripts/seed-gallery-104.js
 * ═══════════════════════════════════════════════════════════════════════════
 */
const fs = require('fs');
const path = require('path');

const DB_PATH = process.argv[2] || path.join(__dirname, '..', 'lekhok.db');
const PREFIX = 'ডেমো-চিত্র';

const DEMOS = [
  { title: `${PREFIX} — বইমেলা প্রদর্শনী ১`, caption: 'অমর একুশে বইমেলায় ফোরাম-স্টল', category: 'events',    seed: 'boimela1' },
  { title: `${PREFIX} — বইমেলা প্রদর্শনী ২`, caption: 'পাঠক-সারি বইমেলা প্রাঙ্গণে',       category: 'events',    seed: 'boimela2' },
  { title: `${PREFIX} — কর্মশালা মুহূর্ত`,   caption: 'লেখা-কর্মশালায় হাতে-কলমে',         category: 'workshops', seed: 'ws-demo1' },
  { title: `${PREFIX} — সেমিনার মঞ্চ`,       caption: 'বার্ষিক সাহিত্য-সেমিনার',           category: 'seminars',  seed: 'semi-demo1' },
  { title: `${PREFIX} — সভা পরিক্রমা`,       caption: 'মাসিক কার্যনির্বাহী সভা',           category: 'meetings',  seed: 'meet-demo1' },
  { title: `${PREFIX} — প্রেস-ব্রিফিং`,       caption: 'সাংবাদিক-মিটিং মুহূর্ত',           category: 'press',     seed: 'press-demo1' },
  { title: `${PREFIX} — পুরস্কার রাত`,       caption: 'বার্ষিক পুরস্কার বিতরণী',          category: 'awards',    seed: 'award-demo1' },
  { title: `${PREFIX} — আড্ডা সন্ধ্যা`,       caption: 'সাহিত্য আড্ডা ও পাঠচক্র',          category: 'events',    seed: 'adda-demo1' },
  { title: `${PREFIX} — ক্যাম্পাস ভ্রমণ`,     caption: 'শহিদ মিনার প্রাঙ্গণে ফোরাম-টিম',   category: 'events',    seed: 'campus-demo1' },
  { title: `${PREFIX} — স্মৃতিচিহ্ন`,         caption: 'ফোরামের পুরনো দিনের স্মৃতি',       category: 'general',   seed: 'memory-demo1' },
];

async function main() {
  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();
  if (!fs.existsSync(DB_PATH)) { console.error('DB পাওয়া যায়নি:', DB_PATH); process.exit(1); }
  const db = new SQL.Database(fs.readFileSync(DB_PATH));
  const q = (sql, params = []) => {
    const st = db.prepare(sql); st.bind(params);
    const rows = []; while (st.step()) rows.push(st.getAsObject()); st.free(); return rows;
  };
  const already = q(`SELECT COUNT(*) AS c FROM gallery WHERE title LIKE '${PREFIX}%'`)[0].c;
  if (already > 0) { console.log('আগেই সিড-আছে (' + already + ') — কিছু করা হলো না'); process.exit(0); }
  // uploaded_by: প্রথম অ্যাডমিন-ইউজার (nullable নয় এমন কলাম না হলেও রেফারেন্স ভালো)
  const admin = q(`SELECT id FROM users ORDER BY (CASE WHEN role='admin' THEN 0 ELSE 1 END), id LIMIT 1`)[0];
  const ins = db.prepare(`INSERT INTO gallery (title, caption, image_url, category, photographer, event_date, created_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now','localtime'))`);
  for (const d of DEMOS) {
    ins.run([d.title, d.caption, `/img/cover/${d.seed}/600/400`, d.category, 'ফোরাম মিডিয়া টিম', null]);
  }
  ins.free();
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
  const total = q('SELECT COUNT(*) AS c FROM gallery')[0].c;
  console.log(`✓ ${DEMOS.length} ডেমো-ছবি সিড — মোট ${total} রো (>২৪ → load-more সক্রিয়)`);
}

main().catch(e => { console.error('ERR:', e.message); process.exit(1); });
