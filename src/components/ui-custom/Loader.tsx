import { useState, useCallback } from 'react';

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

    return (
      <>
        <div className="loader-screen" id="loader">
          <div
            className="loader-logo-wrapper"
            style={{ perspective: '1000px' }}
          >
            <div className="loader-logo">
              <span>BS</span>
            </div>

            <div className="loader-logo-edge" />
          </div>

          <div className="loading-text">Loading...</div>
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
            gap: 20px;
            z-index: 9999;
          }

          .loader-logo-wrapper {
            position: relative;
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
          }

          .loader-logo-edge {
            position: absolute;
            inset: 0;
            border-radius: 9999px;
            border: 2px solid rgba(255,255,255,0.2);
            pointer-events: none;
          }

          .loading-text {
            color: #4CCBFF;
            font-size: 30px;
            animation: fade 1.5s infinite;
          }

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
            0%,100% {
              box-shadow: 0 0 20px rgba(14,165,233,.3);
            }
            50% {
              box-shadow: 0 0 40px rgba(14,165,233,.5);
            }
          }

          @keyframes fade {
            0% {
              opacity: 0;
            }
            50% {
              opacity: 1;
            }
            100% {
              opacity: 0;
            }
          }
        `}</style>
      </>
    );
  };

  return {
    showLoader,
    hideLoader,
    LoaderComponent,
  };
}

export function AuthLoader() {
  return (
    <>
      <div className="loader-screen" id="loader">
        <div
          className="loader-logo-wrapper"
          style={{ perspective: '1000px' }}
        >
          <div className="loader-logo">
            <span>BS</span>
          </div>

          <div className="loader-logo-edge" />
        </div>

        <div className="loading-text">Loading...</div>
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
          gap: 20px;
          z-index: 9999;
        }

        .loader-logo-wrapper {
          position: relative;
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
        }

        .loader-logo-edge {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          border: 2px solid rgba(255,255,255,0.2);
          pointer-events: none;
        }

        .loading-text {
          color: #4CCBFF;
          font-size: 30px;
          animation: fade 1.5s infinite;
        }

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
          0%,100% {
            box-shadow: 0 0 20px rgba(14,165,233,.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(14,165,233,.5);
          }
        }

        @keyframes fade {
          0% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}