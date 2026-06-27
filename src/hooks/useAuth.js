import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'travelpin_user';

/**
 * localStorage 기반 익명 인증 훅
 * Firebase Anonymous Auth 대체 — UUID로 사용자 식별
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // localStorage에서 사용자 정보 복구
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        // 손상된 데이터 → 새로 생성
        const newUser = createUser();
        setUser(newUser);
      }
    } else {
      const newUser = createUser();
      setUser(newUser);
    }
    setLoading(false);
  }, []);

  function createUser() {
    const newUser = {
      uid: uuidv4(),
      nickname: null,
      avatar: null,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    return newUser;
  }

  // signIn은 이제 no-op (이미 localStorage에서 자동 생성)
  const signIn = useCallback(() => {
    // 이미 user가 없으면 자동 생성되므로 별도 로직 불필요
  }, []);

  const setProfile = useCallback(async (nickname, avatar) => {
    setUser((prev) => {
      const updated = { ...prev, nickname, avatar };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateProfile = useCallback(async (updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { user, loading, signIn, setProfile, updateProfile };
}
