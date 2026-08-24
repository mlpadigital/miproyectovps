import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '@/App';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import { Toaster } from '@/components/ui/toaster';
import '@/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <SupabaseAuthProvider>
    <BrowserRouter>
      <App />
      <Toaster />
    </BrowserRouter>
  </SupabaseAuthProvider>
);
