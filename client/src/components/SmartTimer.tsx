import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

interface SmartTimerProps {
  text: string;
  onFinish?: () => void;
  onTimerFinished?: (finished: boolean) => void;
}

export function SmartTimer({ text, onFinish, onTimerFinished }: SmartTimerProps) {
  const [duration, setDuration] = useState<number>(53);
  const [timeLeft, setTimeLeft] = useState<number>(53);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasCalledOnFinishRef = useRef(false);
  const isFinished = timeLeft === 0;

  // 🔥 ДОБАВИЛИ
  const getTelegramUserId = () => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.initDataUnsafe?.user?.id) {
      console.error("No Telegram user");
      return null;
    }
    return String(tg.initDataUnsafe.user.id);
  };

  // 🔥 ДОБАВИЛИ
  const sendAttempt = async () => {
    const telegramUserId = getTelegramUserId();
    if (!telegramUserId) return;

    try {
      await fetch("/api/attempts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ telegramUserId }),
      });
    } catch (e) {
      console.error("Attempt error:", e);
    }
  };

  useEffect(() => {
    const secondMatch = text.match(/(\d+)\s*seconds?/i);
    const minuteMatch = text.match(/(\d+)\s*minutes?/i);
    const secMatch2 = !secondMatch ? text.match(/(\d+)\s*sec(?!ond)/i) : null;

    let seconds = 0;
    if (secondMatch) seconds += parseInt(secondMatch[1]);
    if (secMatch2) seconds += parseInt(secMatch2[1]);
    if (minuteMatch) seconds += parseInt(minuteMatch[1]) * 60;

    if (text.includes("10 Minute Rule")) seconds = 600;

    const finalDuration = seconds > 0 ? seconds : 53;
    setDuration(finalDuration);
    setTimeLeft(finalDuration);
    hasCalledOnFinishRef.current = false;

    if (onTimerFinished) {
      onTimerFinished(false);
    }
  }, [text, onTimerFinished]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (timeLeft === 0 && !hasCalledOnFinishRef.current) {
      setIsActive(false);
      if (intervalRef.current) clearInterval(intervalRef.current);

      if (onFinish) {
        hasCalledOnFinishRef.current = true;
        onFinish();
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft, onFinish]);

  useEffect(() => {
    if (onTimerFinished) {
      onTimerFinished(isFinished);
    }
  }, [isFinished, onTimerFinished]);

  const progress = (timeLeft / duration) * 100;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="p-3 rounded-xl bg-secondary/50 border border-border">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xl font-mono font-bold text-primary tabular-nums">
            {formatTime(timeLeft)}
          </span>
          <div className="h-2 w-16 bg-secondary/80 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#00E676] rounded-full"
              style={{ boxShadow: "0 0 10px rgba(0, 230, 118, 0.5)" }}
              initial={{ width: "100%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "linear" }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (!isActive) {
                sendAttempt(); // 🔥 ВОТ ГДЕ attempt
              }
              setIsActive(!isActive);
            }}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-full font-medium text-sm transition-all
              ${isActive
                ? "bg-secondary text-foreground hover:bg-secondary/80"
                : "bg-primary text-primary-foreground hover:opacity-90 active:scale-95"
              }
            `}
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4" /> Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> Start
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsActive(false);
              setTimeLeft(duration);
              hasCalledOnFinishRef.current = false;
              if (onTimerFinished) onTimerFinished(false);
            }}
            className="p-2 rounded-full bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
