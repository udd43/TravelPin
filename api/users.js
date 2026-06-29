import { Redis } from '@upstash/redis';

const ADMIN_NICKNAME = '장종원';
const ADMIN_PASSWORD = '4356';

// POST /api/users?action=location | kick
// GET  /api/users?roomId=xxx  (멤버 목록)
export default async function handler(req, res) {
  const kv = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
  });

  // GET — 멤버 목록 조회
  if (req.method === 'GET') {
    try {
      const { roomId } = req.query;
      if (!roomId) return res.status(400).json({ error: 'roomId is required' });

      const memberIds = await kv.smembers(`room:${roomId}:members`);
      if (!memberIds || memberIds.length === 0) {
        return res.status(200).json({ members: [] });
      }

      const members = [];
      for (const uid of memberIds) {
        const raw = await kv.get(`room:${roomId}:user:${uid}`);
        if (raw) {
          const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
          members.push({ uid, ...data, online: true });
        } else {
          members.push({
            uid, nickname: '??', avatar: 'avatar_0',
            lat: 0, lng: 0, updatedAt: 0, online: false,
          });
        }
      }

      return res.status(200).json({ members });
    } catch (error) {
      console.error('Get members error:', error);
      return res.status(500).json({ error: 'Failed to get members', detail: error.message });
    }
  }

  // POST
  if (req.method === 'POST') {
    const { action } = req.query;

    // === LOCATION UPDATE ===
    if (action === 'location') {
      try {
        const { roomId, userId, nickname, avatar, lat, lng } = req.body;
        if (!roomId || !userId) return res.status(400).json({ error: 'roomId and userId are required' });

        const userData = {
          nickname: nickname || '익명', avatar: avatar || 'avatar_0',
          lat: lat || 0, lng: lng || 0, updatedAt: Date.now(), online: true,
        };
        await kv.set(`room:${roomId}:user:${userId}`, JSON.stringify(userData), { ex: 120 });

        return res.status(200).json({ success: true });
      } catch (error) {
        console.error('Update location error:', error);
        return res.status(500).json({ error: 'Failed to update location', detail: error.message });
      }
    }

    // === KICK (admin only) ===
    if (action === 'kick') {
      try {
        const { roomId, targetUserId, adminNickname, adminPassword } = req.body;
        if (adminNickname !== ADMIN_NICKNAME || adminPassword !== ADMIN_PASSWORD) {
          return res.status(403).json({ error: '관리자 권한이 없습니다.' });
        }
        if (!roomId || !targetUserId) return res.status(400).json({ error: 'roomId and targetUserId are required' });

        await kv.del(`room:${roomId}:user:${targetUserId}`);
        await kv.srem(`room:${roomId}:members`, targetUserId);

        return res.status(200).json({ success: true, message: '멤버가 강퇴되었습니다.' });
      } catch (error) {
        console.error('Kick member error:', error);
        return res.status(500).json({ error: 'Failed to kick member', detail: error.message });
      }
    }

    // action 없이 POST → location update (하위 호환)
    if (!action) {
      try {
        const { roomId, userId, nickname, avatar, lat, lng } = req.body;
        if (!roomId || !userId) return res.status(400).json({ error: 'roomId and userId are required' });

        const userData = {
          nickname: nickname || '익명', avatar: avatar || 'avatar_0',
          lat: lat || 0, lng: lng || 0, updatedAt: Date.now(), online: true,
        };
        await kv.set(`room:${roomId}:user:${userId}`, JSON.stringify(userData), { ex: 120 });

        return res.status(200).json({ success: true });
      } catch (error) {
        console.error('Update location error:', error);
        return res.status(500).json({ error: 'Failed to update location', detail: error.message });
      }
    }

    return res.status(400).json({ error: 'Invalid action. Use ?action=location|kick' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
