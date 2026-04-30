// Minimal Node.js image upload server matching the email builder image-uploader plugin.
//
//   npm install express multer file-type cors
//   node nodejs.js
//
// POST /upload   multipart/form-data, field "file"
// 200            { "url": "/uploads/<name>" }
// 4xx/5xx        { "error": "..." }

const express = require("express");
const multer = require("multer");
const cors = require("cors");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

const UPLOAD_DIR = path.join(__dirname, "uploads");
const PUBLIC_BASE = "/uploads";
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES },
});

const app = express();
app.use(cors()); // restrict origin in production
app.use(PUBLIC_BASE, express.static(UPLOAD_DIR));

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Missing "file" field' });

    // Sniff real MIME from buffer (don't trust req.file.mimetype).
    const { fileTypeFromBuffer } = await import("file-type");
    const sniffed = await fileTypeFromBuffer(req.file.buffer);
    const mime = sniffed?.mime ?? "";
    const ext = ALLOWED[mime];
    if (!ext) return res.status(415).json({ error: `Unsupported image type: ${mime || "unknown"}` });

    const name = crypto.randomBytes(12).toString("hex") + "." + ext;
    fs.writeFileSync(path.join(UPLOAD_DIR, name), req.file.buffer);

    res.json({ url: `${PUBLIC_BASE}/${name}` });
  } catch (err) {
    if (err && err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "File too large" });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Upload server on :${port}`));
