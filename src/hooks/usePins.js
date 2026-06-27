import { useState, useEffect, useCallback, useRef } from 'react';
import Compressor from 'compressorjs';

const POLL_INTERVAL = 5000; // 5초 폴링 (핀은 위치보다 덜 빈번)

/**
 * 사진 핀 CRUD 훅
 * Firebase onValue() + Storage → fetch API + Vercel Blob으로 전환
 */
export function usePins(roomId) {
  const [pins, setPins] = useState([]);
  const intervalRef = useRef(null);

  // 핀 목록 폴링
  useEffect(() => {
    if (!roomId) return;

    const fetchPins = async () => {
      try {
        const res = await fetch(`/api/pins/list?roomId=${roomId}`);
        if (res.ok) {
          const data = await res.json();
          setPins(data.pins || []);
        }
      } catch (err) {
        console.error('Fetch pins error:', err);
      }
    };

    fetchPins();
    intervalRef.current = setInterval(fetchPins, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [roomId]);

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      new Compressor(file, {
        quality: 0.7,
        maxWidth: 1200,
        maxHeight: 1200,
        success: resolve,
        error: reject,
      });
    });
  };

  const createPin = useCallback(async (roomId, user, lat, lng, photoFile, comment = '') => {
    try {
      // 1. 사진 압축
      const compressed = await compressImage(photoFile);

      // 2. Vercel Blob에 사진 업로드
      const filename = `${roomId}/${Date.now()}_${user.uid}.jpg`;
      const uploadRes = await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, {
        method: 'POST',
        body: compressed,
        headers: {
          'Content-Type': compressed.type || 'image/jpeg',
        },
      });

      if (!uploadRes.ok) throw new Error('사진 업로드 실패');
      const { url: photoUrl } = await uploadRes.json();

      // 3. Postgres에 핀 데이터 저장
      const pinRes = await fetch('/api/pins/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          userId: user.uid,
          nickname: user.nickname,
          avatar: user.avatar,
          lat,
          lng,
          photoUrl,
          comment,
        }),
      });

      if (!pinRes.ok) throw new Error('핀 저장 실패');

      // 즉시 UI에 반영
      const newPin = await pinRes.json();
      setPins((prev) => [newPin, ...prev]);

      return true;
    } catch (err) {
      console.error('Create pin failed:', err);
      return false;
    }
  }, []);

  const deletePin = useCallback(async (roomId, pinId, uid, pinUserId) => {
    if (uid !== pinUserId) return false;
    try {
      const res = await fetch('/api/pins/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinId, userId: uid }),
      });

      if (!res.ok) return false;

      // 즉시 UI에서 제거
      setPins((prev) => prev.filter((p) => p.pinId !== pinId));
      return true;
    } catch (err) {
      console.error('Delete pin failed:', err);
      return false;
    }
  }, []);

  return { pins, createPin, deletePin };
}
