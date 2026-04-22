import { useEffect, useState } from "react";
import "./BreakingCigarette.css";

export function BreakingCigarette() {
  const [showText, setShowText] = useState(false);

  // 🔥 добавили
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowText(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // 🔥 добавили
  const handleItHelps = async () => {
    if (sent) return;
    setSent(true);

    const tg = window.Telegram?.WebApp;

    if (!tg?.initDataUnsafe?.user?.id) {
      console.error("No Telegram user");
      return;
    }

    const telegramUserId = String(tg.initDataUnsafe.user.id);

    try {
      await fetch("/api/wins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ telegramUserId }),
      });

      console.log("WIN RECORDED");
    } catch (e) {
      console.error("Win error:", e);
    }
  };

  return (
    <div className="breaking-cigarette-container">
      {/* SVG ОСТАВЛЕН КАК У ТЕБЯ */}

      {showText && (
        <div className="success-text">
          <h1>YOU ARE STRONG</h1>

          {/* 🔥 КНОПКА */}
          <button onClick={handleItHelps} className="it-helps-btn">
            It helps
          </button>
        </div>
      )}
    </div>
  );
}
