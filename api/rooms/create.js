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

    const { roomName, userId, nickname, avatar } = req.body;

    if (!roomName || !userId) {
      return res.status(400).json({ error: 'roomName and userId are required' });
    }

    const roomId = Math.random().toString(36).substring(2, 10);
    const now = Date.now();

    // Neon은 결과를 배열로 직접 반환 (result.rows가 아님)
    await sql`
      INSERT INTO rooms (id, name, created_by, created_at)
      VALUES (${roomId}, ${roomName}, ${userId}, ${now})
    `;

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

    return res.status(200).json({ roomId, name: roomName, createdAt: now });
  } catch (error) {
    console.error('Create room error:', error);
    return res.status(500).json({ error: 'Failed to create room', detail: error.message });
  }
}
