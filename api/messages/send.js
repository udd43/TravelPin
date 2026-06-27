import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    // 위치 메시지인 경우 좌표 추가
    if (type === 'location' && lat && lng) {
      message.lat = lat;
      message.lng = lng;
    }

    // Redis List에 메시지 추가 (RPUSH: 끝에 추가)
    await kv.rpush(`room:${roomId}:messages`, JSON.stringify(message));

    // 최근 200개만 유지 (오래된 메시지 자동 삭제)
    await kv.ltrim(`room:${roomId}:messages`, -200, -1);

    return res.status(200).json({ success: true, message });
  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
}
