import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineXMark } from 'react-icons/hi2';

export default function InviteModal({ isOpen, onClose, roomId }) {
  const [copied, setCopied] = useState(false);
  const inviteLink = `${window.location.origin}/room/${roomId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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
          title: 'TravelPin',
          text: 'JOIN MY TRIP',
          url: inviteLink,
        });
      } catch (err) {
        if (err.name !== 'AbortError') handleCopy();
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
            className="modal-content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={onClose} id="invite-close-btn">
              <HiOutlineXMark />
            </button>

            <h2>INVITE</h2>
            <p>아래 링크를 공유하면 친구들이 바로 참여할 수 있습니다</p>

            <div className="invite-link-box">
              <input
                id="invite-link-input"
                value={inviteLink}
                readOnly
                onClick={(e) => e.target.select()}
              />
            </div>

            {copied && (
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--caption)',
                color: 'var(--success)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '16px',
              }}>
                [ COPIED ]
              </p>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary btn-full" onClick={handleCopy} id="invite-copy-btn">
                COPY LINK
              </button>
              <button className="btn btn-primary btn-full" onClick={handleShare} id="invite-share-btn">
                SHARE
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
