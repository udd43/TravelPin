import { neon } from '@neondatabase/serverless';
import { Redis } from '@upstash/redis';

const ADMIN_NICKNAME = '장종원';
const ADMIN_PASSWORD = '4356';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function getSQL() {
  return neon(process.env.DATABASE_URL || process.env.POSTGRES_URL);
}
function getKV() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
  });
}

// POST /api/rooms?action=create | join | delete
// GET  /api/rooms?roomId=xxx
export default async function handler(req, res) {
  const sql = getSQL();
  const kv = getKV();

  // GET — 방 정보 조회
  if (req.method === 'GET') {
    try {
      const { roomId } = req.query;
      if (!roomId) return res.status(400).json({ error: 'roomId is required' });

      const rows = await sql`
        SELECT id, name, created_by, created_at FROM rooms WHERE id = ${roomId}
      `;
      if (rows.length === 0) return res.status(404).json({ error: 'Room not found' });

      const room = rows[0];
      return res.status(200).json({
        roomId: room.id,
        name: room.name,
        createdBy: room.created_by,
        createdAt: Number(room.created_at),
      });
    } catch (error) {
      console.error('Get room error:', error);
      return res.status(500).json({ error: 'Failed to get room', detail: error.message });
    }
  }

  // POST — action 기반 라우팅
  if (req.method === 'POST') {
    const { action } = req.query;

    // === CREATE ===
    if (action === 'create') {
      try {
        const { roomName, userId, nickname, avatar } = req.body;
        if (!roomName || !userId) return res.status(400).json({ error: 'roomName and userId are required' });

        const roomId = Math.random().toString(36).substring(2, 10);
        const now = Date.now();

        await sql`
          INSERT INTO rooms (id, name, created_by, created_at)
          VALUES (${roomId}, ${roomName}, ${userId}, ${now})
        `;

        const userData = {
          nickname: nickname || '익명', avatar: avatar || 'avatar_0',
          lat: 0, lng: 0, updatedAt: now, online: true,
        };
        await kv.set(`room:${roomId}:user:${userId}`, JSON.stringify(userData), { ex: 120 });
        await kv.sadd(`room:${roomId}:members`, userId);

        return res.status(200).json({ roomId, name: roomName, createdAt: now });
      } catch (error) {
        console.error('Create room error:', error);
        return res.status(500).json({ error: 'Failed to create room', detail: error.message });
      }
    }

    // === JOIN ===
    if (action === 'join') {
      try {
        const { roomId, userId, nickname, avatar } = req.body;
        if (!roomId || !userId) return res.status(400).json({ error: 'roomId and userId are required' });

        const rows = await sql`SELECT id, name, created_at FROM rooms WHERE id = ${roomId}`;
        if (rows.length === 0) return res.status(404).json({ error: '존재하지 않는 여행 방입니다.' });

        const room = rows[0];
        const now = Date.now();

        if (now - parseInt(room.created_at) > SEVEN_DAYS_MS) {
          return res.status(403).json({ error: '생성된 지 7일이 지나 만료된 방입니다.' });
        }

        const userData = {
          nickname: nickname || '익명', avatar: avatar || 'avatar_0',
          lat: 0, lng: 0, updatedAt: now, online: true,
        };
        await kv.set(`room:${roomId}:user:${userId}`, JSON.stringify(userData), { ex: 120 });
        await kv.sadd(`room:${roomId}:members`, userId);

        return res.status(200).json({ roomId: room.id, name: room.name });
      } catch (error) {
        console.error('Join room error:', error);
        return res.status(500).json({ error: 'Failed to join room', detail: error.message });
      }
    }

    // === DELETE (admin only) ===
    if (action === 'delete') {
      try {
        const { roomId, adminNickname, adminPassword } = req.body;
        if (adminNickname !== ADMIN_NICKNAME || adminPassword !== ADMIN_PASSWORD) {
          return res.status(403).json({ error: '관리자 권한이 없습니다.' });
        }
        if (!roomId) return res.status(400).json({ error: 'roomId is required' });

        await sql`DELETE FROM pins WHERE room_id = ${roomId}`;
        await sql`DELETE FROM rooms WHERE id = ${roomId}`;

        const memberIds = await kv.smembers(`room:${roomId}:members`);
        for (const uid of (memberIds || [])) {
          await kv.del(`room:${roomId}:user:${uid}`);
        }
        await kv.del(`room:${roomId}:members`);
        await kv.del(`room:${roomId}:messages`);

        return res.status(200).json({ success: true, message: '방이 삭제되었습니다.' });
      } catch (error) {
        console.error('Delete room error:', error);
        return res.status(500).json({ error: 'Failed to delete room', detail: error.message });
      }
    }

    return res.status(400).json({ error: 'Invalid action. Use ?action=create|join|delete' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
