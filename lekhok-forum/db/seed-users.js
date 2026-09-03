#!/usr/bin/env node
/**
 * db/seed-users.js — Seed users from xlsx member list + 13 committee members.
 *
 * Idempotent: skips username/email already present in users table.
 * Note: actual users table columns: id, username, password_hash, full_name,
 * email, phone, bio, designation, ..., address, ..., role, status
 *
 * Usage: node db/seed-users.js
 */

const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');
const bcrypt = require('bcryptjs');

(async () => {
  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();

  const dbPath = path.join(__dirname, '..', 'lekhok.db');
  let db = new SQL.Database();
  if (fs.existsSync(dbPath)) {
    db = new SQL.Database(fs.readFileSync(dbPath));
  }

  // Ensure members table exists
  db.run(`CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, role TEXT NOT NULL,
    institution TEXT, image_url TEXT,
    member_type TEXT DEFAULT 'central',
    sort_order INTEGER DEFAULT 0, bio TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // ── 1. Parse xlsx ───────────────────────────────────────────
  const xlsxPath = path.join(__dirname, '..', '..', 'member list.xlsx');
  if (!fs.existsSync(xlsxPath)) {
    console.error('xlsx not found at:', xlsxPath);
    process.exit(1);
  }
  const xlsxBuf = fs.readFileSync(xlsxPath);

  let eocdPos = -1;
  for (let i = xlsxBuf.length - 22; i >= 0; i--) {
    if (xlsxBuf[i] === 0x50 && xlsxBuf[i+1] === 0x4B && xlsxBuf[i+2] === 0x05 && xlsxBuf[i+3] === 0x06) { eocdPos = i; break; }
  }
  const cdOffset = xlsxBuf.readUInt32LE(eocdPos + 16);
  const cdEntries = xlsxBuf.readUInt16LE(eocdPos + 10);
  let pos = cdOffset;
  const entries = [];
  for (let i = 0; i < cdEntries; i++) {
    const compSize = xlsxBuf.readUInt32LE(pos+20);
    const nameLen = xlsxBuf.readUInt16LE(pos+28);
    const extraLen = xlsxBuf.readUInt16LE(pos+30);
    const commentLen = xlsxBuf.readUInt16LE(pos+32);
    const localHeaderOffset = xlsxBuf.readUInt32LE(pos+42);
    const name = xlsxBuf.toString('utf8', pos+46, pos+46+nameLen);
    pos += 46 + nameLen + extraLen + commentLen;
    entries.push({ name, compSize, localHeaderOffset });
  }

  function getContent(target) {
    const e = entries.find(x => x.name === target);
    if (!e) return null;
    const lhPos = e.localHeaderOffset;
    const lhNameLen = xlsxBuf.readUInt16LE(lhPos+26);
    const lhExtraLen = xlsxBuf.readUInt16LE(lhPos+28);
    const dataStart = lhPos + 30 + lhNameLen + lhExtraLen;
    return zlib.inflateRawSync(xlsxBuf.slice(dataStart, dataStart + e.compSize)).toString('utf8');
  }

  const ssXml = getContent('xl/sharedStrings.xml');
  const strings = [];
  const siRegex = /<si>([\s\S]*?)<\/si>/g;
  let m;
  while ((m = siRegex.exec(ssXml)) !== null) {
    const tRegex = /<t[^>]*>([^<]*)<\/t>/g;
    let combined = '';
    let tm;
    while ((tm = tRegex.exec(m[1])) !== null) combined += tm[1];
    strings.push(combined);
  }

  const sheetXml = getContent('xl/worksheets/sheet1.xml');
  const rowRegex = /<row[^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g;
  const rows = [];
  while ((m = rowRegex.exec(sheetXml)) !== null) {
    const cells = m[2];
    const cellRegex = /<c[^>]*r="([A-Z]+\d+)"(?:[^>]*t="([^"]*)")?[^>]*(?:\/>|>(?:<v>([^<]*)<\/v>|<is><t[^>]*>([^<]*)<\/t><\/is>)<\/c>)/g;
    const data = {};
    let cm;
    while ((cm = cellRegex.exec(cells)) !== null) {
      const col = cm[1].replace(/\d+/, '');
      const type = cm[2];
      const v = cm[3] || cm[4] || '';
      if (type === 's' && v) data[col] = strings[parseInt(v)];
      else if (type === 'inlineStr' && cm[4]) data[col] = cm[4];
      else if (v) data[col] = v;
    }
    if (Object.keys(data).length) rows.push(data);
  }

  // ── 2. Build user list ──────────────────────────────────────
  // Stable transliteration for common Bengali characters
  const bnMap = {
    'া':'a','ি':'i','ী':'i','ু':'u','ূ':'u','ৃ':'ri','ে':'e','ৈ':'oi','ো':'o','ৌ':'ou',
    'ক':'k','খ':'kh','গ':'g','ঘ':'gh','ঙ':'ng',
    'চ':'ch','ছ':'chh','জ':'j','ঝ':'jh','ঞ':'nj',
    'ট':'t','ঠ':'th','ড':'d','ঢ':'dh','ণ':'n',
    'ত':'t','থ':'th','দ':'d','ধ':'dh','ন':'n',
    'প':'p','ফ':'ph','ব':'b','ভ':'bh','ম':'m',
    'য':'j','র':'r','ল':'l','শ':'sh','ষ':'sh','স':'s','হ':'h',
    'ড়':'r','ঢ়':'rh','য়':'y',
    'ৎ':'t','ং':'ng','ঃ':'h','ঁ':'n',
    '০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9'
  };
  function translit(s) {
    return s.split('').map(c => bnMap[c] !== undefined ? bnMap[c] : c).join('');
  }
  function makeUsername(name, idx) {
    if (!name) return 'user' + idx;
    const t = translit(name.toLowerCase())
      .replace(/[^\w\s\.\-]/g, '')
      .trim()
      .replace(/[\s\.\-]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 30) || ('user' + idx);
    return t;
  }

  // Helper: sql.js step-based result iterator
  function allRows(sqlStmt) {
    const out = [];
    const stmt = db.prepare(sqlStmt);
    while (stmt.step()) out.push(stmt.getAsObject());
    stmt.free();
    return out;
  }
  const existingUsernames = new Set(allRows('SELECT username FROM users').map(r => r.username));
  const existingEmails = new Set(allRows('SELECT email FROM users').map(r => r.email));

  // Default password
  const defaultHash = bcrypt.hashSync('lekhok@2026', 10);
  function insertUser(u) {
    const stmt = db.prepare('INSERT INTO users (username, email, password_hash, full_name, designation, address, role, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    stmt.run([u.username, u.email, u.hash, u.full_name, u.designation, u.address, u.role, u.status]);
    stmt.free();
  }

  // ── 3. Insert 15 committee — all as regular 'user' role ─────
  // Per user policy: nobody gets admin/moderator role here.
  // Admin/moderator promotions happen manually through the admin panel later.
  const committee = [
    { name: 'ইসমাইল হোসেন',                       role: 'সভাপতি',                  userRole: 'user' },
    { name: 'মোনেম শাহরিয়ার শাওন',               role: 'সাধারণ সম্পাদক',           userRole: 'user' },
    { name: 'কারিশমা ইরিন এ্যামি',               role: 'সহ-সাংগঠনিক সম্পাদক',     userRole: 'user' },
    { name: 'আজিজ ওয়েসি',                        role: 'সাংগঠনিক সম্পাদক',         userRole: 'user' },
    { name: 'মোঃ রেজাউল করিম',                    role: 'দপ্তর সম্পাদক',            userRole: 'user' },
    { name: 'মোঃ নাঈম মিজি',                      role: 'সাহিত্য ও প্রকাশনা সম্পাদক', userRole: 'user' },
    { name: 'মাহফুজ রহমান',                       role: 'প্রচার সম্পাদক',            userRole: 'user' },
    { name: 'মাহমুদুল হাসান শাকিব',              role: 'তথ্য ও প্রযুক্তি সম্পাদক', userRole: 'user' },
    { name: 'জান্নাতুল ফেরদৌস ইকরা',             role: 'অর্থ সম্পাদক',              userRole: 'user' },
    { name: 'নুসরাত সুলতানা',                     role: 'প্রশিক্ষণ বিষয়ক সম্পাদক',  userRole: 'user' },
    { name: 'রাসেল হোসেন সাকিব',                 role: 'যুগ্ম সাধারণ সম্পাদক',      userRole: 'user' },
    { name: 'সানজিদা আফরোজ',                     role: 'সহ-দপ্তর সম্পাদক',          userRole: 'user' },
    { name: 'আব্দুল্লাহ আল নাঈম',                 role: 'সম্পাদকীয় পর্ষদ সদস্য',     userRole: 'user' },
    { name: 'আবরার আহাদ রাফি',                   role: 'কার্যনির্বাহী সদস্য',         userRole: 'user' },
    { name: 'ঋতু আক্তার',                         role: 'কার্যনির্বাহী সদস্য',         userRole: 'user' }
  ];

  let created = 0, skipped = 0;
  committee.forEach((c, i) => {
    let username = makeUsername(c.name, i);
    while (existingUsernames.has(username)) username = username + '_' + i;
    const email = username + '@lekhokforum.local';
    if (existingEmails.has(email)) { skipped++; return; }
    insertUser({ username, email, hash: defaultHash, full_name: c.name, designation: c.role, address: 'চট্টগ্রাম বিশ্ববিদ্যালয়', role: c.userRole, status: 'active' });
    existingUsernames.add(username);
    existingEmails.add(email);
    created++;
  });

  // ── 4. Insert xlsx attendees ───────────────────────────────
  let n = 0;
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const name = (r.B || '').trim();
    if (!name) continue;
    const dept = (r.C || '').trim();
    if (!dept) continue;
    let phone = (r.D || '').trim();
    if (phone && !isNaN(phone)) {
      // Convert scientific to plain
      try { phone = String(BigInt(phone.replace(/\..*$/, '').split('e')[0])); } catch(e) { phone = ''; }
    }
    let username = makeUsername(name, i);
    let u = username, n2 = 0;
    while (existingUsernames.has(u)) { n2++; u = username + '_' + n2; }
    const email = u + '@lekhokforum.local';
    if (existingEmails.has(email)) { skipped++; continue; }
    insertUser({ username: u, email, hash: defaultHash, full_name: name, designation: dept, address: 'চট্টগ্রাম বিশ্ববিদ্যালয় — ' + dept, role: 'user', status: 'active' });
    existingUsernames.add(u);
    existingEmails.add(email);
    n++;
  }

  fs.writeFileSync(dbPath, db.export());
  console.log(`[seed-users] Committee + attendees: created=${created + n} skipped=${skipped}`);
  console.log(`[seed-users] ${created} committee + ${n} attendees inserted (password for all: lekhok@2026)`);
})().catch(err => { console.error(err); process.exit(1); });
