const multer = require('multer');
const path = require('path');
const fs = require('fs');

function makeUploader(subfolder, maxSizeMB) {
  const dir = path.join(__dirname, '..', 'public', 'uploads', subfolder);
  fs.mkdirSync(dir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const base = path.basename(file.originalname, ext)
        .replace(/[^a-zA-Z0-9\u0980-\u09FF _-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .slice(0, 60);
      cb(null, Date.now() + '-' + (base || 'file') + ext);
    }
  });

  return multer({
    storage,
    limits: { fileSize: maxSizeMB * 1024 * 1024 }
  });
}

module.exports = {
  // 10MB per message attachment, 15MB per complaint attachment
  messageUpload: makeUploader('messages', 10),
  complaintUpload: makeUploader('complaints', 15)
};
