import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
  const kv = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
  });

  if (req.method === 'POST') {
    try {
      const { roomId, userId, nickname, avatar, lat, lng } = req.body;

      if (!roomId || !userId) {
        return res.status(400).json({ error: 'roomId and userId are required' });
      }

      const userData = {
        nickname: nickname || '익명',
        avatar: avatar || 'avatar_0',
        lat: lat || 0,
        lng: lng || 0,
        updatedAt: Date.now(),
        online: true,
      };

      await kv.set(`room:${roomId}:user:${userId}`, JSON.stringify(userData), { ex: 120 });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Update location error:', error);
      return res.status(500).json({ error: 'Failed to update location', detail: error.message });
    }
  }

  if (req.method === 'GET') {
    try {
      const { roomId } = req.query;

      if (!roomId) {
        return res.status(400).json({ error: 'roomId is required' });
      }

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
            uid,
            nickname: '??',
            avatar: 'avatar_0',
            lat: 0,
            lng: 0,
            updatedAt: 0,
            online: false,
          });
        }
      }

      return res.status(200).json({ members });
    } catch (error) {
      console.error('Get members error:', error);
      return res.status(500).json({ error: 'Failed to get members', detail: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
