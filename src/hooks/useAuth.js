import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'travelpin_user';

/**
 * localStorage 기반 익명 인증 훅
 * Firebase Anonymous Auth 대체 — UUID로 사용자 식별
 * 관리자 인증은 서버 사이드에서 환경변수로 처리
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
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
      isAdmin: false,
      adminPassword: null,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    return newUser;
  }

  const signIn = useCallback(() => {}, []);

  const setProfile = useCallback(async (nickname, avatar, adminPassword = null) => {
    // 관리자 여부는 서버에서 검증 — 클라이언트는 비밀번호가 입력되었는지만 확인
    const isAdmin = !!adminPassword;
    
    setUser((prev) => {
      const updated = {
        ...prev,
        nickname,
        avatar,
        isAdmin,
        adminPassword: isAdmin ? adminPassword : null,
      };
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
