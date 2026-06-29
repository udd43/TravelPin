import { neon } from '@neondatabase/serverless';
import { Redis } from '@upstash/redis';
import { list, del } from '@vercel/blob';

export default async function handler(req, res) {
  // Vercel Cron Authentication (Only allow Vercel Cron or Admin)
  if (
    process.env.CRON_SECRET &&
    req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL);
    const kv = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
    });

    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const expiredTime = Date.now() - SEVEN_DAYS_MS;

    const expiredRooms = await sql`
      SELECT id FROM rooms WHERE created_at < ${expiredTime}
    `;

    if (expiredRooms.length === 0) {
      return res.status(200).json({ success: true, message: 'No expired rooms found.' });
    }

    for (const room of expiredRooms) {
      const roomId = room.id;
      
      // 1. Delete Postgres Room (cascades pins)
      await sql`DELETE FROM rooms WHERE id = ${roomId}`;

      // 2. Delete KV Redis data
      const memberIds = await kv.smembers(`room:${roomId}:members`);
      for (const uid of (memberIds || [])) {
        await kv.del(`room:${roomId}:user:${uid}`);
      }
      await kv.del(`room:${roomId}:members`);
      await kv.del(`room:${roomId}:messages`);

      // 3. Delete Vercel Blob Photos for this room
      try {
        let cursor;
        do {
          const listResult = await list({
            prefix: `${roomId}/`,
            cursor,
            token: process.env.BLOB_READ_WRITE_TOKEN,
          });
          
          if (listResult.blobs.length > 0) {
            await del(listResult.blobs.map(b => b.url), { token: process.env.BLOB_READ_WRITE_TOKEN });
          }
          cursor = listResult.cursor;
        } while (cursor);
      } catch (blobErr) {
        console.error(`Blob deletion failed for room ${roomId}:`, blobErr);
      }
    }

    return res.status(200).json({ success: true, deletedCount: expiredRooms.length });
  } catch (error) {
    console.error('Cron cleanup error:', error);
    return res.status(500).json({ error: 'Cleanup failed', detail: error.message });
  }
}
