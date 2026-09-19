/**
 * helpers/pdf-cleaner.js — চ্যানেল-প্রমো-লেয়ার ক্লিনার (সাইট-পাশ, session175)
 *
 * epaper-bot/src/cleaner.ts (v2)-এর Node/CJS-পোর্ট — ইমেজ-অপে sharp ব্যবহার করে।
 *
 * আসল-চ্যানেল-পিডিএফের তিন-রকম প্রমো-কাঠামো (session175-জরিপ):
 *   ① Contents-অ্যারের অ্যাপেন্ডেড প্রমো-স্ট্রিম + প্রমো-লিংক-অ্যানোটেশন
 *   ② একক-বড়-স্ট্রিমের টেইলে ভেক্টর-টেক্সট-ব্লক (শব্দ-ভাগ-করা BT…ET সিরিজ)
 *   ③ পূর্ণ-পাতা-JPEG-এর নিচের সাদা-মার্জিনে বেক-করা সবুজ-ব্যানার (পিক্সেল)
 *
 * ব্যর্থতায় সর্বদা মূল-বাফার ফেরত — প্রক্সি-প্রধান-প্রবাহ অটুট।
 */
const {
  PDFDocument, PDFName, PDFArray, PDFRef, PDFNumber, PDFRawStream, decodePDFRawStream,
} = require('pdf-lib');
const sharp = require('sharp');
const zlib = require('zlib');

const PROMO_MARKERS = [
  't.me/', 'telegram.me', 'epaperxpress', 'for more pdfs', 'join our', 'join us', 'telegram channel',
];

function normText(t) {
  return String(t || '').toLowerCase().replace(/t_me/g, 't.me');
}
function isPromoText(t) {
  const low = normText(t);
  return PROMO_MARKERS.some((m) => low.includes(m));
}
function streamText(stream) {
  try {
    return Buffer.from(decodePDFRawStream(stream).decode()).toString('latin1');
  } catch (e) {
    try { return Buffer.from(stream.contents).toString('latin1'); } catch (e2) { return ''; }
  }
}

/* ════ ভেক্টর-টেইল-ব্লক-কাট (নিউ-এজ-কাঠামো) ════ */
function collectTailBlocks(text) {
  const out = [];
  const re = /BT[\s\S]*?ET/g;
  let m;
  while ((m = re.exec(text))) {
    const seg = m[0];
    const strs = [];
    const sre = /\((?:\\.|[^\\()])*?\)/g;
    let sm;
    while ((sm = sre.exec(seg))) {
      strs.push(sm[0].slice(1, -1).replace(/\\([nrtbf()\\])/g, (_, c) => (
        ({ n: '\n', r: '\r', t: '\t', b: '\b', f: '\f' })[c] || c
      )));
    }
    const tm = seg.match(/([-\d.]+)\s+([-\d.]+)\s+Tm[\s\S]*?Tf/);
    const y = tm ? parseFloat(tm[2]) : null;
    out.push({ start: m.index, end: m.index + seg.length, text: strs.join(' '), y });
  }
  return out;
}

function cutPromoTailBlocks(text) {
  const blocks = collectTailBlocks(text);
  if (!blocks.length) return { text, cut: 0 };
  const cut = new Set();
  blocks.forEach((b, i) => { if (b.text && isPromoText(b.text)) cut.add(i); });
  if (!cut.size) return { text, cut: 0 };
  let grew = true;
  while (grew && cut.size < 40) {
    grew = false;
    for (const i of [...cut]) {
      for (const j of [i - 1, i + 1]) {
        if (j < 0 || j >= blocks.length || cut.has(j)) continue;
        const b = blocks[j], a = blocks[i];
        const simple = b.text.length > 0 && b.text.length <= 60 && !/\b(re|Do|BI|sh)\b/.test(text.slice(b.start + 2, b.end - 2));
        // y-গার্ড: প্রমো-স্ট্যাম্প একদম-নিচের-বেল্টে (absolute y ≤ ৬০) + প্রতিবেশী-কাছাকাছি
        const sameBand = a.y != null && b.y != null && Math.abs(a.y - b.y) <= 40 && a.y <= 60 && b.y <= 60;
        if (simple && sameBand) { cut.add(j); grew = true; }
      }
    }
  }
  if (cut.size < 2) return { text, cut: 0 };
  const sorted = [...cut].sort((a, b) => a - b);
  const joined = sorted.map((i) => blocks[i].text).join(' ');
  if (!isPromoText(joined)) return { text, cut: 0 };
  let out = '';
  let pos = 0;
  for (const i of sorted) {
    out += text.slice(pos, blocks[i].start);
    pos = blocks[i].end;
  }
  out += text.slice(pos);
  return { text: out, cut: cut.size };
}

/* ════ র‌্যাস্টার-সবুজ-ব্যান্ড শনাক্তকরণ (৪-চ্যানেল raw RGBA-তে) ════ */
function findPromoBand(data, W, H, y0) {
  const rows = [];
  for (let y = 0; y < H - y0; y++) {
    let g = 0;
    for (let x = 0; x < W; x += 2) {
      const i = (y * W + x) * 4;
      const r = data[i], gg = data[i + 1], b = data[i + 2];
      if (gg > 70 && gg < 190 && r < gg * 0.55 && b < gg * 0.8) g++;
    }
    if (g > Math.max(6, W / 150)) rows.push(y);
  }
  if (!rows.length) return null;
  const gapTol = Math.max(8, Math.round(H * 0.004));
  const bottom = rows[rows.length - 1];
  let top = bottom;
  for (let i = rows.length - 2; i >= 0; i--) {
    if (rows[i + 1] - rows[i] <= gapTol) top = rows[i];
    else break;
  }
  if (bottom - top + 1 > H * 0.03) return null; // ব্যানার-টেক্সট-সাইজ-গার্ড (ছবি/বিজ্ঞাপন-বাদ)
  const absTop = y0 + top, absBottom = y0 + bottom;
  if (absBottom < H * 0.85) return null;
  return { top: absTop, bottom: absBottom };
}

/** একক JPEG-বাফারে (থাম্বনেইল) ব্যানার-ব্যান্ড সাদা-করা */
async function coverPromoImageJpeg(input) {
  try {
    const meta = await sharp(input).metadata();
    const W = meta.width, H = meta.height;
    if (!W || !H) return { buffer: input, changed: false };
    const y0 = Math.floor(H * 0.85);
    const { data } = await sharp(input)
      .extract({ left: 0, top: y0, width: W, height: H - y0 })
      .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const band = findPromoBand(data, W, H, y0);
    if (!band) return { buffer: input, changed: false };
    const pad = Math.max(4, Math.round(H * 0.002));
    const top = Math.max(0, band.top - pad);
    const bh = Math.min(H, band.bottom + pad) - top;
    const white = await sharp({ create: { width: W, height: bh, channels: 3, background: { r: 255, g: 255, b: 255 } } })
      .png().toBuffer();
    const out = await sharp(input).composite([{ input: white, left: 0, top }]).jpeg({ quality: 85 }).toBuffer();
    return { buffer: out, changed: true };
  } catch (e) {
    return { buffer: input, changed: false, error: e && e.message };
  }
}

/** পিডিএফ-র সব-পাতায় প্রমো-লেয়ার পরিষ্কার (৪-পাস) */
async function cleanEpaperPdf(inputPdfBuffer) {
  try {
    const pdfDoc = await PDFDocument.load(inputPdfBuffer, { ignoreEncryption: true, updateMetadata: false });
    const pages = pdfDoc.getPages();
    let strippedStreams = 0, strippedAnnots = 0, tailBlocks = 0, imagesCovered = 0;
    const doneImgRefs = new Set();

    for (const page of pages) {
      /* ── পাস-২: প্রমো-লিংক-অ্যানোটেশন (সার্জিক্যাল) ── */
      const annotsRef = page.node.get(PDFName.of('Annots'));
      if (annotsRef) {
        const annots = pdfDoc.context.lookup(annotsRef);
        if (annots instanceof PDFArray) {
          const keep = [];
          for (let i = 0; i < annots.size(); i++) {
            const a = pdfDoc.context.lookup(annots.get(i));
            let promo = false;
            const text = a instanceof PDFRawStream ? streamText(a) : (a && a.toString ? a.toString() : '');
            if (isPromoText(text)) promo = true;
            if (!promo && a && typeof a.get === 'function') {
              try {
                const act = pdfDoc.context.lookup(a.get(PDFName.of('A')));
                const uri = act && typeof act.get === 'function' ? String(act.get(PDFName.of('URI')) || '') : '';
                if (uri && isPromoText(uri)) promo = true;
              } catch (e) { /* গার্ডেড */ }
            }
            if (!promo && annots.get(i) instanceof PDFRef) keep.push(annots.get(i));
          }
          if (keep.length < annots.size()) {
            strippedAnnots += annots.size() - keep.length;
            if (keep.length) {
              const kept = PDFArray.withContext(pdfDoc.context);
              keep.forEach((r) => kept.push(r));
              page.node.set(PDFName.of('Annots'), kept);
            } else {
              page.node.delete(PDFName.of('Annots'));
            }
          }
        }
      }

      const contentsRef = page.node.get(PDFName.of('Contents'));
      if (!contentsRef) continue;
      const contentsObj = pdfDoc.context.lookup(contentsRef);
      const streamRefs = [];
      if (contentsObj instanceof PDFArray) {
        for (let i = 0; i < contentsObj.size(); i++) streamRefs.push(contentsObj.get(i));
      } else if (contentsObj) {
        streamRefs.push(contentsRef);
      }

      /* ── পাস-১: অ্যাপেন্ডেড প্রমো-স্ট্রিম (শেষ-প্রান্ত-স্ক্যান) ── */
      if (contentsObj instanceof PDFArray && contentsObj.size() > 1) {
        while (contentsObj.size() > 1) {
          const last = pdfDoc.context.lookup(contentsObj.get(contentsObj.size() - 1));
          const text = last instanceof PDFRawStream ? streamText(last) : '';
          if (text && isPromoText(text)) { contentsObj.remove(contentsObj.size() - 1); strippedStreams++; }
          else break;
        }
      }

      /* ── পাস-৩: একক-স্ট্রিমের ভেক্টর-টেইল-ব্লক-কাট ── */
      for (const ref of streamRefs) {
        const s = pdfDoc.context.lookup(ref);
        if (!(s instanceof PDFRawStream)) continue;
        const t = streamText(s);
        if (!t || !isPromoText(t)) continue;
        const r = cutPromoTailBlocks(t);
        if (r.cut >= 2) {
          const compressed = zlib.deflateSync(Buffer.from(r.text, 'latin1'));
          s.contents = new Uint8Array(compressed);
          s.dict.set(PDFName.of('Filter'), PDFName.of('FlateDecode'));
          s.dict.set(PDFName.of('Length'), PDFNumber.of(compressed.length));
          tailBlocks += r.cut;
        }
      }

      /* ── পাস-৪: র‌্যাস্টার-সবুজ-ব্যান্ড-কভার (পূর্ণ-পাতা-JPEG) ── */
      const mb = page.getMediaBox();
      const resRef = page.node.get(PDFName.of('Resources'));
      const res = resRef ? pdfDoc.context.lookup(resRef) : null;
      const xoRef = res && res.get ? res.get(PDFName.of('XObject')) : null;
      const xo = xoRef ? pdfDoc.context.lookup(xoRef) : null;
      if (xo && typeof xo.entries === 'function') {
        const drawn = new Map();
        let contentText = '';
        for (const ref of streamRefs) {
          const s = pdfDoc.context.lookup(ref);
          if (s instanceof PDFRawStream) contentText += streamText(s) + '\n';
        }
        const dre = /([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+cm\s*\/([^\s/]+)\s+Do/g;
        let dm;
        while ((dm = dre.exec(contentText))) drawn.set(dm[7], { a: Math.abs(parseFloat(dm[1])), d: Math.abs(parseFloat(dm[4])) });
        const imgNames = [...xo.entries()];
        const soleImage = imgNames.length === 1;
        for (const [name, ref] of imgNames) {
          const key = String(ref);
          if (doneImgRefs.has(key)) continue;
          const s = pdfDoc.context.lookup(ref);
          const dict = (s && s.dict) || s;
          if (!dict || typeof dict.get !== 'function') continue;
          const filter = String(dict.get(PDFName.of('Filter')) || '');
          const subtype = String(dict.get(PDFName.of('Subtype')) || '');
          if (!/Image/.test(subtype) || !filter.includes('DCT')) continue;
          const geo = drawn.get(name);
          const fullPage = geo ? (geo.a >= mb.width * 0.5 && geo.d >= mb.height * 0.5) : soleImage;
          if (!fullPage) continue;
          try {
            const W = parseInt(dict.get(PDFName.of('Width')), 10);
            const H = parseInt(dict.get(PDFName.of('Height')), 10);
            if (!W || !H) continue;
            const y0 = Math.floor(H * 0.85);
            const { data } = await sharp(Buffer.from(s.contents))
              .extract({ left: 0, top: y0, width: W, height: H - y0 })
              .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
            const band = findPromoBand(data, W, H, y0);
            if (!band) continue;
            const pad = Math.max(4, Math.round(H * 0.002));
            const top = Math.max(0, band.top - pad);
            const bh = Math.min(H, band.bottom + pad) - top;
            const white = await sharp({ create: { width: W, height: bh, channels: 3, background: { r: 255, g: 255, b: 255 } } })
              .png().toBuffer();
            const outJpg = await sharp(Buffer.from(s.contents))
              .composite([{ input: white, left: 0, top }]).jpeg({ quality: 80 }).toBuffer();
            s.contents = new Uint8Array(outJpg);
            dict.set(PDFName.of('Length'), PDFNumber.of(outJpg.length));
            imagesCovered++;
            doneImgRefs.add(key);
          } catch (e) { /* প্রতি-ইমেজ-গার্ডেড */ }
        }
      }
    }

    const changed = strippedStreams > 0 || strippedAnnots > 0 || tailBlocks > 0 || imagesCovered > 0;
    if (!changed) {
      return { buffer: inputPdfBuffer, changed: false, streams: 0, annots: 0, tailBlocks: 0, imagesCovered: 0, pages: pages.length };
    }
    const out = await pdfDoc.save({ useObjectStreams: false });
    return {
      buffer: Buffer.from(out), changed: true,
      streams: strippedStreams, annots: strippedAnnots, tailBlocks, imagesCovered, pages: pages.length,
    };
  } catch (error) {
    return {
      buffer: inputPdfBuffer, changed: false, streams: 0, annots: 0, tailBlocks: 0, imagesCovered: 0, pages: 0,
      error: error && error.message ? error.message : String(error),
    };
  }
}

/** থাম্ব-উৎস-বাইট: JPEG হলে সরাসরি-কভার; PDF হলে পাতা-১-এর বৃহত্তম DCT-ইমেজ বের করে কভার */
async function coverPromoThumbBytes(raw) {
  if (raw && raw.length > 4 && raw.slice(0, 5).toString('latin1') === '%PDF-') {
    const pdfDoc = await PDFDocument.load(raw, { ignoreEncryption: true, updateMetadata: false });
    const page = pdfDoc.getPages()[0];
    if (!page) return null;
    const resRef = page.node.get(PDFName.of('Resources'));
    const res = resRef ? pdfDoc.context.lookup(resRef) : null;
    const xoRef = res && res.get ? res.get(PDFName.of('XObject')) : null;
    const xo = xoRef ? pdfDoc.context.lookup(xoRef) : null;
    if (!xo || typeof xo.entries !== 'function') return null;
    let best = null;
    for (const [, ref] of xo.entries()) {
      const s = pdfDoc.context.lookup(ref);
      const dict = (s && s.dict) || s;
      if (!dict || typeof dict.get !== 'function') continue;
      if (!String(dict.get(PDFName.of('Filter')) || '').includes('DCT')) continue;
      if (!/Image/.test(String(dict.get(PDFName.of('Subtype')) || ''))) continue;
      const w = parseInt(dict.get(PDFName.of('Width')), 10) || 0;
      const h = parseInt(dict.get(PDFName.of('Height')), 10) || 0;
      if (w * h > (best ? best.w * best.h : 0)) best = { w, h, bytes: Buffer.from(s.contents) };
    }
    if (!best || !best.bytes.length) return null;
    const r = await coverPromoImageJpeg(best.bytes);
    // পূর্ণ-রেজোলিউশন-ইমেজ ভারী — থাম্ব-মাপে নামানো (lh3 =s800-এর মতো)
    return sharp(r.buffer).resize({ width: 1000, withoutEnlargement: true }).jpeg({ quality: 80 }).toBuffer();
  }
  const r = await coverPromoImageJpeg(raw);
  return r.buffer;
}

module.exports = { cleanEpaperPdf, coverPromoImageJpeg, coverPromoThumbBytes, isPromoText };
