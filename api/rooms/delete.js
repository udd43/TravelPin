import { neon } from '@neondatabase/serverless';
import { Redis } from '@upstash/redis';

const ADMIN_NICKNAME = '장종원';
const ADMIN_PASSWORD = '4356';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { roomId, adminNickname, adminPassword } = req.body;

    // 관리자 인증
    if (adminNickname !== ADMIN_NICKNAME || adminPassword !== ADMIN_PASSWORD) {
      return res.status(403).json({ error: '관리자 권한이 없습니다.' });
    }

    if (!roomId) {
      return res.status(400).json({ error: 'roomId is required' });
    }

    const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL);
    const kv = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
    });

    // 1. Postgres에서 핀 삭제 (방에 속한 모든 핀)
    await sql`DELETE FROM pins WHERE room_id = ${roomId}`;

    // 2. Postgres에서 방 삭제
    await sql`DELETE FROM rooms WHERE id = ${roomId}`;

    // 3. Redis에서 관련 데이터 삭제
    const memberIds = await kv.smembers(`room:${roomId}:members`);
    
    // 멤버 위치 데이터 삭제
    for (const uid of (memberIds || [])) {
      await kv.del(`room:${roomId}:user:${uid}`);
    }
    
    // 멤버 목록 삭제
    await kv.del(`room:${roomId}:members`);
    
    // 채팅 메시지 삭제
    await kv.del(`room:${roomId}:messages`);

    return res.status(200).json({ success: true, message: '방이 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete room error:', error);
    return res.status(500).json({ error: 'Failed to delete room', detail: error.message });
  }
}
