import { Redis } from '@upstash/redis';

// POST /api/messages?action=send
// GET  /api/messages?roomId=xxx&after=timestamp
export default async function handler(req, res) {
  const kv = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
  });

  // GET — 메시지 목록 조회
  if (req.method === 'GET') {
    try {
      const { roomId, after } = req.query;
      if (!roomId) return res.status(400).json({ error: 'roomId is required' });

      const rawMessages = await kv.lrange(`room:${roomId}:messages`, -100, -1);

      if (!rawMessages || rawMessages.length === 0) {
        return res.status(200).json({ messages: [] });
      }

      let messages = rawMessages.map((raw) => {
        if (typeof raw === 'string') {
          try { return JSON.parse(raw); } catch { return raw; }
        }
        return raw;
      });

      if (after) {
        const afterTime = Number(after);
        messages = messages.filter((m) => m.createdAt > afterTime);
      }

      return res.status(200).json({ messages });
    } catch (error) {
      console.error('List messages error:', error);
      return res.status(500).json({ error: 'Failed to list messages', detail: error.message });
    }
  }

  // POST — 메시지 전송
  if (req.method === 'POST') {
    try {
      const { roomId, userId, nickname, avatar, text, type, lat, lng } = req.body;
      if (!roomId || !userId || !text) {
        return res.status(400).json({ error: 'roomId, userId, and text are required' });
      }

      const message = {
        msgId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        userId,
        nickname: nickname || '익명',
        avatar: avatar || 'avatar_0',
        text,
        type: type || 'text',
        createdAt: Date.now(),
      };

      if (type === 'location' && lat && lng) {
        message.lat = lat;
        message.lng = lng;
      }

      await kv.rpush(`room:${roomId}:messages`, JSON.stringify(message));
      await kv.ltrim(`room:${roomId}:messages`, -200, -1);

      return res.status(200).json({ success: true, message });
    } catch (error) {
      console.error('Send message error:', error);
      return res.status(500).json({ error: 'Failed to send message', detail: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
