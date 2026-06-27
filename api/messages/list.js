import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const kv = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
    });

    const { roomId, after } = req.query;

    if (!roomId) {
      return res.status(400).json({ error: 'roomId is required' });
    }

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
