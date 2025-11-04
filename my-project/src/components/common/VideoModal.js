import React, { useEffect, useRef, useCallback } from 'react';

// Simple modal to show an embedded video src (YouTube) using iframe
const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.85)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000,
  color: '#fff',
};

const contentStyle = {
  width: '90%',
  maxWidth: '900px',
  background: '#000',
  borderRadius: '8px',
  overflow: 'hidden',
  position: 'relative',
  color: '#fff',
};

const closeBtnStyle = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  background: 'rgba(0,0,0,0.6)',
  border: '2px solid rgba(255,255,255,0.12)',
  color: '#fff',
  padding: '8px 12px',
  borderRadius: '999px',
  cursor: 'pointer',
  fontSize: '18px',
  lineHeight: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

function toEmbedUrl(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.slice(1);
      return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}?autoplay=1`;
      // sometimes links are already embed or /embed/ID
      if (u.pathname.includes('/embed/')) return url;
    }
  } catch (e) {
    // Fall through
  }
  return url;
}

const VideoModal = ({ src, onClose }) => {
  // Hooks must be called unconditionally and in the same order
  const iframeRef = useRef(null);
  const closeBtnRef = useRef(null);

  const handleClose = useCallback(() => {
    // Try to stop playback immediately by clearing iframe src
    try {
      if (iframeRef.current && iframeRef.current.src) {
        iframeRef.current.src = '';
      }
    } catch (e) {
      // ignore
    }
    if (typeof onClose === 'function') onClose();
  }, [onClose]);

  useEffect(() => {
    if (!src) return undefined;
    // Focus close button for accessibility
    if (closeBtnRef.current) closeBtnRef.current.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [src, handleClose]);

  if (!src) return null;

  const embed = toEmbedUrl(src);

  return (
    <div style={overlayStyle} onClick={handleClose} role="dialog" aria-modal="true">
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ color: '#fff', padding: '1rem', textAlign: 'center', fontWeight: 500 }}>
          {src.includes('youtube.com') || src.includes('youtu.be') ? 'YouTube Video' : 'Video'}
        </div>
        <button
          ref={closeBtnRef}
          style={closeBtnStyle}
          onClick={handleClose}
          aria-label="Close video"
        >
          ✕
        </button>
        <div style={{position: 'relative', paddingTop: '56.25%'}}>
          <iframe
            ref={iframeRef}
            title="video-player"
            src={embed}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
