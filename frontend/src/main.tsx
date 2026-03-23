import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initFirebase } from './lib/firebase';

const renderApp = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/v1/config/firebase`);
    const config = await response.json();
    initFirebase(config);
  } catch (error) {
    console.error('Failed to initialize Firebase config from backend:', error);
    // Fallback or error handling could go here
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
};

renderApp();
