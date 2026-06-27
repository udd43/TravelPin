import { Redis } from '@upstash/redis';
const kv = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // 내 위치 업데이트
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

      // TTL 120초: 120초 안에 업데이트 안 하면 자동 만료 → 오프라인 처리
      await kv.set(`room:${roomId}:user:${userId}`, JSON.stringify(userData), { ex: 120 });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Update location error:', error);
      return res.status(500).json({ error: 'Failed to update location' });
    }
  }

  if (req.method === 'GET') {
    // 방의 모든 멤버 위치 조회
    try {
      const { roomId } = req.query;

      if (!roomId) {
        return res.status(400).json({ error: 'roomId is required' });
      }

      // 멤버 목록 가져오기
      const memberIds = await kv.smembers(`room:${roomId}:members`);

      if (!memberIds || memberIds.length === 0) {
        return res.status(200).json({ members: [] });
      }

      // 각 멤버의 위치 데이터 가져오기
      const members = [];
      for (const uid of memberIds) {
        const raw = await kv.get(`room:${roomId}:user:${uid}`);
        if (raw) {
          const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
          members.push({
            uid,
            ...data,
            online: true,
          });
        } else {
          // TTL 만료 → 오프라인 (멤버 목록에는 남아있지만 데이터 없음)
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
      return res.status(500).json({ error: 'Failed to get members' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
