import React, { useState } from 'react';

interface AppPinInputProps {
  length?: number;
  onComplete: (pin: string) => void;
  title?: string;
  error?: string | null;
}

export const AppPinInput: React.FC<AppPinInputProps> = ({
  length = 4,
  onComplete,
  title,
  error,
}) => {
  const [pin, setPin] = useState<string>('');

  const handleKeyPress = (num: string) => {
    if (pin.length < length) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === length) {
        onComplete(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="w-full flex flex-col items-center">
      {title && <p className="text-sm text-slate-300 font-medium mb-6">{title}</p>}
      
      {/* PIN Indicator Dots */}
      <div className="flex space-x-4 mb-10">
        {Array.from({ length }).map((_, idx) => (
          <div
            key={idx}
            className={`w-4 h-4 rounded-full transition-all duration-200 ${
              idx < pin.length ? 'bg-[#00D1FF] scale-110 shadow-lg shadow-[#00D1FF]/50' : 'bg-slate-700/80'
            }`}
          />
        ))}
      </div>

      {error && <p className="text-xs text-red-400 font-medium mb-6">{error}</p>}

      {/* Numeric Keypad */}
      <div className="grid grid-cols-3 gap-6 w-full max-w-xs">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handleKeyPress(num)}
            className="w-16 h-16 rounded-full bg-slate-800/80 hover:bg-slate-700/80 active:bg-slate-600 border border-slate-700/50 text-xl font-bold text-white flex items-center justify-center mx-auto transition-colors"
          >
            {num}
          </button>
        ))}
        <div />
        <button
          type="button"
          onClick={() => handleKeyPress('0')}
          className="w-16 h-16 rounded-full bg-slate-800/80 hover:bg-slate-700/80 active:bg-slate-600 border border-slate-700/50 text-xl font-bold text-white flex items-center justify-center mx-auto transition-colors"
        >
          0
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="w-16 h-16 rounded-full bg-slate-800/40 hover:bg-slate-700/60 active:bg-slate-600 text-slate-300 flex items-center justify-center mx-auto transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-9.172a2 2 0 00-1.414.586L3 12z" />
          </svg>
        </button>
      </div>
    </div>
  );
};