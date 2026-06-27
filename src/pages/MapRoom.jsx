import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { motion } from 'framer-motion';
import {
  HiOutlineUserPlus,
  HiOutlineCamera,
  HiOutlineMapPin,
  HiOutlineArrowLeft,
} from 'react-icons/hi2';

import UserMarker from '../components/Map/UserMarker';
import PinMarker from '../components/Pin/PinMarker';
import PinCreator from '../components/Pin/PinCreator';
import PinDetail from '../components/Pin/PinDetail';
import ChatRoom from '../components/Chat/ChatRoom';
import BottomNav from '../components/UI/BottomNav';
import BottomSheet from '../components/UI/BottomSheet';
import InviteModal from '../components/UI/InviteModal';
import Toast from '../components/UI/Toast';

import { useGeolocation } from '../hooks/useGeolocation';
import { useMembers } from '../hooks/useMembers';
import { usePins } from '../hooks/usePins';
import { useChat } from '../hooks/useChat';
import { useRoom } from '../hooks/useRoom';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

// Nothing-style monochrome map
const darkMapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#0a0a0a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#808080' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0a0a' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#333333' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#141414' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#404040' }] },
  { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#141414' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e1e1e' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#808080' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#333333' }] },
  { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#404040' }] },
  { featureType: 'transit.line', elementType: 'geometry', stylers: [{ color: '#1e1e1e' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#333333' }] },
];

const defaultCenter = { lat: 37.5665, lng: 126.978 }; // 서울

export default function MapRoom({ user }) {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef(null);

  // Hooks
  const { position, permissionState, requestPermission } = useGeolocation(true);
  const { members, updateMyLocation } = useMembers(roomId, user?.uid);
  const { pins, createPin, deletePin } = usePins(roomId);
  const { messages, sendMessage, sendLocationMessage } = useChat(roomId);
  const { room, getRoomInfo } = useRoom();

  // State
  const [activeTab, setActiveTab] = useState('map');
  const [showInvite, setShowInvite] = useState(false);
  const [showPinCreator, setShowPinCreator] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null);
  const [toast, setToast] = useState(null);
  const [lastMsgCount, setLastMsgCount] = useState(0);

  // Google Maps Loader
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  // 방 정보 불러오기
  useEffect(() => {
    if (roomId) getRoomInfo(roomId);
  }, [roomId, getRoomInfo]);

  // 내 위치 업데이트 (5초마다)
  useEffect(() => {
    if (!position || !roomId || !user?.uid) return;
    updateMyLocation(roomId, user.uid, position.lat, position.lng, user.nickname, user.avatar);

    const interval = setInterval(() => {
      if (position) {
        updateMyLocation(roomId, user.uid, position.lat, position.lng, user.nickname, user.avatar);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [position, roomId, user?.uid, user?.nickname, user?.avatar, updateMyLocation]);

  // 읽지 않은 메시지 카운트
  const unreadCount = showChat ? 0 : Math.max(0, messages.length - lastMsgCount);
  useEffect(() => {
    if (showChat) setLastMsgCount(messages.length);
  }, [showChat, messages.length]);

  // 새 메시지 토스트 알림
  const previousMessagesLength = useRef(messages.length);
  useEffect(() => {
    if (messages.length > previousMessagesLength.current) {
      if (!showChat && messages.length > 0) {
        const latestMsg = messages[messages.length - 1];
        if (latestMsg.userId !== user?.uid) {
          setToast({ message: `💬 ${latestMsg.nickname}: ${latestMsg.text}`, type: 'success' });
        }
      }
    }
    previousMessagesLength.current = messages.length;
  }, [messages, showChat, user?.uid]);

  // 최근 방문한 방 기록 저장
  useEffect(() => {
    if (room && roomId) {
      try {
        const recent = JSON.parse(localStorage.getItem('travelpin_recent_rooms') || '[]');
        const newRecent = [
          { id: roomId, name: room.name, lastVisited: Date.now() },
          ...recent.filter(r => r.id !== roomId)
        ].slice(0, 5); // 최근 5개 유지
        localStorage.setItem('travelpin_recent_rooms', JSON.stringify(newRecent));
      } catch (e) {
        console.error('Failed to save recent room', e);
      }
    }
  }, [room, roomId]);

  // Map callbacks
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const centerOnMe = useCallback(() => {
    if (mapRef.current && position) {
      mapRef.current.panTo({ lat: position.lat, lng: position.lng });
      mapRef.current.setZoom(16);
    }
  }, [position]);

  // Tab 변경
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'chat') {
      setShowChat(true);
    } else if (tab === 'pin') {
      setShowPinCreator(true);
    } else {
      setShowChat(false);
      setShowPinCreator(false);
    }
  };

  // 핀 생성
  const handleCreatePin = async (lat, lng, photoFile, comment) => {
    const success = await createPin(roomId, user, lat, lng, photoFile, comment);
    if (success) {
      setToast({ message: '📌 핀이 등록되었어요!', type: 'success' });
    }
    return success;
  };

  // 핀 삭제
  const handleDeletePin = async (pinId) => {
    const pin = pins.find(p => p.pinId === pinId);
    if (!pin) return;
    const success = await deletePin(roomId, pinId, user.uid, pin.userId);
    if (success) {
      setSelectedPin(null);
      setToast({ message: '핀이 삭제되었어요.', type: 'success' });
    }
  };

  // 핀 찾아가기 (Google Maps 링크)
  const handleNavigateToPin = (pin) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${pin.lat},${pin.lng}`;
    window.open(url, '_blank');
  };

  // 채팅 메시지 전송
  const handleSendMessage = (text) => {
    sendMessage(roomId, user, text);
  };

  // 위치 공유 메시지
  const handleSendLocation = () => {
    if (position) {
      sendLocationMessage(roomId, user, position.lat, position.lng);
    }
  };

  // 위치 권한 필요
  if (permissionState === 'denied') {
    return (
      <div className="permission-screen">
        <div className="permission-icon">📍</div>
        <h2>위치 접근 권한이 필요해요</h2>
        <p>
          TravelPin은 친구들과 실시간 위치를 공유하기 위해
          위치 접근 권한이 필요합니다.
          브라우저 설정에서 위치 권한을 허용해주세요.
        </p>
        <button className="btn btn-primary btn-lg" onClick={requestPermission}>
          권한 허용하기
        </button>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="permission-screen">
        <div className="permission-icon">⚠️</div>
        <h2>지도를 불러올 수 없어요</h2>
        <p>Google Maps를 로드하는 데 실패했습니다. 네트워크 연결을 확인해주세요.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <div className="loading-text">LOADING MAP</div>
      </div>
    );
  }

  const mapCenter = position
    ? { lat: position.lat, lng: position.lng }
    : defaultCenter;

  const onlineMembers = members.filter(m => m.online);

  return (
    <div className="map-room" id="map-room">
      {/* Header */}
      <div className="map-header">
        <div className="map-header-left" style={{ alignItems: 'center' }}>
          <button
            className="map-header-btn"
            onClick={() => navigate('/')}
            title="HOME"
            id="home-btn"
            style={{ width: 36, height: 36, fontSize: '1rem' }}
          >
            <HiOutlineArrowLeft />
          </button>
          <span className="map-room-name">{room?.name || 'ROOM'}</span>
        </div>
        <div className="map-header-right">
          <button
            className="map-header-btn"
            onClick={() => setShowInvite(true)}
            title="INVITE"
            id="invite-btn"
          >
            <HiOutlineUserPlus />
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="map-wrapper">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={15}
          onLoad={onMapLoad}
          options={{
            styles: darkMapStyles,
            disableDefaultUI: true,
            zoomControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            gestureHandling: 'greedy',
          }}
        >
          {/* 멤버 마커 */}
          {members.map((member) => (
            <UserMarker
              key={member.uid}
              user={member}
              isMe={member.uid === user?.uid}
            />
          ))}

          {/* 핀 마커 */}
          {pins.map((pin) => (
            <PinMarker
              key={pin.pinId}
              pin={pin}
              onClick={(p) => setSelectedPin(p)}
            />
          ))}
        </GoogleMap>

        {/* FAB Buttons */}
        <div style={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 5 }}>
          <button
            className="map-header-btn"
            onClick={() => setShowPinCreator(true)}
            title="PIN"
            id="fab-pin"
          >
            <HiOutlineCamera />
          </button>
          <button
            className="map-header-btn"
            onClick={centerOnMe}
            title="CENTER"
            id="fab-center"
          >
            <HiOutlineMapPin />
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        unreadCount={unreadCount}
      />

      {/* Pin Creator */}
      <PinCreator
        isOpen={showPinCreator}
        onClose={() => { setShowPinCreator(false); setActiveTab('map'); }}
        onCreate={handleCreatePin}
        position={position}
      />

      {/* Pin Detail Bottom Sheet */}
      <BottomSheet
        isOpen={!!selectedPin}
        onClose={() => setSelectedPin(null)}
        title="PIN DETAIL"
      >
        <PinDetail
          pin={selectedPin}
          myPosition={position}
          onNavigate={handleNavigateToPin}
          onDelete={handleDeletePin}
          currentUid={user?.uid}
        />
      </BottomSheet>

      {/* Chat */}
      <ChatRoom
        isOpen={showChat}
        onClose={() => { setShowChat(false); setActiveTab('map'); }}
        messages={messages}
        onSendMessage={handleSendMessage}
        onSendLocation={handleSendLocation}
        currentUid={user?.uid}
        roomName={room?.name}
      />

      {/* Invite Modal */}
      <InviteModal
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        roomId={roomId}
      />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
