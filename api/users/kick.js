import { Redis } from '@upstash/redis';

const ADMIN_NICKNAME = process.env.ADMIN_NICKNAME || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { roomId, targetUserId, adminNickname, adminPassword } = req.body;

    // 관리자 인증
    if (adminNickname !== ADMIN_NICKNAME || adminPassword !== ADMIN_PASSWORD) {
      return res.status(403).json({ error: '관리자 권한이 없습니다.' });
    }

    if (!roomId || !targetUserId) {
      return res.status(400).json({ error: 'roomId and targetUserId are required' });
    }

    const kv = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
    });

    // 1. 멤버 위치 데이터 삭제
    await kv.del(`room:${roomId}:user:${targetUserId}`);

    // 2. 멤버 목록에서 제거
    await kv.srem(`room:${roomId}:members`, targetUserId);

    return res.status(200).json({ success: true, message: '멤버가 강퇴되었습니다.' });
  } catch (error) {
    console.error('Kick member error:', error);
    return res.status(500).json({ error: 'Failed to kick member', detail: error.message });
  }
}
