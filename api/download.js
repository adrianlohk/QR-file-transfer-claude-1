import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const code = req.query.code;

  if (!code) {
    return res.status(400).json({ error: 'Code required' });
  }

  try {
    const fileData = await kv.get(`file:${code}`);

    if (!fileData) {
      return res.status(404).json({ error: 'File not found or expired' });
    }

    const parsed = JSON.parse(fileData);
    const buffer = Buffer.from(parsed.file, 'base64');

    res.setHeader('Content-Disposition', `attachment; filename="${parsed.fileName}"`);
    res.setHeader('Content-Type', parsed.mimeType);
    res.status(200).send(buffer);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
}