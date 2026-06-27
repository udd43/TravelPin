import { neon } from '@neondatabase/serverless';

const ADMIN_NICKNAME = '장종원';
const ADMIN_PASSWORD = '4356';

export default async function handler(req, res) {
  if (req.method !== 'DELETE' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL);
    const { pinId, userId, adminNickname, adminPassword } = req.body;

    if (!pinId) {
      return res.status(400).json({ error: 'pinId is required' });
    }

    // 관리자 인증 확인
    const isAdmin = adminNickname === ADMIN_NICKNAME && adminPassword === ADMIN_PASSWORD;

    if (isAdmin) {
      // 관리자는 모든 핀 삭제 가능
      const rows = await sql`
        DELETE FROM pins WHERE id = ${pinId}
        RETURNING id
      `;

      if (rows.length === 0) {
        return res.status(404).json({ error: '핀을 찾을 수 없습니다.' });
      }
    } else {
      // 일반 유저는 자기 핀만 삭제 가능
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const rows = await sql`
        DELETE FROM pins WHERE id = ${pinId} AND user_id = ${userId}
        RETURNING id
      `;

      if (rows.length === 0) {
        return res.status(403).json({ error: '삭제 권한이 없거나 핀을 찾을 수 없습니다.' });
      }
    }

    return res.status(200).json({ success: true, deletedId: pinId });
  } catch (error) {
    console.error('Delete pin error:', error);
    return res.status(500).json({ error: 'Failed to delete pin', detail: error.message });
  }
}
