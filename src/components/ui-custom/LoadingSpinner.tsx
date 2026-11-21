import { useId } from 'react';
import { cn } from '@/lib/utils';
import './Loader.css';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

function SpinnerMark({ gradientId }: { gradientId: string }) {
  return (
    <svg
      className="bs-loader-mark"
      viewBox="0 0 400 400"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`bs-spinner-metal-b-${gradientId}`} x1="0" y1="0" x2="0.18" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset=".22" stopColor="#eafaff" />
          <stop offset=".48" stopColor="#9bc9e5" />
          <stop offset=".72" stopColor="#f4fdff" />
          <stop offset="1" stopColor="#7da8cc" />
        </linearGradient>
        <linearGradient id={`bs-spinner-metal-s-${gradientId}`} x1=".1" y1="0" x2=".9" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset=".25" stopColor="#d8f2ff" />
          <stop offset=".52" stopColor="#8db8d8" />
          <stop offset=".76" stopColor="#f5fdff" />
          <stop offset="1" stopColor="#789fc5" />
        </linearGradient>
      </defs>
      <g className="bs-loader-mark__extrusion">
        <path fillRule="evenodd" d="M55 69 H157 C211 69 244 94 244 137 C244 164 230 183 208 195 C239 205 257 228 257 262 C257 310 220 337 160 337 H55 Z M101 111 V179 H153 C181 179 196 168 196 145 C196 122 181 111 153 111 Z M101 222 V294 H158 C191 294 208 282 208 258 C208 234 191 222 158 222 Z" />
        <path d="M333 104 L300 139 C283 122 265 113 244 113 C224 113 211 123 211 139 C211 154 223 162 257 173 L278 180 C326 196 350 220 350 260 C350 310 310 341 254 341 C213 341 179 325 153 297 L189 263 C207 283 228 294 253 294 C278 294 293 283 293 265 C293 248 281 239 248 228 L227 221 C180 205 155 182 155 142 C155 96 191 65 246 65 C281 65 311 79 333 104 Z" />
      </g>
      <path className="bs-loader-mark__b" fill={`url(#bs-spinner-metal-b-${gradientId})`} fillRule="evenodd" d="M48 61 H151 C207 61 240 87 240 132 C240 159 226 178 204 190 C235 200 253 223 253 257 C253 305 216 332 156 332 H48 Z M94 103 V171 H147 C175 171 190 160 190 137 C190 114 175 103 147 103 Z M94 214 V286 H152 C185 286 202 274 202 250 C202 226 185 214 152 214 Z" />
      <path className="bs-loader-mark__s" fill={`url(#bs-spinner-metal-s-${gradientId})`} d="M326 96 L293 131 C276 114 258 105 237 105 C217 105 204 115 204 131 C204 146 216 154 250 165 L271 172 C319 188 343 212 343 252 C343 302 303 333 247 333 C206 333 172 317 146 289 L182 255 C200 275 221 286 246 286 C271 286 286 275 286 257 C286 240 274 231 241 220 L220 213 C173 197 148 174 148 134 C148 88 184 57 239 57 C274 57 304 71 326 96 Z" />
      <path className="bs-loader-mark__edge" d="M50 63 H151 C207 63 239 88 239 132 M96 104 V171 M96 216 V286 M326 97 C304 72 274 59 239 59" />
    </svg>
  );
}

export function LoadingSpinner({
  size = 'md',
  className,
  text = 'Loading...',
}: LoadingSpinnerProps) {
  const gradientId = useId().replace(/:/g, '');
  const sizeClasses = {
    sm: 'bs-inline-loader-orb--sm',
    md: 'bs-inline-loader-orb--md',
    lg: 'bs-inline-loader-orb--lg',
  };

  return (
    <div
      className={cn('flex flex-col items-center gap-3', className)}
      role="status"
      aria-label={text || 'Loading'}
    >
      <div className={cn('bs-inline-loader-orb', sizeClasses[size])} aria-hidden="true">
        <div className="bs-loader-orb__core" />
        <SpinnerMark gradientId={gradientId} />
        <div className="bs-loader-glass" />
        <div className="bs-loader-caustics" />
        <div className="bs-loader-lid bs-loader-lid--top" />
        <div className="bs-loader-lid bs-loader-lid--bottom" />
        <div className="bs-loader-blink-glow" />
        <div className="bs-loader-rim" />
      </div>
      {text && <span className="text-sm font-medium text-sky-400">{text}</span>}
    </div>
  );
}
