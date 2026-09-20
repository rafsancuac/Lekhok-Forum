/**
 * middleware/upload.js — Dual-mode file storage + automatic WebP conversion.
 *
 *  • Local dev (BLOB_READ_WRITE_TOKEN unset):  multer → disk at public/uploads/<subdir>
 *  • Vercel prod (BLOB_READ_WRITE_TOKEN set):  @vercel/blob → cloud, URL returned
 *  • JPEG/PNG uploads are auto-converted to WebP (smaller → faster pages,
 *    better Core Web Vitals). GIF/SVG/WebP pass through untouched. If sharp
 *    is missing or conversion fails, the ORIGINAL file is stored — an upload
 *    can never fail because of the optimiser.
 *
 * Routes keep using the same interface: req.file.path / req.file.filename / req.file.url.
 * The wrapper `withUpload()` catches errors and sets req.uploadError.
 */

const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

const UPLOAD_ROOT   = path.join(__dirname, '..', 'public', 'uploads');
const USE_BLOB      = !!process.env.BLOB_READ_WRITE_TOKEN;  // true on Vercel when token is set

// ── Local: ensure subdirectories exist ───────────────────────────────────────
// ⚠️ Vercel serverless এ ফাইল-সিস্টেম read-only (শুধু /tmp লেখা যায়) — এই
// top-level mkdir একবার EROFS ছুঁড়লেই পুরো ল্যাম্বডা কোল্ড-বুটে মরে যায়
// (FUNCTION_INVOCATION_FAILED, সব পেইজ 500)। তাই try/catch বাধ্যতামূলক।
// প্রোডাকশনে আপলোডের আসল পথ Vercel Blob (BLOB_READ_WRITE_TOKEN) — diskStorage
// শুধু লোকাল ডেভের জন্য; read-only হলে withUpload() সেটাই ধরে রিপোর্ট করে।
['avatars', 'covers', 'attachments', 'gallery', 'epaper', 'press', 'content'].forEach(dir => {
  try {
    const p = path.join(UPLOAD_ROOT, dir);
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
  } catch (e) { /* read-only FS (Vercel) — upload requests degrade via withUpload() */ }
});

// ── Local filename sanitizer ───────────────────────────────────────────────────
function makeFilename(req, file, cb) {
  const ext  = (path.extname(file.originalname) || '').toLowerCase().replace(/[^a-z0-9.]/g, '');
  const base = path.basename(file.originalname, path.extname(file.originalname))
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 40) || 'file';
  cb(null, `${Date.now()}-${base}${ext}`);
}

function makeFilenameSync(file) {
  const ext  = (path.extname(file.originalname) || '').toLowerCase().replace(/[^a-z0-9.]/g, '');
  const base = path.basename(file.originalname, path.extname(file.originalname))
    .replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40) || 'file';
  return `${Date.now()}-${base}${ext}`;
}

// সিকিউরিটি টাস্ক (§29/§30): SVG বাদ — SVG-তে <script> এমবেড করা যায় (stored XSS)।
// শুধু রাস্টার ফরম্যাট (jpeg/png/gif/webp) অনুমোদিত, যেগুলো WebP-রিঅ্যানকোডে স্যানিটাইজ হয়।
const IMAGE_TYPES = /^image\/(jpe?g|png|gif|webp)$/;
const IMAGE_EXT = /\.(jpe?g|png|gif|webp)$/i;
// সেশন ৯২: অডিও-এক্সটেনশন (মেসেঞ্জার ভয়েস-নোট — MediaRecorder আউটপুট webm/mp4/ogg)
const DOC_EXT   = /\.(pdf|docx?|xlsx?|zip|txt|jpe?g|png|gif|webp|webm|ogg|oga|mp3|m4a|wav|aac|opus)$/i;
const EPAPER_EXT = /\.(pdf|jpe?g|png|gif|webp)$/i;

// ── ম্যাজিক-বাইট যাচাই (MIME-spoofing গার্ড) ────────────────────────────────
// ক্লায়েন্টের দেওয়া mimetype/এক্সটেনশন বিশ্বাস করা হয় না — আসল ফাইল-সিগনেচার দেখি।
function detectImageType(buf) {
  if (!buf || buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpeg';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'png';
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return 'gif';
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return 'webp';
  return null;
}

// ── Automatic WebP optimiser ─────────────────────────────────────────────────
// Converts image/jpeg + image/png buffers to WebP in-place on req.file.
//  • .rotate()            → honours EXIF orientation (phone photos)
//  • resize 2000px inside → huge scans/photos are capped, never enlarged
//  • quality 82           → visually lossless for photos, ~25-35% smaller
//  • swap ONLY if smaller → pathological inputs (already-tiny files) keep original
// Any error (sharp unavailable, corrupt image) → keep the original buffer.
const WEBP_MAX_EDGE = 2000;

async function optimizeToWebp(file) {
  if (!file || !file.buffer) return;
  const isJpegPng = /^image\/(jpe?g|png)$/.test(file.mimetype);
  if (!isJpegPng) return;                    // gif/svg/webp/others → untouched
  try {
    const sharp = require('sharp');
    const out = await sharp(file.buffer, { failOn: 'none' })
      .rotate()
      .resize({ width: WEBP_MAX_EDGE, height: WEBP_MAX_EDGE, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    if (out.length < file.buffer.length) {   // never store a "compressed" file that is bigger
      file.buffer      = out;
      file.size        = out.length;
      file.mimetype    = 'image/webp';
      file.originalname = String(file.originalname || 'image').replace(/\.(jpe?g|png)$/i, '.webp');
    }
  } catch (e) {
    // Optimisation is best-effort: log and keep the original file.
    console.warn('[upload] WebP conversion skipped:', e.message);
  }
}

// ── Storage factories ─────────────────────────────────────────────────────────
function diskStorage(subdir) {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(UPLOAD_ROOT, subdir)),
    filename:    makeFilename
  });
}

// ── Blob uploader (Vercel) ────────────────────────────────────────────────────
// FIX: @vercel/blob v0.x has NO createClient() export — the old code here
// (`createClient(token).upload(...)`) crashed on every prod upload with
// "createClient is not a function". The real API is put(pathname, body, opts).
async function uploadToBlob(file, subdir) {
  const { put } = require('@vercel/blob');
  const ext  = (path.extname(file.originalname) || '').toLowerCase().replace(/[^a-z0-9.]/g, '');
  const key  = `${subdir}/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const { url } = await put(key, file.buffer, {
    access:      'public',
    token:       process.env.BLOB_READ_WRITE_TOKEN,
    contentType: file.mimetype
  });
  return { path: url, filename: file.originalname, url };
}

/**
 * Blob-aware upload wrapper.
 * Passes { subdir, maxBytes, allowedTypes }.
 * Returns a middleware that:
 *   • On Blob: reads file into RAM (multer.memoryStorage) then pushes to @vercel/blob
 *   • On disk:  writes directly via diskStorage
 */
// ── Field-name compatibility fix ─────────────────────────────────────────────
// BUGFIX: the old code used multer().single('file'), but NO form in the app
// actually uses field name "file" — register/edit use "avatar", messages and
// complaints use "attachment", article form uses "cover", gallery uses
// "image". req.file was therefore ALWAYS undefined and every upload silently
// did nothing. .fields() accepts all of them; the first present file is
// normalized to req.file so routes keep working unchanged.
const UPLOAD_FIELDS = ['file', 'avatar', 'attachment', 'cover', 'image', 'epaper', 'photo', 'resource_file'];

function makeUpload({ subdir, maxBytes, allowedTypes, allowedExts, inlineAudio }) {
  const dest = path.join(UPLOAD_ROOT, subdir);

  return (req, res, next) => {
    multer({
      storage: multer.memoryStorage(),
      limits:  { fileSize: maxBytes },
      fileFilter: (req, file, cb) => {
        // সিকিউরিটি টাস্ক: mimetype + এক্সটেনশন দুটোই স্ট্রিক্ট ভ্যালিডেট
        // সেশন ৯২: mimetype প্যারাম-স্ট্রিপ (audio/webm;codecs=opus → audio/webm)
        const mime = String(file.mimetype || '').split(';')[0].trim();
        const ext = (path.extname(file.originalname) || '').toLowerCase();
        const extOk = allowedExts ? allowedExts.test(ext) : true;
        const mimeOk = allowedTypes ? allowedTypes.test(mime) : true;
        if (!extOk || !mimeOk) {
          return cb(new Error('এই ধরনের ফাইল অনুমোদিত নয়'));
        }
        cb(null, true);
      }
    }).fields(UPLOAD_FIELDS.map(n => ({ name: n, maxCount: 1 })))(req, res, async (err) => {
      if (err) {
        req.uploadError = err.message || 'ফাইল আপলোড ব্যর্থ হয়েছে';
        return next();
      }
      // Normalize: pick the first uploaded file regardless of its field name
      const all = Object.values(req.files || {}).flat();
      req.file = all.length ? all[0] : undefined;
      if (!req.file) return next();

      // সিকিউরিটি টাস্ক: ছবির ম্যাজিক-বাইট যাচাই (MIME-spoofing ব্লক) —
      // এক্সটেনশন/mimetype যাই বলুক, আসল বাইটস দেখে image কিনা নিশ্চিত হই।
      if (allowedTypes === IMAGE_TYPES && req.file.buffer) {
        const real = detectImageType(req.file.buffer);
        if (!real) {
          req.uploadError = 'ফাইলটি একটি সঠিক ছবি নয় (ফাইল-সিগনেচার যাচাই ব্যর্থ)';
          req.file = undefined;
          return next();
        }
      }

      // Auto-optimise JPEG/PNG → WebP before storing (both Blob & disk paths
      // consume req.file.buffer, so one call covers both).
      await optimizeToWebp(req.file);

      // ── session183: মেসেঞ্জার ভয়েস-নোট স্থায়িত্ব (inlineAudio) ────────────────
      // ছোট অডিও (≤৪MB — ভয়েস-নোট বাস্তবে ≤৪০০KB) ডিস্ক/Blob-নির্ভরতা-শূন্যভাবে
      // data-URI হয়ে বার্তার file_url-এই DB-তে স্থায়ী থাকে — বার্তার-সাথেই অমর।
      // Vercel-এর এফিমারাল ফাইল-সিস্টেম, ব্লব-টোকেন-অনুপস্থিতি বা ব্লব-ব্যর্থতায়ও
      // "পাঠানো ভয়েস পরে শোনা যাচ্ছে না"-বাগ আর সম্ভব নয়।
      // (তালিকা/পোল-পেলোড হালকা রাখতে প্রদর্শনের-সময় voiceStreamUrl() সংক্ষিপ্ত
      // স্ট্রিম-লিংক দেয় — routes/dashboard.js → /api/messages/audio/:id)
      if (inlineAudio && req.file && req.file.buffer) {
        const rawMime = String(req.file.mimetype || '').split(';')[0].trim();
        if (/^audio\//.test(rawMime) && req.file.buffer.length <= 4 * 1024 * 1024) {
          req.file.url      = 'data:' + rawMime + ';base64,' + req.file.buffer.toString('base64');
          req.file.path     = req.file.url;
          req.file.filename = req.file.originalname;
          return next();
        }
      }

      if (USE_BLOB) {
        try {
          const result = await uploadToBlob(req.file, subdir);
          req.file.url      = result.url;
          req.file.filename = result.filename;
          req.file.path     = result.url;   // routes check .path for the URL
        } catch (e) {
          req.uploadError = 'Blob upload failed: ' + e.message;
        }
      } else {
        // Local disk fallback
        try {
          const filename = makeFilenameSync(req.file);
          const destPath = path.join(dest, filename);
          fs.writeFileSync(destPath, req.file.buffer);
          req.file.path     = destPath;
          req.file.url      = `/uploads/${subdir}/${filename}`;
          req.file.filename = filename;
        } catch (e) {
          // Read-only FS (Vercel without Blob token) or disk error — report
          // gracefully instead of crashing the request with a 500.
          req.uploadError = 'ফাইল সংরক্ষণ করা যায়নি (স্টোরেজ কনফিগার নেই)';
        }
      }
      next();
    });
  };
}

// ── Pre-built upload middlewares ─────────────────────────────────────────────
// Avatar: images only, max 2MB
const avatarUpload = makeUpload({
  subdir:      'avatars',
  maxBytes:    2 * 1024 * 1024,
  allowedTypes: IMAGE_TYPES,
  allowedExts:  IMAGE_EXT
});

// Cover image for posts: images only, max 5MB
const coverUpload = makeUpload({
  subdir:      'covers',
  maxBytes:    5 * 1024 * 1024,
  allowedTypes: IMAGE_TYPES,
  allowedExts:  IMAGE_EXT
});

// Attachments (messages/complaints): docs + images, max 10MB
// সেশন ৯২: audio গ্রুপ যোগ (voice-note) — busboy mimetype-এ `;codecs=` প্যারাম থাকলে
// fileFilter-এ আগে স্ট্রিপ হয়, তাই base-type-ই যথেষ্ট
const DOC_TYPES = /^((image|application|text|audio)\/(jpe?g|png|gif|webp|pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|vnd\.ms-excel|vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|plain|x-zip-compressed|zip|webm|ogg|mpeg|mp4|m4a|x-m4a|wav|x-wav|aac|opus))$/;
const attachmentUpload = makeUpload({
  subdir:      'attachments',
  maxBytes:    10 * 1024 * 1024,
  allowedTypes: DOC_TYPES,
  allowedExts:  DOC_EXT,
  fieldName:    'attachment'  // matches name="attachment" in form fields
});

const messageUpload   = attachmentUpload;
const complaintUpload = attachmentUpload;

// session183: মেসেঞ্জার-নির্দিষ্ট আপলোড — অডিও (ভয়েস-নোট) data-URI-তে DB-স্থায়ী;
// ১:১ (`/messages/:username`) ও গ্রুপ (`/messages/g/:id`) — দু-পথেই ব্যবহৃত
const messageAudioUpload = makeUpload({
  subdir:       'attachments',
  maxBytes:     10 * 1024 * 1024,
  allowedTypes: DOC_TYPES,
  allowedExts:  DOC_EXT,
  inlineAudio:  true
});

// Gallery images: max 8MB
const galleryUpload = makeUpload({
  subdir:      'gallery',
  maxBytes:    8 * 1024 * 1024,
  allowedTypes: IMAGE_TYPES,
  allowedExts:  IMAGE_EXT
});

// Press clippings (newspaper news about the forum): max 8MB, images only
const pressUpload = makeUpload({
  subdir:      'press',
  maxBytes:    8 * 1024 * 1024,
  allowedTypes: IMAGE_TYPES,
  allowedExts:  IMAGE_EXT
});

// e-Paper: PDF + images only (সিকিউরিটি টাস্ক: আগে "যেকোনো ফাইল" ছিল — HTML/SVG
// আপলোড করে stored-XSS সম্ভব ছিল)। max 20MB
const EPAPER_TYPES = /^((image|application)\/(jpe?g|png|gif|webp|pdf))$/;
const epaperUpload = makeUpload({
  subdir:      'epaper',
  maxBytes:    20 * 1024 * 1024,
  allowedTypes: EPAPER_TYPES,
  allowedExts:  EPAPER_EXT
});

// সেশন ১০১: রিসোর্স আপলোড — গাইডবুক/ই-বুক (PDF/DOC/XLSX), অডিও লেকচার, ভিডিও ক্লাস,
// ইনফোগ্রাফিক/সার্টিফিকেট। ভিডিও বড় হতে পারে → 60MB। HTML/SVG স্পষ্টভাবে বাদ
// (stored-XSS-প্রতিরোধ — epaper-র মতোই নীতি)।
const RES_TYPES = /^((image|application|text|audio|video)\/(jpe?g|png|gif|webp|pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|vnd\.ms-excel|vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|plain|octet-stream|webm|ogg|mpeg|mp4|x-m4a|wav|aac|opus|quicktime|x-msvideo))$/;
const RES_EXT = /\.(jpe?g|png|gif|webp|pdf|docx?|xlsx?|pptx?|mp3|m4a|wav|aac|opus|ogg|webm|mp4|mov|avi|txt|zip)$/i;
const resourceUpload = makeUpload({
  subdir:       'resources',
  maxBytes:     60 * 1024 * 1024,
  allowedTypes: RES_TYPES,
  allowedExts:  RES_EXT,
  fieldName:    'resource_file'
});

/**
 * সেশন ৩৫: কনটেন্ট এডিটরের ছবি/ব্যানার আপলোড — একাধিক নামাঙ্কিত ফিল্ড একসাথে।
 * makeUpload() একটি মাত্র req.file নরমালাইজ করে; কনটেন্ট ফর্মে একাধিক ইমেজ-ফিল্ড
 * (img_<key>) থাকতে পারে, তাই এই ভ্যারিয়েন্ট প্রতিটি ফাইল WebP-অপ্টিমাইজ +
 * স্টোর করে req.filesContent[<key>] = file আকারে ফেরত দেয়।
 * Blob/ডিস্ক — দুই মোডেই makeUpload-এর মতোই কাজ করে।
 */
function makeContentImageUpload({ subdir = 'content', maxBytes = 5 * 1024 * 1024, fieldNames = [] }) {
  const dest = path.join(UPLOAD_ROOT, subdir);
  return (req, res, next) => {
    if (!fieldNames.length) return next();
    multer({
      storage: multer.memoryStorage(),
      limits:  { fileSize: maxBytes, files: fieldNames.length },
      fileFilter: (req, file, cb) => {
        if (IMAGE_TYPES.test(file.mimetype)) cb(null, true);
        else cb(new Error('শুধুমাত্র ছবি ফাইল (JPG/PNG/WebP/GIF/SVG) আপলোড করা যাবে'));
      }
    }).fields(fieldNames.map(n => ({ name: n, maxCount: 1 })))(req, res, async (err) => {
      if (err) {
        req.uploadError = err.message || 'ছবি আপলোড ব্যর্থ হয়েছে';
        return next();
      }
      req.filesContent = {};
      const all = Object.values(req.files || {}).flat();
      for (const f of all) {
        try {
          await optimizeToWebp(f);
          if (USE_BLOB) {
            const result = await uploadToBlob(f, subdir);
            f.url = result.url; f.path = result.url; f.filename = result.filename;
          } else {
            const filename = makeFilenameSync(f);
            const destPath = path.join(dest, filename);
            fs.writeFileSync(destPath, f.buffer);
            f.path = destPath;
            f.url  = `/uploads/${subdir}/${filename}`;
            f.filename = filename;
          }
          // fieldname = 'img_<key>' → key বের করি
          const key = (f.fieldname || '').replace(/^img_/, '');
          if (key) req.filesContent[key] = f;
        } catch (e) {
          req.uploadError = req.uploadError || ('ছবি সংরক্ষণ ব্যর্থ: ' + (e.message || ''));
        }
      }
      next();
    });
  };
}

// ── Error wrapper (keeps existing API) ────────────────────────────────────────
function withUpload(mw) {
  return (req, res, next) => {
    mw(req, res, (err) => {
      if (err) {
        req.uploadError = err.message || 'ফাইল আপলোড ব্যর্থ হয়েছে';
      }
      next();
    });
  };
}

/**
 * সেশন ৩৬ হটফিক্স: একটি রেডি-করা ফাইল-অবজেক্ট (memoryStorage-এর req.file,
 * buffer আকারে) দ্বৈত-মোডে সংরক্ষণ করে URL ফেরত দেয় — Blob (Vercel) বা ডিস্ক
 * (লোকাল)। admin /content/upload-এর মতো JSON-আপলোড-এন্ডপয়েন্ট এটি ব্যবহার করে।
 * ⚠️ এই ফাংশন কখনো মডিউল-লোডে নয়, রিকোয়েস্টের সময় ডাকতে হয় — Vercel-এর
 * read-only ল্যাম্বডা FS-এ mkdir করলে পুরো বুট মরে যায় (সেশন ৩৬-এর ঘটনা)।
 */
async function storeBufferImage(file, subdir) {
  await optimizeToWebp(file);
  if (USE_BLOB) {
    const result = await uploadToBlob(file, subdir);
    return { url: result.url, filename: result.filename };
  }
  // লোকাল ডিস্ক — গার্ডেড mkdir (read-only FS হলে স্পষ্ট এরর-মেসেজ)
  const dest = path.join(UPLOAD_ROOT, subdir);
  try {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  } catch (e) {
    throw new Error('স্টোরেজ লেখাযোগ্য নয় (read-only FS) — Blob টোকেন কনফিগার করুন');
  }
  const filename = makeFilenameSync(file);
  const destPath = path.join(dest, filename);
  fs.writeFileSync(destPath, file.buffer);
  return { url: `/uploads/${subdir}/${filename}`, filename };
}

// ── সেশন ১৫৩: মিডিয়া-সংরক্ষণ (ভিডিও/অডিও — বাইনারি-নিরপেক্ষ) ─────────────────
// FB-কম্পোজারের /upload-media ভিডিও/অডিও ফাইল রাখে — WebP-অপটিমাইজার (sharp)
// এদের উপর চলবে না; বাইনারি-নিরপেক্ষ ডিস্ক/ব্লব-লেখা। মাইম/এক্সটেনশন স্যানিটাইজ +
// হোয়াইটলিস্ট (video/*, audio/* — কলার আগেই যাচাই করে; এখানে দ্বিতীয়-স্তর)।
async function storeBufferMedia153(file, subdir) {
  const mimeOk = /^(video|audio)\//.test(String(file.mimetype || ''));
  const ext = (path.extname(file.originalname) || '').toLowerCase().replace(/[^a-z0-9.]/g, '');
  const extOk = /\.(mp4|webm|ogg|oga|ogv|mov|m4v|mp3|m4a|wav|aac|opus)$/.test(ext);
  if (!mimeOk || !extOk) throw new Error('অসমর্থিত মিডিয়া-ফরম্যাট');
  if (USE_BLOB) {
    const result = await uploadToBlob(file, subdir);
    return { url: result.url, filename: result.filename };
  }
  const dest = path.join(UPLOAD_ROOT, subdir);
  try {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  } catch (e) {
    throw new Error('স্টোরেজ লেখাযোগ্য নয় (read-only FS) — Blob টোকেন কনফিগার করুন');
  }
  const filename = makeFilenameSync(file);
  fs.writeFileSync(path.join(dest, filename), file.buffer);
  return { url: `/uploads/${subdir}/${filename}`, filename };
}

module.exports = {
  avatarUpload, coverUpload, attachmentUpload, galleryUpload, pressUpload,
  messageUpload, complaintUpload, epaperUpload,
  messageAudioUpload,
  resourceUpload,
  makeContentImageUpload,
  withUpload,
  optimizeToWebp,
  storeBufferImage,
  storeBufferMedia153
};
