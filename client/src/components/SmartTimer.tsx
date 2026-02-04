import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

interface SmartTimerProps {
  text: string;
  onFinish?: () => void;
  onTimerFinished?: (finished: boolean) => void;
}

export function SmartTimer({ text, onFinish, onTimerFinished }: SmartTimerProps) {
  const [duration, setDuration] = useState<number>(53); // Default to 53 seconds
  const [timeLeft, setTimeLeft] = useState<number>(53); // Default to 53 seconds
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasCalledOnFinishRef = useRef(false);
  const isFinished = timeLeft === 0;

  useEffect(() => {
    // Detect time in text
    const secondMatch = text.match(/(\d+)\s*seconds?/i);
    const minuteMatch = text.match(/(\d+)\s*minutes?/i);
    // Only match "sec" when it's NOT part of "seconds" (use word boundary or check it's not followed by "ond")
    const secMatch2 = !secondMatch ? text.match(/(\d+)\s*sec(?!ond)/i) : null; // e.g. "4 sec" but not "4 seconds"

    let seconds = 0;
    if (secondMatch) seconds += parseInt(secondMatch[1]);
    if (secMatch2) seconds += parseInt(secMatch2[1]);
    if (minuteMatch) seconds += parseInt(minuteMatch[1]) * 60;

    // Default fallbacks for specific practices without explicit numbers in regex
    if (text.includes("10 Minute Rule")) seconds = 600;
    
    // Always set a duration - default to 53 seconds if no time detected
    const finalDuration = seconds > 0 ? seconds : 53;
    setDuration(finalDuration);
    setTimeLeft(finalDuration);
    hasCalledOnFinishRef.current = false; // Reset when duration changes
    // Notify parent that timer is reset when text/duration changes
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
      // Call onFinish callback when timer reaches 0 (only once)
      if (onFinish) {
        hasCalledOnFinishRef.current = true;
        onFinish();
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft, onFinish]);

  // Notify parent about timer finished state
  useEffect(() => {
    if (onTimerFinished) {
      onTimerFinished(isFinished);
    }
  }, [isFinished, onTimerFinished]);

  // Timer is always visible now - duration is always set (defaults to 53 seconds)
  const progress = (timeLeft / duration) * 100;
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-3 rounded-xl bg-secondary/50 border border-border">
      {/* Compact horizontal layout */}
      <div className="flex items-center justify-between gap-3">
        {/* Time display */}
        <div className="flex items-center gap-3">
          <span className="text-xl font-mono font-bold text-primary tabular-nums">
            {formatTime(timeLeft)}
          </span>
          <div className="h-2 w-16 bg-secondary/80 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[#00E676] rounded-full"
              style={{
                boxShadow: '0 0 10px rgba(0, 230, 118, 0.5)'
              }}
              initial={{ width: "100%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "linear" }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsActive(!isActive)}
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
              hasCalledOnFinishRef.current = false; // Reset callback flag when timer is reset
              if (onTimerFinished) {
                onTimerFinished(false); // Notify parent that timer is reset
              }
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
