import { useState, useCallback } from 'react';
import './Loader.css';

export function Loader() {
  const [LoaderData, setModalData] = useState<{ visible: boolean }>({
    visible: false,
  });

  const showLoader = useCallback(() => {
    setModalData({visible: true });
  }, []);
  const hideLoader = useCallback(() => {
    
    setModalData({visible: false });
  }, []);

  const LoaderComponent = () => {
  
    if (!LoaderData.visible) return null;
    return (
      <div className="loader-screen" id="loader">
        {/* Exact JSX Structure and Classes from LoadingSpinner (md size) */}
        <div className="relative" style={{ perspective: '1000px' }}>
          {/* Coin flip animation - flip → pause → flip */}
          <div 
            className="rounded-full bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 flex items-center justify-center font-bold text-white shadow-xl shadow-sky-500/30 coin-flip w-12 h-12 text-sm"
          >
            <span className="font-bold tracking-tight">BS</span>
          </div>
          
          {/* Coin edge effect */}
          <div 
            className="absolute inset-0 rounded-full border-2 border-white/20 w-12 h-12 text-sm"
          />
        </div>

        <div className="loading-text">Loading...</div>

        {/* Exact Keyframes and Animation Styles copied from LoadingSpinner */}
        <style>{`
          @keyframes coinFlip {
            0% {
              transform: rotateY(0deg);
            }
            25% {
              transform: rotateY(180deg);
            }
            50% {
              transform: rotateY(180deg);
            }
            75% {
              transform: rotateY(360deg);
            }
            100% {
              transform: rotateY(360deg);
            }
          }
          
          .coin-flip {
            animation: coinFlip 2.5s ease-in-out infinite;
            transform-style: preserve-3d;
          }
          
          /* Add a subtle glow pulse */
          @keyframes glowPulse {
            0%, 100% {
              box-shadow: 0 0 20px rgba(14, 165, 233, 0.3);
            }
            50% {
              box-shadow: 0 0 40px rgba(14, 165, 233, 0.5);
            }
          }
          
          .coin-flip {
            animation: coinFlip 2.5s ease-in-out infinite, glowPulse 2s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  };

  return { showLoader, hideLoader, LoaderComponent};
}

// Kept completely unchanged as per rules
export function AuthLoader() {
  return (
    <div className="loader-screen" id="loader">
      <div className="logo">B<span id='S'>S</span></div>
      <div className="loading-text">Loading...</div>
    </div>
  );
}
