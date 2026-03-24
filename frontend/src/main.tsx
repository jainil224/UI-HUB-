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

const renderApp = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
    
    const response = await fetch(`${getApiBaseUrl()}/api/v1/config/firebase`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const config = await response.json();
    initFirebase(config);
  } catch (error) {
    console.warn('Backend unreachable, using fallback Firebase config:', error);
    initFirebase(FALLBACK_FIREBASE_CONFIG);
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
};

renderApp();
