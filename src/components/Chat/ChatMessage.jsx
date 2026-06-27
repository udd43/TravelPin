import { format, isToday, isYesterday } from 'date-fns';
import { ko } from 'date-fns/locale';
import { AVATARS } from '../Map/UserMarker';
import { HiOutlineMapPin } from 'react-icons/hi2';

export default function ChatMessage({ msg, isMe, onLocationClick }) {
  const avatarEmoji = AVATARS[parseInt(msg.avatar?.replace('avatar_', '') || '0')] || '🧑‍✈️';
  const time = msg.createdAt ? formatTime(msg.createdAt) : '';

  return (
    <div className={`chat-message ${isMe ? 'chat-message-mine' : ''}`}>
      {!isMe && (
        <div className="avatar avatar-sm">
          {avatarEmoji}
        </div>
      )}
      <div>
        <div className={`chat-bubble ${isMe ? 'chat-bubble-mine' : 'chat-bubble-other'}`}>
          {!isMe && (
            <div className="chat-bubble-nickname">{msg.nickname}</div>
          )}

          {msg.type === 'photo' ? (
            <div className="chat-bubble-photo">
              <img src={msg.text} alt="공유된 사진" loading="lazy" />
            </div>
          ) : msg.type === 'location' ? (
            <div
              className="chat-bubble-location"
              onClick={() => onLocationClick?.(msg.lat, msg.lng)}
            >
              <HiOutlineMapPin />
              <span>{msg.text}</span>
            </div>
          ) : (
            <span>{msg.text}</span>
          )}

          <div className="chat-bubble-time">{time}</div>
        </div>
      </div>
    </div>
  );
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return format(date, 'a h:mm', { locale: ko });
}

export function formatDateDivider(timestamp) {
  const date = new Date(timestamp);
  if (isToday(date)) return '오늘';
  if (isYesterday(date)) return '어제';
  return format(date, 'M월 d일 (EEEE)', { locale: ko });
}
