import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { initializeNativeGoogleAuth, isNativeAndroid } from '@/lib/nativeGoogleAuth'

if (isNativeAndroid()) {
  initializeNativeGoogleAuth().catch(console.error);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)