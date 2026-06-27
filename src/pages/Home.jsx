import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AVATARS } from '../components/Map/UserMarker';
import { HiOutlineMapPin, HiOutlineUserGroup, HiOutlinePlus, HiOutlineArrowRightOnRectangle } from 'react-icons/hi2';

export default function Home({ user, onSetProfile, onCreateRoom, onJoinRoom, loading: authLoading }) {
  const navigate = useNavigate();
  const { roomId: urlRoomId } = useParams();

  const [step, setStep] = useState(urlRoomId ? 'nickname' : 'home'); // home | create | nickname
  const [roomName, setRoomName] = useState('');
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || 'avatar_0');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

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
      // 초대 링크로 입장
      const success = await onJoinRoom(urlRoomId);
      if (success) {
        navigate(`/room/${urlRoomId}`);
      } else {
        setError('존재하지 않는 여행 방이에요.');
      }
    } else {
      // 새 방 생성
      const newRoomId = await onCreateRoom(roomName.trim());
      if (newRoomId) {
        navigate(`/room/${newRoomId}`);
      } else {
        setError('방 생성에 실패했어요. 다시 시도해주세요.');
      }
    }
    setJoining(false);
  };

  if (authLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <div className="loading-text">로딩 중...</div>
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
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}
          >
            <div className="home-logo">🗺️</div>
            <h1 className="home-title">TravelPin</h1>
            <p className="home-subtitle">
              친구들과 실시간 위치를 공유하고<br />
              여행의 순간을 지도에 남겨보세요
            </p>

            <div className="home-card glass-card">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HiOutlinePlus /> 여행 방 만들기
              </h2>
              <div className="home-form">
                <input
                  className="input-field"
                  placeholder="여행 이름 (예: 제주도 여름 여행)"
                  value={roomName}
                  onChange={(e) => { setRoomName(e.target.value); setError(''); }}
                  maxLength={30}
                  id="room-name-input"
                />
                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-error)' }}
                  >
                    {error}
                  </motion.p>
                )}
                <button
                  className="btn btn-primary btn-full btn-lg"
                  onClick={handleCreateRoom}
                  id="create-room-btn"
                >
                  방 만들기 →
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'nickname' && (
          <motion.div
            key="nickname"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}
          >
            <div className="home-logo">👋</div>
            <h1 className="home-title" style={{ fontSize: 'var(--font-size-2xl)' }}>
              {urlRoomId ? '여행에 참여하기' : '프로필 설정'}
            </h1>
            <p className="home-subtitle">
              지도에 표시될 닉네임과 아바타를 선택해주세요
            </p>

            <div className="home-card glass-card">
              <div className="home-form">
                <div>
                  <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: '8px', display: 'block' }}>
                    닉네임
                  </label>
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
                  <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: '12px', display: 'block' }}>
                    아바타
                  </label>
                  <div className="avatar-selector">
                    {AVATARS.map((emoji, idx) => (
                      <button
                        key={idx}
                        className={`avatar avatar-lg avatar-option ${selectedAvatar === `avatar_${idx}` ? 'avatar-selected' : ''}`}
                        onClick={() => setSelectedAvatar(`avatar_${idx}`)}
                        id={`avatar-${idx}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-error)' }}
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  className="btn btn-primary btn-full btn-lg"
                  onClick={handleSetProfileAndProceed}
                  disabled={joining}
                  id="join-btn"
                >
                  {joining ? (
                    <>
                      <span className="loading-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                      입장 중...
                    </>
                  ) : (
                    <>
                      <HiOutlineArrowRightOnRectangle />
                      {urlRoomId ? '여행 참여하기' : '시작하기'}
                    </>
                  )}
                </button>

                {!urlRoomId && (
                  <button
                    className="btn btn-ghost btn-full"
                    onClick={() => { setStep('home'); setError(''); }}
                    id="back-btn"
                  >
                    ← 뒤로
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
