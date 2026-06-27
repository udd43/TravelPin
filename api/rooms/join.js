import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);
import { Redis } from '@upstash/redis';
const kv = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { roomId, userId, nickname, avatar } = req.body;

    if (!roomId || !userId) {
      return res.status(400).json({ error: 'roomId and userId are required' });
    }

    // 방 존재 여부 확인
    const result = await sql`
      SELECT id, name FROM rooms WHERE id = ${roomId}
    `;

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '존재하지 않는 여행 방입니다.' });
    }

    const now = Date.now();

    // KV에 유저 등록
    const userData = {
      nickname: nickname || '익명',
      avatar: avatar || 'avatar_0',
      lat: 0,
      lng: 0,
      updatedAt: now,
      online: true,
    };
    await kv.set(`room:${roomId}:user:${userId}`, JSON.stringify(userData), { ex: 120 });

    // 멤버 목록에 추가
    await kv.sadd(`room:${roomId}:members`, userId);

    const room = result.rows[0];
    return res.status(200).json({
      roomId: room.id,
      name: room.name,
    });
  } catch (error) {
    console.error('Join room error:', error);
    return res.status(500).json({ error: 'Failed to join room' });
  }
}
