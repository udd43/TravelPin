import { useState, useEffect, useCallback, useRef } from 'react';
import Compressor from 'compressorjs';

const POLL_INTERVAL = 5000;

/**
 * 사진 핀 CRUD 훅
 * 관리자는 모든 핀 삭제 가능
 */
export function usePins(roomId) {
  const [pins, setPins] = useState([]);
  const intervalRef = useRef(null);

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
      const compressed = await compressImage(photoFile);

      const filename = `${roomId}/${Date.now()}_${user.uid}.jpg`;
      const uploadRes = await fetch(`/api/blob?filename=${encodeURIComponent(filename)}`, {
        method: 'POST',
        body: compressed,
        headers: {
          'Content-Type': compressed.type || 'image/jpeg',
        },
      });

      if (!uploadRes.ok) {
        const errData = await uploadRes.json().catch(() => ({}));
        console.error('Photo upload failed:', errData);
        throw new Error(errData.detail || '사진 업로드 실패');
      }
      const { url: photoUrl } = await uploadRes.json();

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

      const newPin = await pinRes.json();
      setPins((prev) => [newPin, ...prev]);

      return true;
    } catch (err) {
      console.error('Create pin failed:', err);
      return false;
    }
  }, []);

  // user 객체를 받아서 관리자면 관리자 인증도 함께 전달
  const deletePin = useCallback(async (roomId, pinId, uid, pinUserId, user) => {
    const isAdmin = user?.isAdmin;

    // 일반 유저는 자기 핀만 삭제
    if (!isAdmin && uid !== pinUserId) return false;

    try {
      const body = { pinId, userId: uid };

      // 관리자인 경우 관리자 인증 추가
      if (isAdmin) {
        body.adminNickname = user.nickname;
        body.adminPassword = user.adminPassword;
      }

      const res = await fetch('/api/pins/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) return false;

      setPins((prev) => prev.filter((p) => p.pinId !== pinId));
      return true;
    } catch (err) {
      console.error('Delete pin failed:', err);
      return false;
    }
  }, []);

  return { pins, createPin, deletePin };
}
