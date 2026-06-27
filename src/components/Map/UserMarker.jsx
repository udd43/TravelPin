import { OverlayView } from '@react-google-maps/api';

const AVATARS = ['🧑‍✈️', '🧗', '🏄', '🚴', '🧑‍🎤', '🦸', '🧑‍🚀', '🧜'];

export default function UserMarker({ user, isMe = false }) {
  if (!user.lat || !user.lng) return null;

  const position = { lat: user.lat, lng: user.lng };
  const avatarEmoji = AVATARS[parseInt(user.avatar?.replace('avatar_', '') || '0')] || '🧑‍✈️';

  return (
    <OverlayView
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={() => ({ x: -20, y: -20 })}
    >
      <div className="map-marker" title={user.nickname}>
        <div
          className={`map-marker-avatar ${!user.online ? 'offline' : ''}`}
          style={isMe ? {
            borderColor: '#FFFFFF',
            borderWidth: '2px',
          } : undefined}
        >
          {avatarEmoji}
        </div>
        <div className="map-marker-label">
          {isMe ? 'ME' : user.nickname}
        </div>
      </div>
    </OverlayView>
  );
}

export { AVATARS };
