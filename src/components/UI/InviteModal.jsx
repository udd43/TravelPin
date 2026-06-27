import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineLink, HiOutlineShare, HiOutlineClipboard, HiOutlineXMark, HiCheck } from 'react-icons/hi2';

export default function InviteModal({ isOpen, onClose, roomId }) {
  const [copied, setCopied] = useState(false);
  const inviteLink = `${window.location.origin}/room/${roomId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const input = document.getElementById('invite-link-input');
      if (input) {
        input.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TravelPin 여행 초대',
          text: '우리 여행에 함께해요! 🗺️',
          url: inviteLink,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      handleCopy();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-content glass-card invite-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="map-header-btn"
              onClick={onClose}
              style={{ position: 'absolute', top: 12, right: 12 }}
              id="invite-close-btn"
            >
              <HiOutlineXMark />
            </button>

            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔗</div>
            <h2>친구 초대하기</h2>
            <p>아래 링크를 공유하면 친구들이 바로 참여할 수 있어요!</p>

            <div className="invite-link-box">
              <HiOutlineLink style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
              <input
                id="invite-link-input"
                value={inviteLink}
                readOnly
                onClick={(e) => e.target.select()}
              />
              <button
                className="btn btn-ghost btn-icon"
                onClick={handleCopy}
                id="invite-copy-btn"
                style={{ fontSize: '1rem' }}
              >
                {copied ? <HiCheck style={{ color: 'var(--color-online)' }} /> : <HiOutlineClipboard />}
              </button>
            </div>

            {copied && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-online)',
                  marginBottom: '16px',
                  fontWeight: 500,
                }}
              >
                ✅ 링크가 복사되었어요!
              </motion.p>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-primary btn-full btn-lg" onClick={handleShare} id="invite-share-btn">
                <HiOutlineShare />
                공유하기
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
