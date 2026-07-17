import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext'; // Safely using your actual auth context
import logo from './logo.png'; // Fixed: Changed 'logoImg' to 'logo' to match usage below

export const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [statusText, setStatusText] = useState('Preparing your experience');

  useEffect(() => {
    let active = true;

    // Parallel execution block
    const handleAuthTransition = async () => {
      const token = sessionStorage.getItem('token');

      // 1. Instant exit route if no session token exists
      if (!token) {
        // Clear any residual state and exit immediately to login
        sessionStorage.removeItem('token');
        if (active) navigate('/login', { replace: true });
        return;
      }

      // 2. Guarantee a premium 2.5-second minimum display time for splash animations
      const minimumDelay = new Promise((resolve) => setTimeout(resolve, 3000));

      // 3. Wait for your real AuthContext to finish validating the token
      const authValidation = new Promise<boolean>((resolve) => {
        const interval = setInterval(() => {
          if (!loading) {
            clearInterval(interval);
            resolve(isAuthenticated);
          }
        }, 100);
      });

      // Update status text mid-way through checking
      setTimeout(() => {
        if (active && token) {
          setStatusText('Authenticating secure session');
        }
      }, 3000);

      // Wait for both conditions (minimum transition time + real auth response)
      const [resolvedAuth] = await Promise.all([authValidation, minimumDelay]);

      if (!active) return;

      if (resolvedAuth) {
        navigate('/dashboard', { replace: true });
      } else {
        // Clear expired or invalidated session token cleanly
        sessionStorage.removeItem('token');
        navigate('/login', { replace: true });
      }
    };

    handleAuthTransition();

    return () => {
      active = false;
    };
  }, [loading, isAuthenticated, navigate]);

  return (
    <div className="relative flex flex-col items-center justify-between min-h-screen w-full bg-sky-600 text-white overflow-hidden select-none px-6 py-12">
      {/* 
        Tailwind performance injection:
        This contains custom hardware-accelerated keyframe animations
        to keep animations completely smooth (60 FPS) on mobile devices.
      */}
      <style>{`
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes riverFlow {
          0%, 100% {
            transform: translateY(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-5px);
            opacity: 1;
          }
        }
        .animate-fade-in-scale {
          animation: fadeInScale 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-dot-1 {
          animation: riverFlow 1.4s ease-in-out infinite;
          animation-delay: 0s;
        }
        .animate-dot-2 {
          animation: riverFlow 1.4s ease-in-out infinite;
          animation-delay: 0.2s;
        }
        .animate-dot-3 {
          animation: riverFlow 1.4s ease-in-out infinite;
          animation-delay: 0.4s;
        }
      `}</style>

      {/* Top spacer to balance the layout vertically */}
      <div className="h-10" />

      {/* Main Brand Assembly */}
      <div className="flex flex-col items-center justify-center flex-1 animate-fade-in-scale">
        {/* Clean white circular container with shadow to ensure high visibility against the brand background */}
        <div className="w-28 h-28 flex items-center justify-center bg-white rounded-full shadow-xl shadow-sky-900/30 mb-6 p-4">
          <img 
            src={logo} 
            alt="BlueSea Mobile Logo" 
            className="w-full h-full object-contain pointer-events-none"
            onError={(e) => {
              // Fallback placeholder in case there are asset pipeline matching issues
              e.currentTarget.style.display = 'none';
              const fallback = document.getElementById('logo-fallback');
              if (fallback) fallback.classList.remove('hidden');
            }}
          />
          {/* SVG Fallback markup so your builds never look broken */}
          <div id="logo-fallback" className="hidden flex flex-col items-center justify-center text-sky-600 font-black text-2xl">
            BS
          </div>
        </div>

        {/* Brand Typography */}
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-center text-white">
          BlueSea Mobile
        </h1>
        <p className="text-sm font-medium text-white/75 text-center tracking-wide">
          Trusted Way to Stay Connected
        </p>
      </div>

      {/* Bottom Loading Progress Container */}
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
