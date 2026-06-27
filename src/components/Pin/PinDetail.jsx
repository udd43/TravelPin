import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { getDistance, formatDistance, getBearing, bearingToDirection } from '../../utils/distance';
import { AVATARS } from '../Map/UserMarker';
import { HiOutlineMapPin, HiOutlineTrash } from 'react-icons/hi2';

export default function PinDetail({ pin, myPosition, onNavigate, onDelete, currentUid }) {
  if (!pin) return null;

  const avatarEmoji = AVATARS[parseInt(pin.avatar?.replace('avatar_', '') || '0')] || '🧑‍✈️';

  let distanceText = '';
  let directionText = '';
  if (myPosition) {
    const dist = getDistance(myPosition.lat, myPosition.lng, pin.lat, pin.lng);
    distanceText = formatDistance(dist);
    const bearing = getBearing(myPosition.lat, myPosition.lng, pin.lat, pin.lng);
    directionText = `${bearingToDirection(bearing)} 방향`;
  }

  const createdAt = pin.createdAt
    ? format(new Date(pin.createdAt), 'M월 d일 a h:mm', { locale: ko })
    : '';

  const canDelete = currentUid === pin.userId;

  return (
    <div className="animate-fade-in">
      <img
        className="pin-detail-photo"
        src={pin.photoUrl}
        alt={pin.comment || '사진 핀'}
      />

      <div className="pin-detail-info">
        <div className="avatar">
          {avatarEmoji}
        </div>
        <div className="pin-detail-meta">
          <div className="pin-detail-nickname">{pin.nickname}</div>
          <div className="pin-detail-time">{createdAt}</div>
        </div>
        {canDelete && (
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => onDelete?.(pin.pinId)}
            style={{ color: 'var(--color-error)' }}
            title="핀 삭제"
          >
            <HiOutlineTrash />
          </button>
        )}
      </div>

      {pin.comment && (
        <p className="pin-detail-comment">{pin.comment}</p>
      )}

      {myPosition && (
        <div className="pin-detail-distance">
          <HiOutlineMapPin style={{ fontSize: '1.5rem', color: 'var(--color-accent)', flexShrink: 0 }} />
          <div>
            <div className="pin-detail-distance-value">{distanceText}</div>
            <div className="pin-detail-distance-dir">{directionText}</div>
          </div>
        </div>
      )}

      <button
        className="btn btn-primary btn-full btn-lg"
        onClick={() => onNavigate?.(pin)}
        id="pin-navigate-btn"
      >
        <HiOutlineMapPin />
        찾아가기
      </button>
    </div>
  );
}
