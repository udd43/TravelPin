import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
      pinId,
      roomId,
      userId,
      nickname,
      avatar,
      lat,
      lng,
      photoUrl,
      comment: comment || '',
      createdAt: now,
    });
  } catch (error) {
    console.error('Create pin error:', error);
    return res.status(500).json({ error: 'Failed to create pin' });
  }
}
