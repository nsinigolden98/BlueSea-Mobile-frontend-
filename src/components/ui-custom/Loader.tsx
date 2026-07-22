import { useState, useCallback } from 'react';

function SharedLoaderUI() {
  return (
    <>
      <div className="loader-screen" id="loader">
        <div className="loader-container">
          {/* LAYER 3: ECHO WAVE */}
          <div className="loader-echo-wave" />

          {/* LAYER 2: ROTATING RING */}
          <div className="loader-ring" />

          {/* LAYER 1: CENTER LOGO */}
          <div
            className="loader-logo-wrapper"
            style={{ perspective: '1000px' }}
          >
            <div className="loader-logo">
              <span>BS</span>
            </div>

            <div className="loader-logo-edge" />
          </div>
        </div>
      </div>

      <style>{`
        #loader,
        .loader-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: transparent;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          pointer-events: none;
        }

        .loader-container {
          position: relative;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: breath 4s ease-in-out infinite;
          will-change: transform;
        }

        /* LAYER 3: ECHO WAVE */
        .loader-echo-wave {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          border: 1.5px solid rgba(56, 189, 248, 0.35);
          animation: echoWave 2.8s cubic-bezier(0, 0.2, 0.8, 1) infinite;
          pointer-events: none;
          will-change: transform, opacity;
        }

        /* LAYER 2: ROTATING RING */
        .loader-ring {
          position: absolute;
          inset: -6px;
          border-radius: 9999px;
          border: 2px solid rgba(56, 189, 248, 0.15);
          border-top-color: #38bdf8;
          border-right-color: rgba(56, 189, 248, 0.5);
          animation: spinRing 1.2s linear infinite;
          pointer-events: none;
          will-change: transform;
        }

        /* LAYER 1: CENTER LOGO WRAPPER */
        .loader-logo-wrapper {
          position: relative;
          z-index: 1;
        }

        .loader-logo {
          width: 48px;
          height: 48px;
          border-radius: 9999px;

          background: linear-gradient(
            135deg,
            #38bdf8 0%,
            #0ea5e9 50%,
            #0284c7 100%
          );

          display: flex;
          align-items: center;
          justify-content: center;

          color: #fff;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: -0.5px;
          user-select: none;

          transform-style: preserve-3d;

          animation:
            coinFlip 2.5s ease-in-out infinite,
            glowPulse 2s ease-in-out infinite;
          will-change: transform, box-shadow;
        }

        .loader-logo-edge {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          pointer-events: none;
        }

        /* KEYFRAME ANIMATIONS */
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

        @keyframes glowPulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(14, 165, 233, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(14, 165, 233, 0.5);
          }
        }

        @keyframes spinRing {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes echoWave {
          0% {
            transform: scale(0.85);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.75);
            opacity: 0;
          }
        }

        @keyframes breath {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.04);
          }
        }
      `}</style>
    </>
  );
}

export function Loader() {
  const [LoaderData, setModalData] = useState<{ visible: boolean }>({
    visible: false,
  });

  const showLoader = useCallback(() => {
    setModalData({ visible: true });
  }, []);

  const hideLoader = useCallback(() => {
    setModalData({ visible: false });
  }, []);

  const LoaderComponent = () => {
    if (!LoaderData.visible) return null;
    return <SharedLoaderUI />;
  };

  return {
    showLoader,
    hideLoader,
    LoaderComponent,
  };
}

export function AuthLoader() {
  return <SharedLoaderUI />;
}
