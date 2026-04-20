import express from 'express';
import multer from 'multer';
import QRCode from 'qrcode';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const upload = multer({ dest: '/tmp/' });

const files = new Map();

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

app.use(express.static('public'));
app.use(express.json());

app.post('/upload', upload.single('file'), async (req, res) => {
  const code = generateCode();
  const fileData = {
    path: req.file.path,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    timestamp: Date.now()
  };

  files.set(code, fileData);

  setTimeout(() => files.delete(code), 24 * 60 * 60 * 1000);

  const downloadUrl = `${req.protocol}://${req.get('host')}/download?code=${code}`;
  const qrCode = await QRCode.toDataURL(downloadUrl);

  res.json({ code, qrCode, fileName: fileData.originalName });
});

app.get('/download', (req, res) => {
  const code = req.query.code;
  const fileData = files.get(code);

  if (!fileData) {
    return res.status(404).send('File not found or expired');
  }

  res.download(fileData.path, fileData.originalName);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});