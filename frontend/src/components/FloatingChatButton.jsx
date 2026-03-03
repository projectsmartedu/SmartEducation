import React from 'react';
import { createPortal } from 'react-dom';
import { MessageSquare } from 'lucide-react';

const FloatingChatButton = ({ onActivate, label = 'Toggle chat', className = '' }) => {
  const handlePointerDown = (e) => {
    // Prefer pointer events to avoid synthetic click cancelation by overlays
    if (typeof onActivate === 'function') onActivate(e);
  };

  const node = (typeof document !== 'undefined') ? document.body : null;
  const btn = (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 99999 }}>
      <button
        onPointerDown={handlePointerDown}
        aria-label={label}
        className={`h-12 w-12 rounded-full bg-[#4338ca] text-white flex items-center justify-center shadow-lg hover:scale-105 transition transform ${className}`}
        style={{ pointerEvents: 'auto', touchAction: 'manipulation' }}
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    </div>
  );

  if (!node) return btn;
  return createPortal(btn, node);
};

export default FloatingChatButton;
