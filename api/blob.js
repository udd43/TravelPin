import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
    const filename = searchParams.get('filename') || `photo-${Date.now()}.jpg`;

    // BLOB_READ_WRITE_TOKEN 환경변수 확인
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error('BLOB_READ_WRITE_TOKEN is not set');
      return res.status(500).json({ error: 'Blob storage not configured' });
    }

    // request body를 Buffer로 수집 (bodyParser: false 시 raw stream)
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks);

    if (body.length === 0) {
      return res.status(400).json({ error: 'Empty file body' });
    }

    // Vercel Blob에 파일 업로드
    const blob = await put(filename, body, {
      contentType: req.headers['content-type'] || 'image/jpeg',
      addRandomSuffix: false,
      token,
    });

    return res.status(200).json({ url: blob.url });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      error: 'Failed to upload file', 
      detail: error.message 
    });
  }
}
