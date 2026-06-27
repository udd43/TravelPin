import { motion, AnimatePresence } from 'framer-motion';

export default function BottomSheet({ isOpen, onClose, children, title }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="bottom-sheet-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="bottom-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="bottom-sheet-handle" onClick={onClose} />
            {title && (
              <div style={{
                padding: '0 24px 12px',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--body)',
                fontWeight: 400,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-display)',
              }}>
                {title}
              </div>
            )}
            <div className="bottom-sheet-content">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
