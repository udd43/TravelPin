// 관리자 인증 미들웨어 헬퍼
// 닉네임 "장종원" + 비밀번호 "4356" 조합만 관리자

const ADMIN_NICKNAME = '장종원';
const ADMIN_PASSWORD = '4356';

export function verifyAdmin(nickname, password) {
  return nickname === ADMIN_NICKNAME && password === ADMIN_PASSWORD;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nickname, password } = req.body;

  if (verifyAdmin(nickname, password)) {
    return res.status(200).json({ isAdmin: true });
  }

  return res.status(403).json({ isAdmin: false, error: 'Invalid admin credentials' });
}
