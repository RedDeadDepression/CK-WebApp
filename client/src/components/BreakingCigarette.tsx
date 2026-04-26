import { useEffect, useState } from "react";
import "./BreakingCigarette.css";

export function BreakingCigarette() {
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowText(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="breaking-cigarette-container">

      {showText && (
        <div className="success-text">
          <h1>YOU ARE STRONG</h1>
        </div>
      )}
    </div>
  );
}
