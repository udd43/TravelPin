import { useState, useEffect, useCallback, useRef } from 'react';

export function useGeolocation(enabled = true) {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [permissionState, setPermissionState] = useState('prompt'); // prompt | granted | denied
  const watchIdRef = useRef(null);

  // 권한 상태 체크
  useEffect(() => {
    if (!navigator.permissions) return;
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      setPermissionState(result.state);
      result.onchange = () => setPermissionState(result.state);
    });
  }, []);

  // 위치 추적 시작
  useEffect(() => {
    if (!enabled || !navigator.geolocation) {
      setError('이 브라우저에서는 위치 서비스를 지원하지 않습니다.');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000,
    };

    // 초기 위치 한 번 가져오기
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        });
        setPermissionState('granted');
      },
      (err) => {
        handleError(err);
      },
      options
    );

    // 실시간 위치 추적
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        });
        setPermissionState('granted');
      },
      (err) => {
        handleError(err);
      },
      options
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [enabled]);

  function handleError(err) {
    switch (err.code) {
      case err.PERMISSION_DENIED:
        setError('위치 접근 권한이 거부되었습니다.');
        setPermissionState('denied');
        break;
      case err.POSITION_UNAVAILABLE:
        setError('위치 정보를 사용할 수 없습니다.');
        break;
      case err.TIMEOUT:
        setError('위치 요청 시간이 초과되었습니다.');
        break;
      default:
        setError('알 수 없는 위치 오류가 발생했습니다.');
    }
  }

  const requestPermission = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        });
        setPermissionState('granted');
        setError(null);
      },
      (err) => handleError(err),
      { enableHighAccuracy: true }
    );
  }, []);

  return { position, error, permissionState, requestPermission };
}
