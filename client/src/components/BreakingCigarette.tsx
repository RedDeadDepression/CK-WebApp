import { useEffect, useState } from "react";
import "./BreakingCigarette.css";

export function BreakingCigarette() {
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    // Show text after animation completes (around 1.5s)
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
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="cigaretteGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{stopColor:"#FFFFFF", stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:"#E0E0E0", stopOpacity:1}} />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="tipGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feColorMatrix in="coloredBlur" type="matrix" values="1 0 0 0 0  0 0.2 0 0 0  0 0 0 0 0  0 0 0 1 0"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Left piece (filter side) */}
        <g className="cigarette-left">
          {/* Filter (cork/orange) */}
          <rect x="10" y="20" width="25" height="20" rx="2" fill="#CD853F" />
          {/* Paper body with gradient */}
          <rect x="35" y="20" width="60" height="20" rx="2" fill="url(#cigaretteGradient)" />
        </g>

        {/* Right piece (lit side) */}
        <g className="cigarette-right">
          {/* Paper body with gradient */}
          <rect x="95" y="20" width="60" height="20" rx="2" fill="url(#cigaretteGradient)" />
          {/* Lit tip (grey/red with ash) */}
          <rect x="155" y="20" width="20" height="20" rx="2" fill="#696969" />
          {/* Glowing tip with filter - outer glow layers first */}
          <circle cx="165" cy="30" r="10" fill="#FF6347" opacity="0.4" filter="url(#tipGlow)" />
          <circle cx="165" cy="30" r="8" fill="#FF4500" opacity="0.5" filter="url(#tipGlow)" />
          <circle cx="165" cy="30" r="6" fill="#DC143C" opacity="0.9" filter="url(#glow)" />
          <circle cx="165" cy="30" r="3" fill="#FF6347" opacity="1" />
        </g>

        {/* Snap effect (jagged line/flash) */}
        <g className="snap-effect">
          <path
            d="M 95 20 L 98 25 L 95 30 L 98 35 L 95 40"
            stroke="#FFFFFF"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 95 20 L 92 25 L 95 30 L 92 35 L 95 40"
            stroke="#FFFFFF"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          {/* Flash effect */}
          <line x1="95" y1="20" x2="95" y2="40" stroke="#FFD700" strokeWidth="4" opacity="0.8" />
        </g>

        {/* Smoke particles */}
        <g className="smoke-particles">
          {/* Particle 1 */}
          <circle className="smoke-particle smoke-1" cx="95" cy="30" r="3" fill="#E0E0E0" opacity="0.8" />
          {/* Particle 2 */}
          <circle className="smoke-particle smoke-2" cx="95" cy="30" r="2.5" fill="#F5F5F5" opacity="0.7" />
          {/* Particle 3 */}
          <circle className="smoke-particle smoke-3" cx="95" cy="30" r="4" fill="#D3D3D3" opacity="0.6" />
          {/* Particle 4 */}
          <circle className="smoke-particle smoke-4" cx="95" cy="30" r="2" fill="#F0F0F0" opacity="0.75" />
          {/* Particle 5 */}
          <circle className="smoke-particle smoke-5" cx="95" cy="30" r="3.5" fill="#E8E8E8" opacity="0.65" />
          {/* Particle 6 */}
          <circle className="smoke-particle smoke-6" cx="95" cy="30" r="2.5" fill="#FAFAFA" opacity="0.7" />
        </g>
      </svg>

      {showText && (
        <div className="success-text">
          <h1>YOU ARE STRONG</h1>
        </div>
      )}
    </div>
  );
}

