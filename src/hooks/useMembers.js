import { useState, useEffect, useRef, useCallback } from 'react';

const POLL_INTERVAL = 3000; // 3초 폴링

/**
 * 멤버 위치 실시간 관리 훅
 * Firebase onValue() 실시간 구독 → 3초 Short Polling으로 전환
 */
export function useMembers(roomId, currentUid) {
  const [members, setMembers] = useState([]);
  const intervalRef = useRef(null);

  // 멤버 목록 폴링
  useEffect(() => {
    if (!roomId) return;

    const fetchMembers = async () => {
      try {
        const res = await fetch(`/api/users?roomId=${roomId}`);
        if (res.ok) {
          const data = await res.json();
          setMembers(data.members || []);
        }
      } catch (err) {
        console.error('Fetch members error:', err);
      }
    };

    // 즉시 한 번 + 3초마다 폴링
    fetchMembers();
    intervalRef.current = setInterval(fetchMembers, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [roomId]);

  const updateMyLocation = useCallback(async (roomId, uid, lat, lng, nickname, avatar) => {
    if (!roomId || !uid) return;
    try {
      await fetch('/api/users?action=location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, userId: uid, nickname, avatar, lat, lng }),
      });
    } catch (err) {
      console.error('Update location failed:', err);
    }
  }, []);

  return { members, updateMyLocation };
}
