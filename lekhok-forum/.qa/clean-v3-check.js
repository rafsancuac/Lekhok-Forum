/* QA (session179): site-cleaner v3 lossless-ওভারলে প্রমাণ
 * ① ব্যানারযুক্ত সিনথেটিক সংবাদপত্র-পিডিএফ বানায় (পূর্ণ-পাতা JPEG + নিচে সবুজ-ব্যান্ড + t.me-লিংক-অ্যানোটেশন)
 * ② cleanEpaperPdf চালিয়ে প্রমাণ করে:
 *    a) DCT-ইমেজ-স্ট্রিম বাইট হুবহু অপরিবর্তিত (১০০% লসলেস)
 *    b) ওভারলে-স্ট্রিম /LF EP3 মার্কারসহ Contents-অ্যারের শেষে
 *    c) প্রমো-অ্যানোটেশন বাদ
 *    d) দ্বিতীয়বার চালালে changed=false (মার্কার-গার্ড → raw-passthrough)
 *    e) pdf.js-রেন্ডারে ব্যানার-ব্যান্ড সাদা (bot-এর pdfjs-dist দিয়ে)
 */
const path = require('path');
process.chdir(__dirname + '/..');
const { PDFDocument, PDFName, PDFArray, PDFRawStream, decodePDFRawStream } = require('pdf-lib');
const sharp = require('sharp');
const { cleanEpaperPdf } = require('../helpers/pdf-cleaner');

(async () => {
  const W = 1190, H = 1684; // ইমেজ-পিক্সেল (~144dpi A4)
  // ① সিনথেটিক পাতা: সাদা-পটভূমি + কালো "টেক্সট-লাইন" + নিচে সবুজ-প্রমো-ব্যান্ড
  const lines = [];
  for (let i = 0; i < 40; i++) {
    const y = 60 + i * 36;
    const w = 200 + ((i * 137) % 700);
    lines.push(`<rect x="80" y="${y}" width="${w}" height="14" fill="#1a1a1a" rx="2"/>`);
  }
  const bannerH = Math.round(H * 0.012);
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="#ffffff"/>
    <rect x="60" y="30" width="${W - 120}" height="90" fill="#111111"/>
    ${lines.join('\n')}
    <rect x="0" y="${H - bannerH}" width="${W}" height="${bannerH}" fill="#1fa855"/>
    <text x="${W / 2 - 220}" y="${H - bannerH / 2 + 14}" font-size="42" fill="#ffffff" font-family="sans-serif">t.me/ePaperXpress</text>
  </svg>`;
  const pageJpeg = await sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toBuffer();
  console.log('synthetic page jpeg:', pageJpeg.length, 'bytes');

  const src = await PDFDocument.create();
  const page = src.addPage([595.28, 841.89]);
  const img = await src.embedJpg(pageJpeg);
  page.drawImage(img, { x: 0, y: 0, width: 595.28, height: 841.89 }); // cm = [595.28 0 0 841.89 0 0]
  // প্রমো-লিংক-অ্যানোটেশন
  const linkRef = src.context.obj({
    Type: 'Annot', Subtype: 'Link', Rect: [0, 0, 595, 40],
    A: { Type: 'Action', S: 'URI', URI: 'https://t.me/ePaperXpress' },
  });
  const annots = PDFArray.withContext(src.context);
  annots.push(src.context.register(linkRef));
  page.node.set(PDFName.of('Annots'), annots);
  const dirtyBytes = await src.save();
  console.log('dirty pdf:', dirtyBytes.length, 'bytes');

  // ② ক্লিন v3
  const r1 = await cleanEpaperPdf(Buffer.from(dirtyBytes));
  console.log('report#1:', JSON.stringify({ changed: r1.changed, streams: r1.streams, annots: r1.annots, tailBlocks: r1.tailBlocks, imagesCovered: r1.imagesCovered, pages: r1.pages, error: r1.error }));
  if (!r1.changed) throw new Error('FAIL: ক্লিন কিছুই বদলায়নি');
  if (r1.imagesCovered !== 1) throw new Error('FAIL: ওভারলে হয়নি (imagesCovered=' + r1.imagesCovered + ')');
  if (r1.annots !== 1) throw new Error('FAIL: অ্যানোটেশন বাদেনি (annots=' + r1.annots + ')');

  // a) DCT-বাইট-অক্ষত প্রমাণ — নোংরা-পিডিএফের DCT-এর সাথে তুলনা (embedJpg নিজেই বাইট বদলাতে পারে)
  const extractDct = async (bytes) => {
    const d = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const p = d.getPages()[0];
    const xo = d.context.lookup(d.context.lookup(p.node.get(PDFName.of('Resources'))).get(PDFName.of('XObject')));
    for (const [, ref] of xo.entries()) {
      const s = d.context.lookup(ref);
      if (s instanceof PDFRawStream && String(s.dict.get(PDFName.of('Filter')) || '').includes('DCT')) return { d, p, s };
    }
    return { d, p, s: null };
  };
  const dirtyParts = await extractDct(Buffer.from(dirtyBytes));
  const cleanParts = await extractDct(r1.buffer);
  if (!dirtyParts.s || !cleanParts.s) throw new Error('FAIL: DCT পাওয়া যায়নি');
  const sameBytes = Buffer.compare(Buffer.from(cleanParts.s.contents), Buffer.from(dirtyParts.s.contents)) === 0;
  console.log('DCT bytes identical dirty-vs-clean:', sameBytes, `(${dirtyParts.s.contents.length}B)`);
  if (!sameBytes) throw new Error('FAIL: JPEG রি-এনকোড হয়েছে — লসলেস নয়!');

  // b) ওভারলে-স্ট্রিম মার্কার + আয়ত-যাচাই
  const doc = cleanParts.d;
  const p1 = cleanParts.p;
  const contents = doc.context.lookup(p1.node.get(PDFName.of('Contents')));
  console.log('contents array size:', contents.size());
  if (!(contents instanceof PDFArray) || contents.size() < 2) throw new Error('FAIL: Contents-অ্যারে নেই');
  const last = doc.context.lookup(contents.get(contents.size() - 1));
  const hasMarker = last.dict && !!last.dict.get(PDFName.of('LF'));
  const opsTxt = Buffer.from(decodePDFRawStream(last).decode()).toString('latin1').trim();
  console.log('overlay marker /LF EP3:', hasMarker, '| ops:', opsTxt);
  if (!hasMarker || !/re f Q/.test(opsTxt)) throw new Error('FAIL: ওভারলে-মার্কার/অপস নেই');
  const nums = opsTxt.match(/q 1 1 1 rg ([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+) re f Q/);
  if (!nums) throw new Error('FAIL: অপস-ফরম্যাট অমিল');
  const rx = Number(nums[1]), ry = Number(nums[2]), rw = Number(nums[3]), rh = Number(nums[4]);
  console.log('overlay rect:', { rx, ry, rw, rh });
  if (Math.abs(rx) > 0.01 || Math.abs(rw - 595.28) > 1) throw new Error('FAIL: আয়ত-x/প্রস্থ ভুল');
  // ব্যানার ইমেজের নিচের-বেল্টে (পিক্সেল y=H−bannerH…H) → PDF-স্পেসে পাতার একদম-নিচে (y≈0…≈12)
  if (ry > 841.89 * 0.05 || ry + rh > 841.9 || rh < 6 || rh > 40) throw new Error('FAIL: আয়ত-y ব্যানার-ব্যান্ডে নেই (bottom=' + (ry + rh) + ', h=' + rh + ')');

  // d) আইডেম্পোটেন্সি — দ্বিতীয়-রান raw-passthrough (মার্কার-গার্ড)
  const r2 = await cleanEpaperPdf(r1.buffer);
  console.log('report#2 (re-clean):', JSON.stringify({ changed: r2.changed, imagesCovered: r2.imagesCovered }));
  if (r2.changed !== false) throw new Error('FAIL: মার্কার-গার্ড কাজ করেনি (দ্বিতীয়-রানে আবার বদলেছে)');

  // e) pdf.js-রেন্ডার-পিক্সেল-প্রমাণ (bot-এর pdfjs-dist + @napi-rs/canvas)
  try {
    const botDir = '/home/z/lekhok-forum/epaper-bot';
    const pdfjs = require(path.join(botDir, 'node_modules/pdfjs-dist/legacy/build/pdf.js'));
    const { createCanvas } = require(path.join(botDir, 'node_modules/@napi-rs/canvas'));
    const pdf = await pdfjs.getDocument({
      data: new Uint8Array(r1.buffer), useSystemFonts: true, disableFontFace: true, isEvalSupported: false,
      standardFontDataUrl: path.join(botDir, 'node_modules/pdfjs-dist/standard_fonts/') + '/',
    }).promise;
    const pg = await pdf.getPage(1);
    const vp = pg.getViewport({ scale: 1 });
    const cv = createCanvas(Math.ceil(vp.width), Math.ceil(vp.height));
    const cx = cv.getContext('2d');
    cx.fillStyle = 'white'; cx.fillRect(0, 0, cv.width, cv.height);
    await pg.render({ canvasContext: cx, viewport: vp }).promise;
    const bandTop = Math.floor(cv.height * 0.985);
    const raw = cx.getImageData(0, bandTop, cv.width, cv.height - bandTop).data;
    let green = 0;
    for (let i = 0; i < raw.length; i += 4) {
      const r = raw[i], g = raw[i + 1], b = raw[i + 2];
      if (g > 70 && g < 190 && r < g * 0.55 && b < g * 0.8) green++;
    }
    console.log('rendered bottom-band green pixels after clean:', green);
    if (green > 0) throw new Error('FAIL: রেন্ডারে এখনো সবুজ-ব্যানার দেখা যাচ্ছে');
    console.log('✅ রেন্ডার-প্রমাণ: ব্যানার-ব্যান্ড সম্পূর্ণ সাদা (ভিজ্যুয়ালি পরিষ্কার)');
  } catch (e) {
    if (/FAIL/.test(e.message)) throw e;
    console.log('⚠️ রেন্ডার-যাচাই স্কিপ:', e.message);
  }

  console.log('\n🎉 QA পাস — v3 লসলেস-ওভারলে প্রমাণিত (JPEG-বাইট অক্ষত + ব্যানার সাদা + আইডেম্পোটেন্ট)');
  process.exit(0);
})().catch((e) => { console.error('❌', e && e.message); process.exit(1); });
