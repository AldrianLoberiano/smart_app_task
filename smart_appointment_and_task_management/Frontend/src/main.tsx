import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import * as serviceWorkerRegistration from './utils/serviceWorkerRegistration'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Register service worker for push notifications
serviceWorkerRegistration.register({
  onSuccess: (registration) => {
    console.log('Service Worker registered successfully:', registration);
  },
  onUpdate: (registration) => {
    console.log('Service Worker updated:', registration);
    // Optionally notify user about update
  },
  onError: (error) => {
    console.error('Service Worker registration failed:', error);
  }
});
