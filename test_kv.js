import { Redis } from '@upstash/redis';


const kv = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

async function test() {
  const roomId = 'test-room';
  await kv.del(`room:${roomId}:messages`);
  
  await kv.rpush(`room:${roomId}:messages`, JSON.stringify({ msgId: '1', text: 'hello' }));
  
  const msgs = await kv.lrange(`room:${roomId}:messages`, -100, -1);
  console.log('lrange -100 -1:', msgs);
  
  await kv.rpush(`room:${roomId}:messages`, JSON.stringify({ msgId: '2', text: 'world' }));
  const msgs2 = await kv.lrange(`room:${roomId}:messages`, 0, -1);
  console.log('lrange 0 -1:', msgs2);
}

test().catch(console.error);
