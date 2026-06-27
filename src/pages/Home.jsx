import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AVATARS } from '../components/Map/UserMarker';

export default function Home({ user, onSetProfile, onCreateRoom, onJoinRoom, loading: authLoading }) {
  const navigate = useNavigate();
  const { roomId: urlRoomId } = useParams();

  const [step, setStep] = useState(urlRoomId ? 'nickname' : 'home');
  const [roomName, setRoomName] = useState('');
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || 'avatar_0');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [recentRooms, setRecentRooms] = useState([]);

  // 컴포넌트 마운트 시 최근 방문 방 불러오기
  useState(() => {
    try {
      const recent = JSON.parse(localStorage.getItem('travelpin_recent_rooms') || '[]');
      setRecentRooms(recent);
    } catch (e) {
      setRecentRooms([]);
    }
  });

  const handleRecentRoomClick = (roomId) => {
    navigate(`/room/${roomId}`);
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      setError('여행 방 이름을 입력해주세요.');
      return;
    }
    setStep('nickname');
  };

  const handleSetProfileAndProceed = async () => {
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }
    setJoining(true);
    setError('');

    await onSetProfile(nickname.trim(), selectedAvatar);

    if (urlRoomId) {
      const success = await onJoinRoom(urlRoomId);
      if (success) {
        navigate(`/room/${urlRoomId}`);
      } else {
        setError('존재하지 않는 여행 방이에요.');
      }
    } else {
      const newRoomId = await onCreateRoom(roomName.trim());
      if (newRoomId) {
        navigate(`/room/${newRoomId}`);
      } else {
        setError('방 생성에 실패했어요.');
      }
    }
    setJoining(false);
  };

  if (authLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <div className="loading-text">LOADING</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <AnimatePresence mode="wait">
        {step === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}
          >
            <div className="home-logo">📍</div>
            <h1 className="home-title">TravelPin</h1>
            <p className="home-subtitle">
              실시간 위치 공유<br />
              여행의 순간을 기록하세요
            </p>

            <div className="home-card">
              <h2>+ CREATE ROOM</h2>
              <div className="home-form">
                <div>
                  <label className="input-label">ROOM NAME</label>
                  <input
                    className="input-field"
                    placeholder="제주도 여름 여행"
                    value={roomName}
                    onChange={(e) => { setRoomName(e.target.value); setError(''); }}
                    maxLength={30}
                    id="room-name-input"
                  />
                </div>
                {error && (
                  <p className="error-text">{error}</p>
                )}
                <button
                  className="btn btn-primary btn-full btn-lg"
                  onClick={handleCreateRoom}
                  id="create-room-btn"
                >
                  CREATE →
                </button>
              </div>
            </div>

            {recentRooms.length > 0 && (
              <div style={{ width: '100%', maxWidth: 400, marginTop: 24 }}>
                <h2 style={{
                  fontFamily: 'var(--font-mono)', fontSize: 'var(--label)', color: 'var(--text-secondary)',
                  marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em'
                }}>RECENT ROOMS</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {recentRooms.map(room => (
                    <button
                      key={room.id}
                      className="btn btn-secondary btn-full"
                      onClick={() => handleRecentRoomClick(room.id)}
                      style={{ justifyContent: 'space-between', padding: '12px 16px' }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.name}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-disabled)' }}>ENTER →</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {step === 'nickname' && (
          <motion.div
            key="nickname"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}
          >
            <div className="home-logo">👋</div>
            <h1 className="home-title" style={{ fontSize: 'var(--display)' }}>
              {urlRoomId ? 'JOIN' : 'PROFILE'}
            </h1>
            <p className="home-subtitle">
              지도에 표시될 닉네임과 아바타를 선택하세요
            </p>

            <div className="home-card">
              <div className="home-form">
                <div>
                  <label className="input-label">NICKNAME</label>
                  <input
                    className="input-field"
                    placeholder="지도에 표시될 이름"
                    value={nickname}
                    onChange={(e) => { setNickname(e.target.value); setError(''); }}
                    maxLength={12}
                    id="nickname-input"
                  />
                </div>

                <div>
                  <label className="input-label">AVATAR</label>
                  <div className="avatar-selector">
                    {AVATARS.map((emoji, idx) => (
                      <button
                        key={idx}
                        className={`avatar-option ${selectedAvatar === `avatar_${idx}` ? 'avatar-selected' : ''}`}
                        onClick={() => setSelectedAvatar(`avatar_${idx}`)}
                        id={`avatar-${idx}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <p className="error-text">{error}</p>
                )}

                <button
                  className="btn btn-primary btn-full btn-lg"
                  onClick={handleSetProfileAndProceed}
                  disabled={joining}
                  id="join-btn"
                >
                  {joining ? 'LOADING...' : (urlRoomId ? 'JOIN ROOM' : 'START →')}
                </button>

                {!urlRoomId && (
                  <button
                    className="btn btn-ghost btn-full"
                    onClick={() => { setStep('home'); setError(''); }}
                    id="back-btn"
                  >
                    ← BACK
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
