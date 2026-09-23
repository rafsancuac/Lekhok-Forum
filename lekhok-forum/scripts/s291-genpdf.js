#!/usr/bin/env node
/* s291-genpdf.js — session291 সুইট-হেল্পার: pdf-lib-নির্মিত N-পাতা-PDF → base64 (stdout; ডিফল্ট ৯)
   s281-genpdf-প্রথা-বর্ধিত (fetch-intercept-E2E — বাস্তব-ড্রাইভ-ফাইল-লাগে-না)।
   ৯-পাতা-কেন: LOWMEM-ডিফল্ট-ক্যাপ=৬-এর-উপরে — ক্যাপ-মিড-স্টেট (eager ৬ + অলস ৩) প্রমাণযোগ্য।
   প্রতি-পাতায় পাতা-সংখ্যা-টেক্সট (রেন্ডার্ড-থাম্বনেইল-শনাক্তকরণ-সহজ)। */
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

(async () => {
  const N = Math.max(1, Math.min(40, parseInt(process.argv[2], 10) || 9));
  const doc = await PDFDocument.create();
  doc.setTitle('s291-railcap-probe');
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  for (let n = 1; n <= N; n++) {
    const page = doc.addPage([595.28, 841.89]); // A4
    page.drawText('S291-PAGE-' + n, { x: 180, y: 420, size: 42, font, color: rgb(0.02, 0.47, 0.43) });
    page.drawText('session291 rail-cap probe', { x: 200, y: 380, size: 14, font, color: rgb(0.3, 0.3, 0.3) });
  }
  process.stdout.write(Buffer.from(await doc.save()).toString('base64'));
})().catch((e) => { console.error(e); process.exit(1); });
