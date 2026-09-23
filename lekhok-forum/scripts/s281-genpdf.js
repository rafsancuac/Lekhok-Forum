#!/usr/bin/env node
/* s281-genpdf.js — session281 সুইট-হেল্পার: pdf-lib-নির্মিত ৩-পাতা-PDF → base64 (stdout)
   fetch-intercept-E2E-কৌশল (session279-প্রথা): বাস্তব-ড্রাইভ-ফাইল-লাগে-না — ব্রাউজারে
   window.fetch-প্যাচে /api/epaper/file/*-এ এই-bytes-এর Response ফেরানো হয়।
   প্রতি-পাতায় বড় পাতা-সংখ্যা-টেক্সট (রেন্ডার্ড-থাম্বনেইল-শনাক্তকরণ-সহজ)। */
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

(async () => {
  const doc = await PDFDocument.create();
  doc.setTitle('s281-thumbrail-probe');
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  for (let n = 1; n <= 3; n++) {
    const page = doc.addPage([595.28, 841.89]); // A4
    page.drawText('S281-PAGE-' + n, { x: 180, y: 420, size: 42, font, color: rgb(0.02, 0.47, 0.43) });
    page.drawText('session281 thumbnail-rail probe', { x: 200, y: 380, size: 14, font, color: rgb(0.3, 0.3, 0.3) });
  }
  process.stdout.write(Buffer.from(await doc.save()).toString('base64'));
})().catch((e) => { console.error(e); process.exit(1); });
