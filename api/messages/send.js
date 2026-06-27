import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const kv = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
    });

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
