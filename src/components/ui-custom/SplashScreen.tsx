import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext'; 
import { Capacitor } from '@capacitor/core';
import logo from './logo.png'; 

const performBiometricPrompt = async (reason: string): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const plugins = (window as any).Capacitor?.Plugins;
    if (plugins?.NativeBiometrics) {
      await plugins.NativeBiometrics.verifyIdentity({
        reason,
        title: 'Biometric Authentication',
        subtitle: reason,
        description: 'Please authenticate to continue',
      });
      return true;
    }
    if (plugins?.Biometrics) {
      await plugins.Biometrics.verify({
        reason,
        title: 'Biometric Authentication',
      });
      return true;
    }
    if (plugins?.BiometricAuth) {
      await plugins.BiometricAuth.authenticate({ reason });
      return true;
    }
    return true;
  } catch (e) {
    console.error('Biometric login prompt error:', e);
    return false;
  }
};

export const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  
  const [statusText, setStatusText] = useState('Preparing your experience');
  const [isExiting, setIsExiting] = useState(false);

  // Keep track of the live authentication states securely without triggering stale closures
  const liveAuth = useRef({ isAuthenticated, loading });
  useEffect(() => {
    liveAuth.current = { isAuthenticated, loading };
  }, [isAuthenticated, loading]);

  useEffect(() => {
    let active = true;

    // Determine target route based on environment (Native Mobile vs. Web)
    const getUnauthRoute = () => {
      return Capacitor.isNativePlatform() ? '/app-auth' : '/login';
    };

    const handlePremiumStartup = async () => {
      // Phase 1: Pure Visual Presentation Gate
      await new Promise((resolve) => setTimeout(resolve, 3000));
      
      if (!active) return;

      // Phase 2: Start Authentication Verification Flow
      setStatusText('Authenticating secure session');
      const token = sessionStorage.getItem('token');

      if (!token) {
        sessionStorage.removeItem('token');
        triggerExitTransition(getUnauthRoute());
        return;
      }

      // Phase 3: Check live state of your AuthContext
      const waitForAuthToSettle = () => {
        return new Promise<boolean>((resolve) => {
          const poll = () => {
            if (!liveAuth.current.loading) {
              resolve(liveAuth.current.isAuthenticated);
            } else {
              setTimeout(poll, 50);
            }
          };
          poll();
        });
      };

      const isSessionValid = await waitForAuthToSettle();
      if (!active) return;

      if (isSessionValid) {
        const isNative = Capacitor.isNativePlatform();
        const biometricEnabled = localStorage.getItem('biometricEnabled') === 'true';
        const biometricLoginEnabled = localStorage.getItem('biometricLoginEnabled') === 'true';

        if (isNative && biometricEnabled && biometricLoginEnabled) {
          setStatusText('Authenticating with biometrics');
          const bioSuccess = await performBiometricPrompt('Authenticate to access BlueSea Mobile');
          if (!active) return;

          if (bioSuccess) {
            triggerExitTransition('/dashboard');
          } else {
            sessionStorage.removeItem('token');
            triggerExitTransition(getUnauthRoute());
          }
        } else {
          triggerExitTransition('/dashboard');
        }
      } else {
        sessionStorage.removeItem('token');
        triggerExitTransition(getUnauthRoute());
      }
    };

    // Orchestrate the exit transition gracefully
    const triggerExitTransition = (targetRoute: string) => {
      setIsExiting(true);
      
      setTimeout(() => {
        if (active) {
          navigate(targetRoute, { replace: true });
        }
      }, 400);
    };

    handlePremiumStartup();

    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <div 
      className={`relative flex flex-col items-center justify-between min-h-screen w-full bg-sky-600 text-white overflow-hidden select-none px-6 py-12 transition-all ${
        isExiting ? 'animate-premium-exit' : ''
      }`}
    >
      <style>{`
        @keyframes fadeInScale {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeOutScale {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.96); }
        }
        @keyframes riverFlow {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(-5px); opacity: 1; }
        }
        .animate-fade-in-scale {
          animation: fadeInScale 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-premium-exit {
          animation: fadeOutScale 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        .animate-dot-1 { animation: riverFlow 1.4s ease-in-out infinite; animation-delay: 0s; }
        .animate-dot-2 { animation: riverFlow 1.4s ease-in-out infinite; animation-delay: 0.2s; }
        .animate-dot-3 { animation: riverFlow 1.4s ease-in-out infinite; animation-delay: 0.4s; }
      `}</style>

      <div className="h-10" />

      <div className="flex flex-col items-center justify-center flex-1 animate-fade-in-scale">
        <div className="w-28 h-28 flex items-center justify-center bg-white rounded-full shadow-xl shadow-sky-900/30 mb-6 p-4">
          <img 
            src={logo} 
            alt="BlueSea Mobile Logo" 
            className="w-full h-full object-contain pointer-events-none"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = document.getElementById('logo-fallback');
              if (fallback) fallback.classList.remove('hidden');
            }}
          />
          <div id="logo-fallback" className="hidden flex flex-col items-center justify-center text-sky-600 font-black text-2xl">
            BS
          </div>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-center text-white">
          BlueSea Mobile
        </h1>
        <p className="text-sm font-medium text-white/75 text-center tracking-wide">
          Trusted Way to Stay Connected
        </p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-1.5 text-white/85 font-medium text-xs tracking-wider uppercase">
          <span>{statusText}</span>
          <span className="inline-flex gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-dot-1" />
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-dot-2" />
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-dot-3" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;