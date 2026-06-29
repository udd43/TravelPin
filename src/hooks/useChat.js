import { useState, useEffect, useCallback, useRef } from 'react';

const POLL_INTERVAL = 5000; // 5초 폴링 (서버 부하 감소)

/**
 * 실시간 그룹 채팅 훅
 * Firebase onValue() → 3초 Short Polling으로 전환
 */
export function useChat(roomId) {
  const [messages, setMessages] = useState([]);
  const intervalRef = useRef(null);
  const lastTimestampRef = useRef(0);

  // 메시지 폴링
  useEffect(() => {
    if (!roomId) return;

    const fetchMessages = async () => {
      try {
        let url = `/api/messages?roomId=${roomId}`;
        // after 파라미터로 마지막 메시지 이후만 가져오기 (최적화)
        if (lastTimestampRef.current > 0) {
          url += `&after=${lastTimestampRef.current}`;
        }

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const newMsgs = data.messages || [];

          if (lastTimestampRef.current === 0) {
            // 최초 로딩: 전체 메시지 세팅
            setMessages(newMsgs);
          } else if (newMsgs.length > 0) {
            // 이후: 새 메시지만 추가
            setMessages((prev) => {
              const existingIds = new Set(prev.map((m) => m.msgId));
              const uniqueNew = newMsgs.filter((m) => !existingIds.has(m.msgId));
              return [...prev, ...uniqueNew];
            });
          }

          // 마지막 메시지 타임스탬프 업데이트
          if (newMsgs.length > 0) {
            const latest = newMsgs[newMsgs.length - 1];
            if (latest.createdAt > lastTimestampRef.current) {
              lastTimestampRef.current = latest.createdAt;
            }
          }
        } else {
          console.error('Fetch messages non-ok response:', await res.text());
        }
      } catch (err) {
        console.error('Fetch messages error:', err);
      }
    };

    // 즉시 한 번 + 3초마다 폴링
    fetchMessages();
    intervalRef.current = setInterval(fetchMessages, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      lastTimestampRef.current = 0;
    };
  }, [roomId]);

  const sendMessage = useCallback(async (roomId, user, text, type = 'text', extra = {}) => {
    if (!roomId || !user || !text.trim()) return;
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          userId: user.uid,
          nickname: user.nickname,
          avatar: user.avatar,
          text,
          type,
          ...extra,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // 즉시 UI에 반영 (폴링 전에 바로 표시)
        setMessages((prev) => {
          const exists = prev.some((m) => m.msgId === data.message.msgId);
          if (exists) return prev;
          return [...prev, data.message];
        });
        lastTimestampRef.current = data.message.createdAt;
      }
    } catch (err) {
      console.error('Send message failed:', err);
    }
  }, []);

  const sendLocationMessage = useCallback(async (roomId, user, lat, lng) => {
    await sendMessage(roomId, user, '📍 내 위치를 공유했어요', 'location', { lat, lng });
  }, [sendMessage]);

  const sendPhotoMessage = useCallback(async (roomId, user, photoUrl) => {
    await sendMessage(roomId, user, photoUrl, 'photo');
  }, [sendMessage]);

  return { messages, sendMessage, sendLocationMessage, sendPhotoMessage };
}
