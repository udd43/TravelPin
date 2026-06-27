import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL);
    const { roomId } = req.query;

    if (!roomId) {
      return res.status(400).json({ error: 'roomId is required' });
    }

    // Neon은 rows 배열을 직접 반환
    const rows = await sql`
      SELECT id, name, created_by, created_at
      FROM rooms WHERE id = ${roomId}
    `;

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const room = rows[0];
    return res.status(200).json({
      roomId: room.id,
      name: room.name,
      createdBy: room.created_by,
      createdAt: Number(room.created_at),
    });
  } catch (error) {
    console.error('Get room error:', error);
    return res.status(500).json({ error: 'Failed to get room', detail: error.message });
  }
}
