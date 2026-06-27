import { put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
    const filename = searchParams.get('filename') || `photo-${Date.now()}.jpg`;

    // Vercel Blob에 파일 업로드 (request body를 직접 스트림으로 전달)
    const blob = await put(filename, req, {
      access: 'public',
      contentType: req.headers['content-type'] || 'image/jpeg',
    });

    return res.status(200).json({ url: blob.url });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Failed to upload file' });
  }
}

export const config = {
  api: {
    bodyParser: false, // 스트림 업로드를 위해 body parser 비활성화
  },
};
