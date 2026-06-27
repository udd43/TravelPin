/**
 * Haversine formula: 두 GPS 좌표 사이의 거리(km) 계산
 */
export function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // 지구 반지름 (km)
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * 거리를 사람이 읽기 좋은 문자열로 포맷
 */
export function formatDistance(km) {
  if (km < 0.01) return '10m 이내';
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

/**
 * 방위각(bearing) 계산 — 현재 위치에서 목적지의 방향 (0~360°)
 */
export function getBearing(lat1, lng1, lat2, lng2) {
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
  let brng = Math.atan2(y, x);
  brng = ((brng * 180) / Math.PI + 360) % 360;
  return brng;
}

/**
 * 방위각을 16방위 이름으로 변환
 */
export function bearingToDirection(bearing) {
  const dirs = ['북', '북북동', '북동', '동북동', '동', '동남동', '남동', '남남동',
                '남', '남남서', '남서', '서남서', '서', '서북서', '북서', '북북서'];
  const idx = Math.round(bearing / 22.5) % 16;
  return dirs[idx];
}
