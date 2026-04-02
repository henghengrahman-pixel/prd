const path = require('path');
const multer = require('multer');
const fs = require('fs-extra');
const { PUBLIC_DIR } = require('../config/paths');

const uploadDir = path.join(PUBLIC_DIR, 'uploads');
fs.ensureDirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
    cb(null, safeName);
  }
});

module.exports = multer({ storage });
