import { neon } from '@neondatabase/serverless';

const ADMIN_NICKNAME = '장종원';
const ADMIN_PASSWORD = '4356';

// POST /api/pins?action=create | delete
// GET  /api/pins?roomId=xxx
export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL);

  // GET — 핀 목록 조회
  if (req.method === 'GET') {
    try {
      const { roomId } = req.query;
      if (!roomId) return res.status(400).json({ error: 'roomId is required' });

      const rows = await sql`
        SELECT id, room_id, user_id, nickname, avatar, lat, lng, photo_url, comment, created_at
        FROM pins WHERE room_id = ${roomId} ORDER BY created_at DESC
      `;

      const pins = rows.map((row) => ({
        pinId: row.id, roomId: row.room_id, userId: row.user_id,
        nickname: row.nickname, avatar: row.avatar,
        lat: row.lat, lng: row.lng,
        photoUrl: row.photo_url, comment: row.comment,
        createdAt: Number(row.created_at),
      }));

      return res.status(200).json({ pins });
    } catch (error) {
      console.error('List pins error:', error);
      return res.status(500).json({ error: 'Failed to list pins', detail: error.message });
    }
  }

  // POST
  if (req.method === 'POST') {
    const { action } = req.query;

    // === CREATE ===
    if (action === 'create') {
      try {
        const { roomId, userId, nickname, avatar, lat, lng, photoUrl, comment } = req.body;
        if (!roomId || !userId || !lat || !lng || !photoUrl) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const pinId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const now = Date.now();

        await sql`
          INSERT INTO pins (id, room_id, user_id, nickname, avatar, lat, lng, photo_url, comment, created_at)
          VALUES (${pinId}, ${roomId}, ${userId}, ${nickname || '익명'}, ${avatar || 'avatar_0'}, ${lat}, ${lng}, ${photoUrl}, ${comment || ''}, ${now})
        `;

        return res.status(200).json({
          pinId, roomId, userId, nickname, avatar, lat, lng, photoUrl,
          comment: comment || '', createdAt: now,
        });
      } catch (error) {
        console.error('Create pin error:', error);
        return res.status(500).json({ error: 'Failed to create pin', detail: error.message });
      }
    }

    // === DELETE ===
    if (action === 'delete') {
      try {
        const { pinId, userId, adminNickname, adminPassword } = req.body;
        if (!pinId) return res.status(400).json({ error: 'pinId is required' });

        const isAdmin = adminNickname === ADMIN_NICKNAME && adminPassword === ADMIN_PASSWORD;

        if (isAdmin) {
          const rows = await sql`DELETE FROM pins WHERE id = ${pinId} RETURNING id`;
          if (rows.length === 0) return res.status(404).json({ error: '핀을 찾을 수 없습니다.' });
        } else {
          if (!userId) return res.status(400).json({ error: 'userId is required' });
          const rows = await sql`DELETE FROM pins WHERE id = ${pinId} AND user_id = ${userId} RETURNING id`;
          if (rows.length === 0) return res.status(403).json({ error: '삭제 권한이 없거나 핀을 찾을 수 없습니다.' });
        }

        return res.status(200).json({ success: true, deletedId: pinId });
      } catch (error) {
        console.error('Delete pin error:', error);
        return res.status(500).json({ error: 'Failed to delete pin', detail: error.message });
      }
    }

    return res.status(400).json({ error: 'Invalid action. Use ?action=create|delete' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
