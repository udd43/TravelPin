import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { roomId, after } = req.query;

    if (!roomId) {
      return res.status(400).json({ error: 'roomId is required' });
    }

    // Redis List에서 최근 100개 메시지 가져오기
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

    // after 파라미터가 있으면 해당 시간 이후 메시지만 반환 (폴링 최적화)
    if (after) {
      const afterTime = Number(after);
      messages = messages.filter((m) => m.createdAt > afterTime);
    }

    return res.status(200).json({ messages });
  } catch (error) {
    console.error('List messages error:', error);
    return res.status(500).json({ error: 'Failed to list messages' });
  }
}
