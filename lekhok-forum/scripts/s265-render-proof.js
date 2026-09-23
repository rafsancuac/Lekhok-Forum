// s265-render-proof.js — ac265 EJS-কম্পাইল+রেন্ডার-প্রমাণ (শূন্য-ডেটা + নমুনা-ডেটা দুই-ধারা)
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

const VIEW = path.join(__dirname, '..', 'admin', 'views', 'admin', 'complaints.ejs');
const src = fs.readFileSync(VIEW, 'utf8');

const sample = {
  AV: 'qa265',
  status: '',
  newCount: 2,
  currentPath: '/admin/complaints',
  user: { full_name: 'QA প্রশাসক', username: 'testadmin', avatar_url: null },
  adminUser: { display_name: 'QA প্রশাসক' },
  complaints: [
    { id: 401, subject: 'টেস্ট-অভিযোগ এক', body: 'এটি একটি নমুনা অভিযোগের বিবরণ qa265probe', status: 'new',
      submitter_name: 'রহিম উদ্দিন', submitter_username: 'rahim', avatar_url: null,
      created_at: '2026-09-20 10:00:00', file_url: '/uploads/x.pdf', file_name: 'প্রমাণ.pdf', admin_notes: '' },
    { id: 402, subject: 'Second complaint gallery', body: 'english body sample', status: 'resolved',
      submitter_name: '', submitter_username: '', avatar_url: null,
      created_at: '2026-09-21 11:30:00', file_url: null, file_name: null, admin_notes: 'নোট আছে' }
  ]
};

const empty = Object.assign({}, sample, { complaints: [], newCount: 0 });

function render(locals, label) {
  const html = ejs.render(src, locals, { filename: VIEW, root: path.dirname(VIEW) });
  const rows = (html.match(/data-ac-row="/g) || []).length;
  const kws = (html.match(/data-kw="/g) || []).length;
  const hasHook = html.includes('__acQA');
  const hasStrip = html.includes('acFilter265');
  const hiddenGuards = (html.match(/\[hidden\]/g) || []).length;
  const hexInStyle = (html.split('<style>')[1] || '').split('</style>')[0].match(/#[0-9a-fA-F]{3,8}\b/g) || [];
  const preserved = ['data-bulk-all', 'bulk-delete', '?_method=PUT', '?_method=DELETE',
    'fa-paperclip', 'admin/complaints?status=new', 'sidebar'].filter(k => html.includes(k));
  const staticOnly = ['data-bulk-all', 'bulk-delete', 'admin/complaints?status=new', 'sidebar']
    .filter(k => html.includes(k));
  console.log(`[${label}] bytes=${html.length} rows=${rows} kw=${kws} hook=${hasHook} strip=${hasStrip} [hidden]=${hiddenGuards} hexInStyle=${hexInStyle.length} preserved=${preserved.length}/7 static=${staticOnly.length}/4`);
  if (label === 'sample') {
    // kw-বিষয়বস্তু প্রোব
    const kwOk = html.includes('qa265probe') && html.includes('/profile/rahim') && html.includes('নতুন new') && html.includes('resolved done') && html.includes('প্রমাণ.pdf');
    const escOk = !/<script>alert/.test(html);
    console.log(`[sample] kw-প্রোব=${kwOk} এস্কেপ=${escOk}`);
    if (!kwOk) process.exit(1);
  }
  if (rows !== (label === 'sample' ? 2 : 0) || kws !== rows || !hasHook || !hasStrip || hiddenGuards !== 3 || hexInStyle.length !== 0) {
    process.exit(1);
  }
  if (label === 'sample' && preserved.length !== 7) process.exit(1);
  if (label === 'empty' && staticOnly.length !== 4) process.exit(1);
}

render(sample, 'sample');
render(empty, 'empty');
console.log('RENDER-PROOF ✓ (দুই-ধারা — sample ২-সারফেস + empty ০-সারফেস, হেক্স-শূন্য, গার্ড×৩, সংরক্ষণ×৭)');
