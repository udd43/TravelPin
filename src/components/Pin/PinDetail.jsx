import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { getDistance, formatDistance, getBearing, bearingToDirection } from '../../utils/distance';
import { AVATARS } from '../Map/UserMarker';

export default function PinDetail({ pin, myPosition, onNavigate, onDelete, currentUid }) {
  if (!pin) return null;

  const avatarEmoji = AVATARS[parseInt(pin.avatar?.replace('avatar_', '') || '0')] || '🧑‍✈️';

  let distanceText = '';
  let directionText = '';
  if (myPosition) {
    const dist = getDistance(myPosition.lat, myPosition.lng, pin.lat, pin.lng);
    distanceText = formatDistance(dist);
    const bearing = getBearing(myPosition.lat, myPosition.lng, pin.lat, pin.lng);
    directionText = `${bearingToDirection(bearing)}`;
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
        alt={pin.comment || 'PIN'}
      />

      <div className="pin-detail-info">
        <div className="avatar">{avatarEmoji}</div>
        <div className="pin-detail-meta">
          <div className="pin-detail-nickname">{pin.nickname}</div>
          <div className="pin-detail-time">{createdAt}</div>
        </div>
        {canDelete && (
          <button
            className="btn btn-destructive"
            onClick={() => onDelete?.(pin.pinId)}
            style={{ padding: '8px 16px', minHeight: 'unset' }}
          >
            DELETE
          </button>
        )}
      </div>

      {pin.comment && (
        <p className="pin-detail-comment">{pin.comment}</p>
      )}

      {myPosition && (
        <div className="pin-detail-distance">
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
        NAVIGATE →
      </button>
    </div>
  );
}
