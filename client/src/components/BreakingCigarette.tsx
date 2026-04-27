import { useEffect, useState } from "react";
import "./BreakingCigarette.css";

export function BreakingCigarette({ onItHelps }: { onItHelps: () => void }) {
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    // Показываем текст после завершения анимации
    const timer = setTimeout(() => {
      setShowText(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="breaking-cigarette-container">
      <svg
        className="cigarette-svg"
        viewBox="0 0 200 120"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="cigaretteGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: "#FFFFFF", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#E0E0E0", stopOpacity: 1 }} />
          </linearGradient>

          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="tipGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feColorMatrix
              in="coloredBlur"
              type="matrix"
              values="1 0 0 0 0  0 0.2 0 0 0  0 0 0 0 0  0 0 0 1 0"
            />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Левая часть */}
        <g className="cigarette-left">
          <rect x="10" y="20" width="25" height="20" rx="2" fill="#CD853F" />
          <rect x="35" y="20" width="60" height="20" rx="2" fill="url(#cigaretteGradient)" />
        </g>

        {/* Правая часть */}
        <g className="cigarette-right">
          <rect x="95" y="20" width="60" height="20" rx="2" fill="url(#cigaretteGradient)" />
          <rect x="155" y="20" width="20" height="20" rx="2" fill="#696969" />

          <circle cx="165" cy="30" r="10" fill="#FF6347" opacity="0.4" filter="url(#tipGlow)" />
          <circle cx="165" cy="30" r="8" fill="#FF4500" opacity="0.5" filter="url(#tipGlow)" />
          <circle cx="165" cy="30" r="6" fill="#DC143C" opacity="0.9" filter="url(#glow)" />
          <circle cx="165" cy="30" r="3" fill="#FF6347" />
        </g>

        {/* Эффект разлома */}
        <g className="snap-effect">
          <path d="M 95 20 L 98 25 L 95 30 L 98 35 L 95 40" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 95 20 L 92 25 L 95 30 L 92 35 L 95 40" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round" />
          <line x1="95" y1="20" x2="95" y2="40" stroke="#FFD700" strokeWidth="4" opacity="0.8" />
        </g>

        {/* Дым */}
        <g className="smoke-particles">
          <circle className="smoke-particle smoke-1" cx="95" cy="30" r="3" fill="#E0E0E0" />
          <circle className="smoke-particle smoke-2" cx="95" cy="30" r="2.5" fill="#F5F5F5" />
          <circle className="smoke-particle smoke-3" cx="95" cy="30" r="4" fill="#D3D3D3" />
          <circle className="smoke-particle smoke-4" cx="95" cy="30" r="2" fill="#F0F0F0" />
          <circle className="smoke-particle smoke-5" cx="95" cy="30" r="3.5" fill="#E8E8E8" />
          <circle className="smoke-particle smoke-6" cx="95" cy="30" r="2.5" fill="#FAFAFA" />
        </g>
      </svg>

      {showText && (
        <div className="success-text">
          <h1>YOU ARE STRONG</h1>

          <button onClick={onItHelps} className="it-helps-btn">
            It helps
          </button>
        </div>
      )}
    </div>
  );
}
