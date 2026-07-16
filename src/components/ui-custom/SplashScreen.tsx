import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// TODO: Update these paths to match your project's architecture
import logo from '/assets/logo.png'; 
import { authService } from '/services/authService'; // Adjust path to your auth service

export const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const [statusText, setStatusText] = useState('Preparing your experience');

  useEffect(() => {
    const initializeApp = async () => {
      // 1. Enforce a minimum display time (e.g., 2.5s) to guarantee high-quality UX transition
      const minimumDelay = new Promise((resolve) => setTimeout(resolve, 2500));

      // 2. Perform the authentication check routine
      const authCheck = async () => {
        const token = sessionStorage.getItem('token');

        if (!token) {
          navigate('/login', { replace: true });
          return;
        }

        try {
          setStatusText('Authenticating secure session');
          
          // Validate token with your existing auth service
          const isValid = await authService.validateToken(token);

          if (isValid) {
            navigate('/dashboard', { replace: true });
          } else {
            // Explicitly clear expired session data
            sessionStorage.removeItem('token');
            navigate('/login', { replace: true });
          }
        } catch (error) {
          console.error('Authentication validation failed:', error);
          sessionStorage.removeItem('token');
          navigate('/login', { replace: true });
        }
      };

      // Run both in parallel to prevent delaying the user longer than necessary
      await Promise.all([authCheck(), minimumDelay]);
    };

    initializeApp();
  }, [navigate]);

  return (
    <div className="relative flex flex-col items-center justify-between min-h-screen w-full bg-blue-600 text-white overflow-hidden select-none px-6 py-12">
      {/* Tailwind performance injection:
        This styled block contains hardware-accelerated keyframe animations
        to keep animations completely smooth (60 FPS) on mobile chips.
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

      {/* Spacer to push content down cleanly */}
      <div className="h-10" />

      {/* Main Brand Assembly */}
      <div className="flex flex-col items-center justify-center flex-1 animate-fade-in-scale">
        {/* White circular logo container to prevent blue-on-blue clashes */}
        <div className="w-28 h-28 flex items-center justify-center bg-white rounded-full shadow-xl shadow-blue-900/30 mb-6 p-4">
          <img 
            src={logo} 
            alt="BlueSea Mobile Logo" 
            className="w-full h-full object-contain pointer-events-none"
          />
        </div>

        {/* Brand Typography */}
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-center text-white">
          BlueSea Mobile
        </h1>
        <p className="text-sm font-medium text-white/75 text-center tracking-wide">
          Trusted Way to Stay Connected
        </p>
      </div>

      {/* Footer Loader (River flow dots) */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-1.5 text-white/80 font-medium text-xs tracking-wider uppercase">
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
