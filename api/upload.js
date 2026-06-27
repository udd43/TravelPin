import { put } from '@vercel/blob';

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

    // Vercel Blob에 파일 업로드
    const blob = await put(filename, req, {
      access: 'public',
      contentType: req.headers['content-type'] || 'image/jpeg',
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

export const config = {
  api: {
    bodyParser: false,
  },
};
