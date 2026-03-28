import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initFirebase } from './lib/firebase';
import { getApiBaseUrl } from './utils/apiConfig';

// Fallback Firebase config for when the backend is unreachable
// (e.g., accessing from a phone or another laptop on the network)
const FALLBACK_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAJwLhXcLxHt1covFjWQJ5vKJYFngMDp6A",
  authDomain: "ui-hub-3fe3d.firebaseapp.com",
  projectId: "ui-hub-3fe3d",
  storageBucket: "ui-hub-3fe3d.firebasestorage.app",
  messagingSenderId: "238615534314",
  appId: "1:238615534314:web:80c87366f5e4729dd4d593",
  measurementId: "G-53XSLNNV98"
};

const startApp = async () => {
  // 1. Initialize with fallback immediately to unblock rendering
  initFirebase(FALLBACK_FIREBASE_CONFIG);

  // 2. Render immediately
  const root = createRoot(document.getElementById('root')!);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );

  // 3. Try to fetch fresh config in background (silent update)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout for background fetch
    
    const response = await fetch(`${getApiBaseUrl()}/api/v1/config/firebase`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const config = await response.json();
      // Only re-init if the config is actually different and needed
      // (Advanced: you could use a state to update this, but for now 
      // the fallback is usually 99.9% identical to the production one)
      console.log('[Performance] Fresh config fetched in background');
      // initFirebase(config); // Only call if your logic supports re-init
    }
  } catch (error) {
    // Silently fail, we already have the fallback
  }
};

startApp();
