import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineXMark } from 'react-icons/hi2';

export default function PinCreator({ isOpen, onClose, onCreate, position }) {
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [comment, setComment] = useState('');
  const [uploading, setUploading] = useState(false);
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!photoFile || !position) return;
    setUploading(true);
    const success = await onCreate(position.lat, position.lng, photoFile, comment);
    setUploading(false);
    if (success) handleClose();
  };

  const handleClose = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setComment('');
    setUploading(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="pin-creator-overlay"
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          <div className="pin-creator-header">
            <button className="btn btn-ghost" onClick={handleClose} id="pin-creator-close">
              <HiOutlineXMark style={{ fontSize: '1.25rem' }} />
            </button>
            <h2>CREATE PIN</h2>
            <div style={{ width: 40 }} />
          </div>

          <div className="pin-creator-body">
            <div className="pin-creator-preview">
              {photoPreview ? (
                <motion.img
                  src={photoPreview}
                  alt="Preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
              ) : (
                <div className="pin-creator-placeholder">
                  <span className="icon">📸</span>
                  <span>SELECT PHOTO</span>
                </div>
              )}
            </div>

            <div className="pin-creator-actions">
              <input
                ref={cameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="camera-input"
              />
              <input
                ref={galleryRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="gallery-input"
              />
              <button
                className="btn btn-secondary"
                onClick={() => cameraRef.current?.click()}
                style={{ flex: 1 }}
                id="pin-camera-btn"
              >
                CAMERA
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => galleryRef.current?.click()}
                style={{ flex: 1 }}
                id="pin-gallery-btn"
              >
                GALLERY
              </button>
            </div>

            <div>
              <label className="input-label">COMMENT</label>
              <input
                className="input-field"
                placeholder="한 줄 코멘트"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={100}
                id="pin-comment-input"
              />
            </div>

            {position && (
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--label)',
                color: 'var(--text-disabled)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                LAT {position.lat.toFixed(5)} · LNG {position.lng.toFixed(5)}
              </div>
            )}
          </div>

          <div className="pin-creator-footer">
            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={handleSubmit}
              disabled={!photoFile || uploading}
              id="pin-submit-btn"
            >
              {uploading ? '[ UPLOADING... ]' : 'CREATE PIN'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
