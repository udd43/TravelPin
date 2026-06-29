import { useState, useCallback } from 'react';

/**
 * 방 생성/입장/관리 훅
 * Firebase → Vercel API Routes 기반으로 전환
 */
export function useRoom() {
  const [room, setRoom] = useState(null);
  const [roomLoading, setRoomLoading] = useState(false);
  const [error, setError] = useState(null);

  const createRoom = useCallback(async (roomName, user) => {
    try {
      setRoomLoading(true);
      const res = await fetch('/api/rooms?action=create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName,
          userId: user.uid,
          nickname: user.nickname,
          avatar: user.avatar,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '방 생성 실패');
      }

      const data = await res.json();
      setRoom(data);
      setRoomLoading(false);
      return data.roomId;
    } catch (err) {
      console.error('Create room failed:', err);
      setError(err.message);
      setRoomLoading(false);
      return null;
    }
  }, []);

  const joinRoom = useCallback(async (roomId, user) => {
    try {
      setRoomLoading(true);
      const res = await fetch('/api/rooms?action=join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          userId: user.uid,
          nickname: user.nickname,
          avatar: user.avatar,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || '방 입장 실패');
        setRoomLoading(false);
        return false;
      }

      const data = await res.json();
      setRoom(data);
      setRoomLoading(false);
      return true;
    } catch (err) {
      console.error('Join room failed:', err);
      setError(err.message);
      setRoomLoading(false);
      return false;
    }
  }, []);

  const leaveRoom = useCallback(async (roomId, uid) => {
    // Vercel KV의 TTL이 만료되면 자동으로 오프라인 처리됨
    // 명시적 퇴장은 불필요하지만, 즉시 오프라인으로 표시하고 싶다면 API 호출
  }, []);

  const getRoomInfo = useCallback(async (roomId) => {
    try {
      const res = await fetch(`/api/rooms?roomId=${roomId}`);
      if (!res.ok) return null;
      const data = await res.json();
      setRoom(data);
      return data;
    } catch (err) {
      console.error('Get room info failed:', err);
      return null;
    }
  }, []);

  const getInviteLink = useCallback((roomId) => {
    return `${window.location.origin}/room/${roomId}`;
  }, []);

  return {
    room,
    roomLoading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    getRoomInfo,
    getInviteLink,
    setError,
  };
}
