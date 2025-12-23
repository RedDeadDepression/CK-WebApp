import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

interface SmartTimerProps {
  text: string;
}

export function SmartTimer({ text }: SmartTimerProps) {
  const [duration, setDuration] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Detect time in text
    const secondMatch = text.match(/(\d+)\s*seconds?/i);
    const minuteMatch = text.match(/(\d+)\s*minutes?/i);
    const secMatch2 = text.match(/(\d+)\s*sec/i); // e.g. "4 sec"

    let seconds = 0;
    if (secondMatch) seconds += parseInt(secondMatch[1]);
    if (secMatch2) seconds += parseInt(secMatch2[1]);
    if (minuteMatch) seconds += parseInt(minuteMatch[1]) * 60;

    // Default fallbacks for specific practices without explicit numbers in regex
    if (text.includes("10 Minute Rule")) seconds = 600;
    
    if (seconds > 0) {
      setDuration(seconds);
      setTimeLeft(seconds);
    } else {
      setDuration(null);
    }
  }, [text]);

  useEffect(() => {
    if (isActive && timeLeft !== null && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => (prev !== null ? prev - 1 : 0));
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft]);

  if (!duration) return null;

  const progress = timeLeft !== null ? (timeLeft / duration) * 100 : 0;
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mt-6 p-4 rounded-xl bg-secondary/50 border border-border">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
          Timer
        </span>
        <span className="text-2xl font-mono font-bold text-primary tabular-nums">
          {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
        </span>
      </div>

      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden mb-6">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: "100%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "linear" }}
        />
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => setIsActive(!isActive)}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all
            ${isActive 
              ? "bg-secondary text-foreground hover:bg-secondary/80" 
              : "bg-primary text-primary-foreground hover:opacity-90 hover:scale-105 active:scale-95"
            }
          `}
        >
          {isActive ? (
            <>
              <Pause className="w-5 h-5" /> Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" /> Start
            </>
          )}
        </button>
        
        <button
          onClick={() => {
            setIsActive(false);
            setTimeLeft(duration);
          }}
          className="p-3 rounded-full bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
