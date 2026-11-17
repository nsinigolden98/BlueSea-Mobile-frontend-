import { useCallback, useState } from 'react';
import './Loader.css';

/**
 * Shared BlueSea loader visual.
 * The original logo artwork is rendered as an image; it is never redrawn as text.
 */
function SharedLoaderUI() {
  return (
    <div className="bs-loader-screen" id="loader" role="status" aria-label="Loading">
      <div className="bs-loader-orb" aria-hidden="true">
        {/* Keep the supplied, original 1024x1024 BlueSea artwork intact. */}
        <img
          className="bs-loader-logo"
          src="/bluesea-logo.png"
          alt=""
          draggable={false}
        />

        {/* Moving light over the water already present in the logo artwork. */}
        <div className="bs-loader-water-shimmer" />

        {/* Eyelids only cover the centre band; the circular outline stays visible. */}
        <div className="bs-loader-eyelid bs-loader-eyelid-top">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="bsTopLidGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#b9f5ff" stopOpacity="0.98" />
                <stop offset="0.28" stopColor="#168eea" stopOpacity="0.98" />
                <stop offset="0.72" stopColor="#0752c8" stopOpacity="0.99" />
                <stop offset="1" stopColor="#032d79" stopOpacity="1" />
              </linearGradient>
              <linearGradient id="bsTopLidHighlight" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#00eaff" stopOpacity="0" />
                <stop offset="0.5" stopColor="#d9ffff" stopOpacity="0.95" />
                <stop offset="1" stopColor="#00bfff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 50Q50 -5 100 50L100 50Q50 50 0 50Z" fill="url(#bsTopLidGradient)" />
            <path d="M0 50Q50 -5 100 50" fill="none" stroke="url(#bsTopLidHighlight)" strokeWidth="1.8" />
            <path d="M12 48Q50 7 88 48" fill="none" stroke="#d9fbff" strokeOpacity=".48" strokeWidth="1.1" />
          </svg>
        </div>

        <div className="bs-loader-eyelid bs-loader-eyelid-bottom">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="bsBottomLidGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#0648b5" stopOpacity="1" />
                <stop offset="0.45" stopColor="#087edc" stopOpacity="0.99" />
                <stop offset="1" stopColor="#8ceeff" stopOpacity="0.98" />
              </linearGradient>
              <linearGradient id="bsBottomLidHighlight" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#00dfff" stopOpacity="0" />
                <stop offset="0.5" stopColor="#e7ffff" stopOpacity="0.9" />
                <stop offset="1" stopColor="#00dfff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 50Q50 105 100 50L100 50Q50 50 0 50Z" fill="url(#bsBottomLidGradient)" />
            <path d="M0 50Q50 105 100 50" fill="none" stroke="url(#bsBottomLidHighlight)" strokeWidth="1.8" />
            <path d="M12 52Q50 93 88 52" fill="none" stroke="#d9fbff" strokeOpacity=".42" strokeWidth="1.1" />
          </svg>
        </div>

        {/* Filter definition for a very restrained liquid refraction on the logo. */}
        <svg className="bs-loader-filter-defs" aria-hidden="true" focusable="false">
          <filter id="bsWaterRefraction" x="-8%" y="-8%" width="116%" height="116%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.018"
              numOctaves="2"
              seed="8"
              result="waterNoise"
            >
              <animate
                attributeName="baseFrequency"
                dur="3.2s"
                values="0.010 0.015;0.016 0.022;0.010 0.015"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="waterNoise" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
      </div>
      <span className="bs-loader-sr-only">Loading</span>
    </div>
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
