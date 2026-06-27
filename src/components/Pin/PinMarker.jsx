import { OverlayView } from '@react-google-maps/api';

export default function PinMarker({ pin, onClick }) {
  if (!pin.lat || !pin.lng) return null;

  const position = { lat: pin.lat, lng: pin.lng };

  return (
    <OverlayView
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={() => ({ x: -22, y: -50 })}
    >
      <div className="pin-marker" onClick={() => onClick?.(pin)}>
        <img
          className="pin-marker-thumb"
          src={pin.photoUrl}
          alt={pin.comment || '사진 핀'}
          loading="lazy"
        />
        <div className="pin-marker-tail" />
      </div>
    </OverlayView>
  );
}
