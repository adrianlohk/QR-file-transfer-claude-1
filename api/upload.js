import { kv } from '@vercel/kv';
import QRCode from 'qrcode';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse body if it's a string
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    const code = generateCode();
    const { file, fileName, mimeType } = body;

    if (!file || !fileName) {
      return res.status(400).json({ error: 'Missing file data' });
    }

    // Store file in Vercel KV
    await kv.setex(
      `file:${code}`,
      24 * 60 * 60, // 24 hours expiration
      JSON.stringify({
        file,
        fileName,
        mimeType,
        timestamp: Date.now(),
      })
    );

    // Generate download URL and QR code
    const downloadUrl = `${req.headers['x-forwarded-proto']}://${req.headers.host}/api/download?code=${code}`;
    const qrCode = await QRCode.toDataURL(downloadUrl);

    res.status(200).json({ code, qrCode, fileName });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
}