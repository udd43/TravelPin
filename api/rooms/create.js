import { sql } from '@vercel/postgres';
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { roomName, userId, nickname, avatar } = req.body;

    if (!roomName || !userId) {
      return res.status(400).json({ error: 'roomName and userId are required' });
    }

    // 8자리 방 ID 생성
    const roomId = Math.random().toString(36).substring(2, 10);
    const now = Date.now();

    // Postgres에 방 정보 저장
    await sql`
      INSERT INTO rooms (id, name, created_by, created_at)
      VALUES (${roomId}, ${roomName}, ${userId}, ${now})
    `;

    // KV에 방장을 첫 멤버로 등록
    const userData = {
      nickname: nickname || '익명',
      avatar: avatar || 'avatar_0',
      lat: 0,
      lng: 0,
      updatedAt: now,
      online: true,
    };
    await kv.set(`room:${roomId}:user:${userId}`, JSON.stringify(userData), { ex: 120 });

    // 방 멤버 목록에 추가
    await kv.sadd(`room:${roomId}:members`, userId);

    return res.status(200).json({ roomId, name: roomName, createdAt: now });
  } catch (error) {
    console.error('Create room error:', error);
    return res.status(500).json({ error: 'Failed to create room' });
  }
}
