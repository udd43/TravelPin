import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineXMark, HiOutlinePaperAirplane, HiOutlineMapPin } from 'react-icons/hi2';
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
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
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
        <ChatMessage key={msg.msgId} msg={msg} isMe={msg.userId === currentUid} />
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
            <button className="btn btn-ghost btn-icon" onClick={onClose} id="chat-close-btn">
              <HiOutlineXMark />
            </button>
            <h2>[ CHAT ] {roomName || ''}</h2>
          </div>

          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-text">
                  NO MESSAGES YET<br />
                  첫 메시지를 보내보세요
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
              onClick={() => onSendLocation?.()}
              id="chat-location-btn"
              title="위치 공유"
              style={{ color: 'var(--accent)' }}
            >
              <HiOutlineMapPin />
            </button>
            <input
              ref={inputRef}
              className="chat-input"
              placeholder="MESSAGE..."
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
