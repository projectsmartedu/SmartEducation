import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register Service Worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration.scope);
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    } else {
      // In development: unregister any previously registered service workers
      // and clear caches to avoid dev-time full-page reloads caused by SW lifecycle.
      try {
        navigator.serviceWorker.getRegistrations().then((regs) => {
          regs.forEach((r) => r.unregister());
        });
      } catch (_) {}

      try {
        if (window.caches && window.caches.keys) {
          window.caches.keys().then((keys) => Promise.all(keys.map((k) => window.caches.delete(k))));
        }
      } catch (_) {}
    }
  });
}
