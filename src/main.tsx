import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AuthProvider } from './context/AuthContext';
import { PortalProvider } from './context/PortalContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <PortalProvider>
        <App />
      </PortalProvider>
    </AuthProvider>
  </React.StrictMode>
);

