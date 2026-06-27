import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineXMark,
  HiOutlinePaperAirplane,
  HiOutlineMapPin,
  HiOutlinePhoto,
} from 'react-icons/hi2';
import ChatMessage, { formatDateDivider } from './ChatMessage';
import { isSameDay } from 'date-fns';

export default function ChatRoom({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  onSendLocation,
  currentUid,
  roomName,
}) {
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = () => {
    if (!text.trim()) return;
    onSendMessage(text.trim());
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLocationShare = () => {
    onSendLocation?.();
  };

  // 날짜 구분선 처리
  const renderMessages = () => {
    const result = [];
    let lastDate = null;

    messages.forEach((msg, index) => {
      const msgDate = new Date(msg.createdAt);
      if (!lastDate || !isSameDay(lastDate, msgDate)) {
        result.push(
          <div key={`date-${index}`} className="chat-date-divider">
            {formatDateDivider(msg.createdAt)}
          </div>
        );
        lastDate = msgDate;
      }
      result.push(
        <ChatMessage
          key={msg.msgId}
          msg={msg}
          isMe={msg.userId === currentUid}
        />
      );
    });

    return result;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="chat-container"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          <div className="chat-header">
            <button
              className="btn btn-ghost btn-icon"
              onClick={onClose}
              id="chat-close-btn"
            >
              <HiOutlineXMark />
            </button>
            <h2>💬 {roomName || '그룹 채팅'}</h2>
          </div>

          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">💬</div>
                <div className="empty-state-text">
                  아직 메시지가 없어요.<br />
                  첫 메시지를 보내보세요!
                </div>
              </div>
            ) : (
              renderMessages()
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <button
              className="btn btn-ghost btn-icon"
              onClick={handleLocationShare}
              id="chat-location-btn"
              title="내 위치 공유"
              style={{ fontSize: '1.1rem', color: 'var(--color-accent)' }}
            >
              <HiOutlineMapPin />
            </button>
            <input
              ref={inputRef}
              className="chat-input"
              placeholder="메시지를 입력하세요..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              id="chat-input"
            />
            <button
              className="chat-send-btn"
              onClick={handleSend}
              disabled={!text.trim()}
              id="chat-send-btn"
            >
              <HiOutlinePaperAirplane />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
