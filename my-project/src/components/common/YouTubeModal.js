import React from 'react';

// Small helper to convert various YouTube URLs into an embed URL
function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    const hostname = u.hostname.toLowerCase();

    // short youtu.be links
    if (hostname.includes('youtu.be')) {
      const id = u.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : null;
    }

    // full youtube.com links
    if (hostname.includes('youtube.com')) {
      const params = new URLSearchParams(u.search);
      const v = params.get('v');
      if (v) return `https://www.youtube.com/embed/${v}?autoplay=1`;

      // maybe already an embed path like /embed/VIDEOID
      const parts = u.pathname.split('/').filter(Boolean);
      const embedIdx = parts.indexOf('embed');
      if (embedIdx !== -1 && parts[embedIdx + 1]) {
        return `https://www.youtube.com/embed/${parts[embedIdx + 1]}?autoplay=1`;
      }
    }
  } catch (err) {
    // fallthrough
  }
  return null;
}

const YouTubeModal = ({ url, onClose }) => {
  if (!url) return null;
  const embed = getYouTubeEmbedUrl(url);
  if (!embed) return null;

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  };

  const containerStyle = {
    width: '90%',
    maxWidth: '900px',
    background: '#000',
    borderRadius: '8px',
    overflow: 'hidden'
  };

  const iframeStyle = {
    width: '100%',
    height: '56.25vw', // 16:9 responsive
    maxHeight: '70vh',
    border: 'none',
    display: 'block'
  };

  const closeBtnStyle = {
    position: 'absolute',
    top: 16,
    right: 20,
    background: 'transparent',
    color: '#fff',
    border: 'none',
    fontSize: '1.6rem',
    cursor: 'pointer'
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose && onClose();
  };

  return (
    <div style={overlayStyle} onClick={handleOverlayClick} aria-modal="true">
      <div style={containerStyle}>
        <button aria-label="Close video" style={closeBtnStyle} onClick={onClose}>✕</button>
        <iframe
          title="YouTube Video"
          src={embed}
          style={iframeStyle}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default YouTubeModal;
