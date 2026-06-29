import { neon } from '@neondatabase/serverless';
import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL);
    const kv = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
    });

    const { roomId, userId, nickname, avatar } = req.body;

    if (!roomId || !userId) {
      return res.status(400).json({ error: 'roomId and userId are required' });
    }

    // Neon은 rows 배열을 직접 반환
    const rows = await sql`
      SELECT id, name, created_at FROM rooms WHERE id = ${roomId}
    `;

    if (rows.length === 0) {
      return res.status(404).json({ error: '존재하지 않는 여행 방입니다.' });
    }

    const room = rows[0];
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    // 7일 만료 체크
    if (now - parseInt(room.created_at) > SEVEN_DAYS_MS) {
      return res.status(403).json({ error: '생성된 지 7일이 지나 만료된 방입니다.' });
    }

    const userData = {
      nickname: nickname || '익명',
      avatar: avatar || 'avatar_0',
      lat: 0,
      lng: 0,
      updatedAt: now,
      online: true,
    };
    await kv.set(`room:${roomId}:user:${userId}`, JSON.stringify(userData), { ex: 120 });
    await kv.sadd(`room:${roomId}:members`, userId);

    const room = rows[0];
    return res.status(200).json({
      roomId: room.id,
      name: room.name,
    });
  } catch (error) {
    console.error('Join room error:', error);
    return res.status(500).json({ error: 'Failed to join room', detail: error.message });
  }
}
