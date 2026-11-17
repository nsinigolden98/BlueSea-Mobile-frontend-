import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const sizeClasses: Record<NonNullable<LoadingSpinnerProps['size']>, string> = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-20 h-20',
};

/** Compact version of the BlueSea water-and-eyelid loading animation. */
export function LoadingSpinner({
  size = 'md',
  className,
  text = 'Loading...',
}: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <div
        className={cn('bs-spinner-mark relative shrink-0 overflow-hidden rounded-full', sizeClasses[size])}
        role="status"
        aria-label={text || 'Loading'}
      >
        <img
          className="bs-spinner-logo absolute inset-0 h-full w-full rounded-full object-contain"
          src="/bluesea-logo.png"
          alt=""
          draggable={false}
        />
        <span className="bs-spinner-water" aria-hidden="true" />
        <span className="bs-spinner-lid bs-spinner-lid-top" aria-hidden="true" />
        <span className="bs-spinner-lid bs-spinner-lid-bottom" aria-hidden="true" />
      </div>

      {text && (
        <span className="text-sm font-medium text-sky-500">{text}</span>
      )}

      <style>{`
        .bs-spinner-mark {
          isolation: isolate;
          background: #006dff;
          box-shadow: 0 0 18px rgba(0, 153, 255, 0.22);
        }
        .bs-spinner-logo { z-index: 0; user-select: none; -webkit-user-drag: none; }
        .bs-spinner-water {
          position: absolute;
          z-index: 1;
          inset: -24%;
          border-radius: 50%;
          pointer-events: none;
          opacity: 0.2;
          mix-blend-mode: screen;
          background:
            radial-gradient(ellipse at 24% 42%, rgba(117, 245, 255, 0.7), transparent 29%),
            radial-gradient(ellipse at 76% 58%, rgba(0, 117, 255, 0.58), transparent 34%),
            linear-gradient(118deg, transparent 34%, rgba(179, 250, 255, 0.42) 48%, transparent 61%);
          background-size: 145% 145%;
          animation: bsSpinnerWater 2.8s ease-in-out infinite alternate;
        }
        .bs-spinner-lid {
          position: absolute;
          z-index: 2;
          left: -2%;
          width: 104%;
          height: 34%;
          opacity: 0;
          pointer-events: none;
          background: linear-gradient(180deg, rgba(13, 183, 255, 0.94), rgba(0, 92, 220, 0.96) 48%, rgba(0, 30, 112, 0.94));
          box-shadow: inset 0 2px 4px rgba(183, 250, 255, 0.62), inset 0 -4px 8px rgba(0, 13, 75, 0.46);
          backdrop-filter: blur(4px) saturate(1.2);
          -webkit-backdrop-filter: blur(4px) saturate(1.2);
          will-change: transform, opacity;
          animation: bsSpinnerBlink 1s cubic-bezier(0.42, 0, 0.28, 1) infinite;
        }
        .bs-spinner-lid-top {
          top: 17%;
          border-radius: 0 0 50% 50% / 0 0 85% 85%;
          transform: translateY(-112%);
          border-bottom: 1px solid rgba(166, 250, 255, 0.85);
        }
        .bs-spinner-lid-bottom {
          bottom: 17%;
          border-radius: 50% 50% 0 0 / 85% 85% 0 0;
          transform: translateY(112%);
          border-top: 1px solid rgba(166, 250, 255, 0.78);
          animation-name: bsSpinnerBlinkBottom;
        }
        @keyframes bsSpinnerWater {
          0% { transform: translate3d(-3%, -1%, 0) rotate(-5deg); background-position: 0% 45%; opacity: 0.13; }
          100% { transform: translate3d(3%, 1%, 0) rotate(5deg); background-position: 100% 55%; opacity: 0.25; }
        }
        @keyframes bsSpinnerBlink {
          0%, 16%, 100% { transform: translateY(-112%); opacity: 0; }
          24% { opacity: 1; }
          43%, 49% { transform: translateY(76%); opacity: 1; }
          62% { transform: translateY(-112%); opacity: 0; }
        }
        @keyframes bsSpinnerBlinkBottom {
          0%, 16%, 100% { transform: translateY(112%); opacity: 0; }
          24% { opacity: 1; }
          43%, 49% { transform: translateY(-76%); opacity: 1; }
          62% { transform: translateY(112%); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .bs-spinner-water, .bs-spinner-lid { animation-duration: 3s; }
        }
      `}</style>
    </div>
  );
}
