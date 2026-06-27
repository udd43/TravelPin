import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== 'DELETE' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pinId, userId } = req.body;

    if (!pinId || !userId) {
      return res.status(400).json({ error: 'pinId and userId are required' });
    }

    // 본인 핀만 삭제 가능
    const result = await sql`
      DELETE FROM pins WHERE id = ${pinId} AND user_id = ${userId}
      RETURNING id
    `;

    if (result.rows.length === 0) {
      return res.status(403).json({ error: '삭제 권한이 없거나 핀을 찾을 수 없습니다.' });
    }

    return res.status(200).json({ success: true, deletedId: pinId });
  } catch (error) {
    console.error('Delete pin error:', error);
    return res.status(500).json({ error: 'Failed to delete pin' });
  }
}
