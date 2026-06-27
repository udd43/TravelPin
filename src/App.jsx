import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import MapRoom from './pages/MapRoom';
import { useAuth } from './hooks/useAuth';
import { useRoom } from './hooks/useRoom';

function App() {
  const { user, loading, signIn, setProfile } = useAuth();
  const { createRoom, joinRoom } = useRoom();
  const [initialized, setInitialized] = useState(false);

  // 앱 시작 시 익명 로그인
  useEffect(() => {
    if (!loading && !user) {
      signIn();
    }
    if (!loading) {
      setInitialized(true);
    }
  }, [loading, user, signIn]);

  const handleSetProfile = async (nickname, avatar) => {
    await setProfile(nickname, avatar);
  };

  const handleCreateRoom = async (roomName) => {
    if (!user) return null;
    const updatedUser = { ...user };
    return await createRoom(roomName, updatedUser);
  };

  const handleJoinRoom = async (roomId) => {
    if (!user) return false;
    return await joinRoom(roomId, user);
  };

  if (!initialized) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <div className="loading-text">TravelPin을 시작하는 중...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Home
            user={user}
            onSetProfile={handleSetProfile}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            loading={loading}
          />
        }
      />
      <Route
        path="/room/:roomId"
        element={
          user?.nickname ? (
            <MapRoom user={user} />
          ) : (
            <Home
              user={user}
              onSetProfile={handleSetProfile}
              onCreateRoom={handleCreateRoom}
              onJoinRoom={handleJoinRoom}
              loading={loading}
            />
          )
        }
      />
    </Routes>
  );
}

export default function AppWithRouter() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
