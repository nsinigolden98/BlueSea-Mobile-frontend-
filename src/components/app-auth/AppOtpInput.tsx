import React, { useRef, useState, useEffect } from 'react';

interface AppOtpInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  error?: string | null;
}

export const AppOtpInput: React.FC<AppOtpInputProps> = ({
  length = 6,
  onComplete,
  error,
}) => {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (!cleanValue) return;

    const newDigits = [...digits];
    newDigits[index] = cleanValue.slice(-1);
    setDigits(newDigits);

    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const completedOtp = newDigits.join('');
    if (completedOtp.length === length) {
      onComplete(completedOtp);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
    }
  };

  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-center gap-2">
        {digits.map((digit, idx) => (
          <input
            key={idx}
           ref={(el) => {
  inputRefs.current[idx] = el;
}}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            className={`w-12 h-14 text-center text-xl font-bold rounded-xl bg-slate-800/80 border ${
              error ? 'border-red-500' : digit ? 'border-[#00D1FF]' : 'border-slate-700'
            } text-white focus:outline-none focus:border-[#00D1FF] focus:ring-1 focus:ring-[#00D1FF] transition-all`}
          />
        ))}
      </div>
      {error && <p className="mt-2 text-center text-xs text-red-400 font-medium">{error}</p>}
    </div>
  );
};
