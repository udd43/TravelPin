import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL);
    const { roomId } = req.query;

    if (!roomId) {
      return res.status(400).json({ error: 'roomId is required' });
    }

    // Neon은 rows 배열을 직접 반환
    const rows = await sql`
      SELECT id, room_id, user_id, nickname, avatar, lat, lng, photo_url, comment, created_at
      FROM pins
      WHERE room_id = ${roomId}
      ORDER BY created_at DESC
    `;

    const pins = rows.map((row) => ({
      pinId: row.id,
      roomId: row.room_id,
      userId: row.user_id,
      nickname: row.nickname,
      avatar: row.avatar,
      lat: row.lat,
      lng: row.lng,
      photoUrl: row.photo_url,
      comment: row.comment,
      createdAt: Number(row.created_at),
    }));

    return res.status(200).json({ pins });
  } catch (error) {
    console.error('List pins error:', error);
    return res.status(500).json({ error: 'Failed to list pins', detail: error.message });
  }
}
