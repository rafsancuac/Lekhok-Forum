// s266-render-proof.js — ms266 EJS-কম্পাইল+রেন্ডার-প্রমাণ (শূন্য-ডেটা + নমুনা-ডেটা দুই-ধারা)
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

const VIEW = path.join(__dirname, '..', 'admin', 'views', 'admin', 'messages.ejs');
const src = fs.readFileSync(VIEW, 'utf8');

const mkMsg = (id, over) => Object.assign({
  id, name: 'পরীক্ষক ' + id, email: 'qa' + id + '@example.com', subject: 'টেস্ট-বিষয় ' + id,
  message: 'এটি নমুনা বার্তা ms266probe-' + id, is_read: false, is_archived: false,
  admin_reply: null, created_at: '2026-09-23 10:00:00'
}, over);

const sample = {
  AV: 'qa266',
  filter105: 'all',
  q105: '',
  page105: 1,
  total105: 3,
  per105: 15,
  pages105: 1,
  counts105: { all: 3, unread: 2, read: 1, archived: 1, today: 3 },
  messages: [
    mkMsg(901),
    mkMsg(902, { is_read: true, subject: 'Second message gallery' }),
    mkMsg(903, { is_archived: true, admin_reply: 'নোট আছে' })
  ],
  currentPath: '/admin/messages',
  user: { full_name: 'QA প্রশাসক', username: 'testadmin', avatar_url: null },
  adminUser: { display_name: 'QA প্রশাসক' }
};

const empty = Object.assign({}, sample, {
  messages: [],
  counts105: { all: 0, unread: 0, read: 0, archived: 0, today: 0 }
});

function render(locals, label) {
  const html = ejs.render(src, locals, { filename: VIEW, root: path.dirname(VIEW) });
  const rows = (html.match(/data-ms-row="/g) || []).length;
  const kws = (html.match(/data-kw="/g) || []).length;
  const hasHook = html.includes('__msQA');
  const hasStrip = html.includes('msFilter266');
  const hiddenGuards = (html.match(/\[hidden\]/g) || []).length;
  const hexInStyle = (html.split('<style>')[1] || '').split('</style>')[0].match(/#[0-9a-fA-F]{3,8}\b/g) || [];
  const full = ['bulk-delete', 'bulk-archive', 'bulk-read', 'data-bulk-all',
    '/read', '/unread', '/archive', '/unarchive', '/delete', 'data-note-form',
    'data-msg-print', 'msgPrintAll108', 'inbox-toolbar105', 'msg-list105'].filter(k => html.includes(k));
  const staticOnly = ['bulk-delete', 'bulk-archive', 'bulk-read',
    'inbox-toolbar105'].filter(k => html.includes(k));
  console.log(`[${label}] bytes=${html.length} rows=${rows} kw=${kws} hook=${hasHook} strip=${hasStrip} [hidden]=${hiddenGuards} hexInStyle=${hexInStyle.length} full=${full.length}/14 static=${staticOnly.length}/4`);
  if (label === 'sample') {
    const kwOk = html.includes('ms266probe-901') && html.includes('qa901@example.com') &&
      html.includes('অপঠিত unread') && html.includes('পঠিত read') && html.includes('আর্কাইভ archived') && html.includes('নোট note');
    console.log(`[sample] kw-প্রোব=${kwOk}`);
    if (!kwOk) process.exit(1);
  }
  if (rows !== (label === 'sample' ? 3 : 0) || kws !== rows || !hasHook || !hasStrip || hiddenGuards !== 3 || hexInStyle.length !== 0) {
    process.exit(1);
  }
  if (label === 'sample' && full.length !== 14) process.exit(1);
  if (label === 'empty' && staticOnly.length !== 4) process.exit(1);
}

render(sample, 'sample');
render(empty, 'empty');
console.log('RENDER-PROOF ✓ (দুই-ধারা — sample ৩-সারফেস + empty ০-সারফেস, হেক্স-শূন্য, গার্ড×৩, সংরক্ষণ পূর্ণ; bulk-unarchive সার্ভার-শর্তসাপেক্ষ — filter105=archived-তে রেন্ডার)');
