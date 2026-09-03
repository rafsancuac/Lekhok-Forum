const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_ROOT = path.join(__dirname, '..', 'public', 'uploads');

// Ensure upload subdirectories exist
['avatars', 'covers', 'attachments', 'gallery', 'epaper'].forEach(dir => {
  const p = path.join(UPLOAD_ROOT, dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

// Sanitize filename: keep extension, drop unsafe chars, prefix with timestamp
function makeFilename(req, file, cb) {
  const ext = (path.extname(file.originalname) || '').toLowerCase().replace(/[^a-z0-9.]/g, '');
  const base = path.basename(file.originalname, path.extname(file.originalname))
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 40) || 'file';
  cb(null, `${Date.now()}-${base}${ext}`);
}

const IMAGE_TYPES = /^image\/(jpe?g|png|gif|webp|svg\+xml)$/;

function storageFor(subdir) {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(UPLOAD_ROOT, subdir)),
    filename: makeFilename
  });
}

// Avatar: images only, max 2MB
const avatarUpload = multer({
  storage: storageFor('avatars'),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (IMAGE_TYPES.test(file.mimetype)) cb(null, true);
    else cb(new Error('শুধু ছবি আপলোড করা যাবে (JPG/PNG/GIF/WebP)'));
  }
}).single('avatar');

// Cover image for posts: images only, max 5MB
const coverUpload = multer({
  storage: storageFor('covers'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (IMAGE_TYPES.test(file.mimetype)) cb(null, true);
    else cb(new Error('শুধু ছবি আপলোড করা যাবে'));
  }
}).single('cover');

// Attachments (messages/complaints): docs + images, max 10MB
const DOC_TYPES = /^((image|application|text)\/(jpe?g|png|gif|webp|pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|vnd\.ms-excel|vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|plain|x-zip-compressed|zip|octet-stream))$/;
const attachmentUpload = multer({
  storage: storageFor('attachments'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (DOC_TYPES.test(file.mimetype) || /\.(pdf|docx?|xlsx?|zip|jpe?g|png|gif|webp|txt)$/i.test(file.originalname)) cb(null, true);
    else cb(new Error('এই ধরনের ফাইল অনুমোদিত নয়'));
  }
}).single('attachment');

// Legacy aliases (same storage as attachments, used by routes/dashboard.js)
const messageUpload = attachmentUpload;
const complaintUpload = attachmentUpload;

// Gallery images: max 8MB
const galleryUpload = multer({
  storage: storageFor('gallery'),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (IMAGE_TYPES.test(file.mimetype)) cb(null, true);
    else cb(new Error('শুধু ছবি আপলোড করা যাবে'));
  }
}).single('image');

// Wrap multer so errors render nicely instead of crashing
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

module.exports = { avatarUpload, coverUpload, attachmentUpload, galleryUpload, messageUpload, complaintUpload, withUpload };
