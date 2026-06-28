import { put, get } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.error('BLOB_READ_WRITE_TOKEN is not set');
    return res.status(500).json({ error: 'Blob storage not configured' });
  }

  // GET: 프라이빗 Blob 프록시 (사진 표시용)
  if (req.method === 'GET') {
    try {
      const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
      const url = searchParams.get('url');

      if (!url) {
        return res.status(400).json({ error: 'url parameter is required' });
      }

      const blob = await get(url, { token });

      res.setHeader('Content-Type', blob.contentType || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

      const arrayBuffer = await blob.arrayBuffer();
      return res.status(200).send(Buffer.from(arrayBuffer));
    } catch (error) {
      console.error('Blob proxy error:', error);
      return res.status(500).json({ error: 'Failed to fetch blob', detail: error.message });
    }
  }

  // POST: 사진 업로드
  if (req.method === 'POST') {
    try {
      const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
      const filename = searchParams.get('filename') || `photo-${Date.now()}.jpg`;

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
        access: 'private',
        contentType: req.headers['content-type'] || 'image/jpeg',
        addRandomSuffix: false,
        token,
      });

      // 프라이빗 URL을 프록시 URL로 변환하여 반환
      const proxyUrl = `/api/blob?url=${encodeURIComponent(blob.url)}`;
      return res.status(200).json({ url: proxyUrl });
    } catch (error) {
      console.error('Upload error:', error);
      return res.status(500).json({
        error: 'Failed to upload file',
        detail: error.message,
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
