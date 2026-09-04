/**
 * middleware/upload.js — Dual-mode file storage.
 *
 *  • Local dev (BLOB_READ_WRITE_TOKEN unset):  multer → disk at public/uploads/<subdir>
 *  • Vercel prod (BLOB_READ_WRITE_TOKEN set):  @vercel/blob → cloud, URL returned
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
['avatars', 'covers', 'attachments', 'gallery', 'epaper'].forEach(dir => {
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

const IMAGE_TYPES = /^image\/(jpe?g|png|gif|webp|svg\+xml)$/;

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
function makeUpload({ subdir, maxBytes, allowedTypes }) {
  const dest = path.join(UPLOAD_ROOT, subdir);

  return (req, res, next) => {
    multer({
      storage: multer.memoryStorage(),
      limits:  { fileSize: maxBytes },
      fileFilter: (req, file, cb) => {
        if (!allowedTypes || allowedTypes.test(file.mimetype) ||
            /\.(pdf|docx?|xlsx?|zip|jpe?g|png|gif|webp|txt)$/i.test(file.originalname)) {
          cb(null, true);
        } else {
          cb(new Error('এই ধরনের ফাইল অনুমোদিত নয়'));
        }
      }
    }).single('file')(req, res, async (err) => {
      if (err) {
        req.uploadError = err.message || 'ফাইল আপলোড ব্যর্থ হয়েছে';
        return next();
      }
      if (!req.file) return next();

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
        const filename = makeFilenameSync(req.file);
        const destPath = path.join(dest, filename);
        fs.writeFileSync(destPath, req.file.buffer);
        req.file.path     = destPath;
        req.file.url      = `/uploads/${subdir}/${filename}`;
        req.file.filename = filename;
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
  allowedTypes: IMAGE_TYPES
});

// Cover image for posts: images only, max 5MB
const coverUpload = makeUpload({
  subdir:      'covers',
  maxBytes:    5 * 1024 * 1024,
  allowedTypes: IMAGE_TYPES
});

// Attachments (messages/complaints): docs + images, max 10MB
const DOC_TYPES = /^((image|application|text)\/(jpe?g|png|gif|webp|pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|vnd\.ms-excel|vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|plain|x-zip-compressed|zip|octet-stream))$/;
const attachmentUpload = makeUpload({
  subdir:      'attachments',
  maxBytes:    10 * 1024 * 1024,
  allowedTypes: DOC_TYPES
});

const messageUpload   = attachmentUpload;
const complaintUpload = attachmentUpload;

// Gallery images: max 8MB
const galleryUpload = makeUpload({
  subdir:      'gallery',
  maxBytes:    8 * 1024 * 1024,
  allowedTypes: IMAGE_TYPES
});

// e-Paper: any file type, max 20MB
const epaperUpload = makeUpload({
  subdir:   'epaper',
  maxBytes: 20 * 1024 * 1024,
  allowedTypes: null
});

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

module.exports = {
  avatarUpload, coverUpload, attachmentUpload, galleryUpload,
  messageUpload, complaintUpload, epaperUpload,
  withUpload
};
