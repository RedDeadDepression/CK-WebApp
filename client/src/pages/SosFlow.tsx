import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wine, Home as HomeIcon, User, X, Check, ArrowRight, RefreshCcw } from "lucide-react";
import { PRACTICES_DB, type Practice } from "@/lib/constants";
import { SmartTimer } from "@/components/SmartTimer";
import { useCreateWin } from "@/hooks/use-wins";
import { useUser } from "@/hooks/use-user";
import { useLocation } from "wouter";
import { incrementLocalStorageWins, getLocalStorageWins } from "@/lib/localStorageWins";
import { isTelegramWebApp, sendWinAndClose } from "@/lib/telegram";
import { BreakingCigarette } from "@/components/BreakingCigarette";
import { FreePlanStub } from "@/components/FreePlanStub";

// --- TYPES ---
type QuizStep = 0 | 1 | 2;
type ViewState = "QUIZ" | "PRACTICE" | "SUCCESS" | "FAILURE" | "FREEPLAN";

interface QuizAnswers {
  hasAlcohol: boolean;
  isHome: boolean;
  isAlone: boolean;
}

// --- MAIN COMPONENT ---
export default function SosFlow() {
  const [viewState, setViewState] = useState<ViewState>("QUIZ");
  const [quizStep, setQuizStep] = useState<QuizStep>(0);
  const [answers, setAnswers] = useState<QuizAnswers>({ hasAlcohol: false, isHome: false, isAlone: false });
  const [currentPractice, setCurrentPractice] = useState<Practice | null>(null);
  const [excludedTypes, setExcludedTypes] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [pendingAnswers, setPendingAnswers] = useState<QuizAnswers | null>(null);
  const [location, setLocation] = useLocation(); // Hook usage

  const createWin = useCreateWin();
  const { data: user, isLoading: userLoading } = useUser();

  // Handle VIP check once user data is loaded and quiz is complete
  useEffect(() => {
    if (!userLoading && pendingAnswers !== null) {
      checkVipAndRoute(pendingAnswers);
      setPendingAnswers(null);
    }
  }, [user, userLoading, pendingAnswers]);

  // --- QUIZ LOGIC ---
  const handleAnswer = (answer: boolean) => {
    const newAnswers = { ...answers };
    if (quizStep === 0) newAnswers.hasAlcohol = answer;
    if (quizStep === 1) newAnswers.isHome = answer;
    if (quizStep === 2) newAnswers.isAlone = answer;
    setAnswers(newAnswers);

    if (quizStep < 2) {
      setQuizStep((prev) => (prev + 1) as QuizStep);
    } else {
      // Quiz is complete, check VIP status
      if (userLoading) {
        // User data still loading, store answers and wait
        setPendingAnswers(newAnswers);
      } else {
        // User data is ready, check VIP status immediately
        checkVipAndRoute(newAnswers);
      }
    }
  };

  // --- VIP CHECK AND ROUTING ---
  const checkVipAndRoute = (currentAnswers: QuizAnswers) => {
    if (user?.isVip === true) {
      // VIP user: show existing practice selection flow
      generatePractice(currentAnswers, []);
    } else {
      // Non-VIP user: redirect to free plan stub
      setViewState("FREEPLAN");
    }
  };

  // --- PRACTICE GENERATION LOGIC ---
  const generatePractice = (currentAnswers: QuizAnswers, currentExcluded: string[]) => {
    // 1. Filter Logic
    let candidates = PRACTICES_DB.filter(p => {
      // Exclude already tried types for this session
      if (currentExcluded.includes(p.type)) return false;

      // Logic from requirements
      if (currentAnswers.hasAlcohol && p.tags.state === "SOBER") return false;
      if (!currentAnswers.isHome && p.tags.loc === "HOME") return false;
      if (!currentAnswers.isAlone && p.tags.soc === "PRIVATE") return false;

      return true;
    });

    // If we filtered everything out (unlikely but possible), relax constraints or reset exclusions
    if (candidates.length === 0) {
        // Fallback: Just pick any valid one ignoring type exclusions if we ran out
        candidates = [...PRACTICES_DB];
    }

    // 2. Random Selection
    const randomIndex = Math.floor(Math.random() * candidates.length);
    setCurrentPractice(candidates[randomIndex]);
    setViewState("PRACTICE");
    setAttempts(prev => prev + 1);
  };

  const handleNextPractice = () => {
    if (attempts >= 3) {
      setViewState("FAILURE");
      return;
    }
    
    if (currentPractice) {
      const newExcluded = [...excludedTypes, currentPractice.type];
      setExcludedTypes(newExcluded);
      generatePractice(answers, newExcluded);
    }
  };

  const handleSuccess = () => {
    // Increment LocalStorage immediately for instant feedback
    incrementLocalStorageWins();
    
    // Also try to create win via API (if available)
    createWin.mutate();
    
    setViewState("SUCCESS");
  };

  // --- RENDER ---
  return (
    <div className="h-screen w-full bg-background overflow-hidden relative">
        <AnimatePresence mode="wait">
            {viewState === "QUIZ" && (
                <QuizView 
                    step={quizStep} 
                    onAnswer={handleAnswer} 
                    key="quiz"
                />
            )}
            
            {viewState === "PRACTICE" && currentPractice && (
                <PracticeView 
                    practice={currentPractice}
                    onSuccess={handleSuccess}
                    onNext={handleNextPractice}
                    attempts={attempts}
                    key={currentPractice.id} // Re-mount on change for animations
                />
            )}

            {viewState === "SUCCESS" && currentPractice && (
                <SuccessView 
                    key="success" 
                    practiceId={String(currentPractice.id)}
                />
            )}

            {viewState === "FAILURE" && (
                <FailureView key="failure" />
            )}

            {viewState === "FREEPLAN" && (
                <FreePlanStub key="freeplan" />
            )}
        </AnimatePresence>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function QuizView({ step, onAnswer }: { step: QuizStep; onAnswer: (a: boolean) => void }) {
  const questions = [
    { text: "Have you been drinking alcohol?", icon: Wine },
    { text: "Are you at home?", icon: HomeIcon },
    { text: "Are you alone?", icon: User },
  ];

  const CurrentIcon = questions[step].icon;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="h-screen w-screen relative overflow-hidden"
    >
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-2 bg-secondary z-20">
        <motion.div 
            className="h-full bg-primary" 
            initial={{ width: "0%" }}
            animate={{ width: `${((step + 1) / 3) * 100}%` }}
        />
      </div>

      {/* Split Screen Container */}
      <div className="flex flex-col h-full w-full">
        {/* YES Zone (Top Half) */}
        <button 
          onClick={() => onAnswer(true)}
          className="flex-1 w-full relative z-10 bg-gradient-to-b from-primary/20 to-primary/10 hover:from-primary/30 hover:to-primary/20 active:from-primary/40 active:to-primary/30 transition-all group"
        >
          {/* YES Label - Pinned to Top Edge */}
          <div className="absolute top-12 left-0 w-full flex flex-col items-center z-20 pointer-events-none">
            <div className="transform group-hover:scale-110 transition-transform duration-300">
              <div className="bg-primary text-primary-foreground p-6 rounded-full shadow-[0_0_30px_rgba(0,230,118,0.4)]">
                <Check className="w-12 h-12" />
              </div>
              <p className="text-primary font-bold mt-4 text-xl tracking-widest uppercase">Yes</p>
            </div>
          </div>
        </button>

        {/* NO Zone (Bottom Half) */}
        <button 
          onClick={() => onAnswer(false)}
          className="flex-1 w-full relative z-10 bg-secondary hover:bg-secondary/90 active:bg-secondary/80 transition-all group"
        >
          {/* NO Label - Pinned to Bottom Edge */}
          <div className="absolute bottom-12 left-0 w-full flex flex-col items-center z-20 pointer-events-none">
            <div className="transform group-hover:scale-110 transition-transform duration-300">
              <div className="bg-muted text-muted-foreground p-6 rounded-full">
                <X className="w-12 h-12" />
              </div>
              <p className="text-muted-foreground font-bold mt-4 text-xl tracking-widest uppercase">No</p>
            </div>
          </div>
        </button>
      </div>

      {/* Central Question Card - Absolutely Positioned Floater */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
        <div className="w-[90vw] max-w-[340px] bg-black/90 backdrop-blur-md rounded-2xl px-6 py-4 shadow-2xl text-center">
          <CurrentIcon className="w-6 h-6 text-primary mx-auto mb-2" />
          <h2 className="text-lg font-semibold text-foreground leading-snug w-full">{questions[step].text}</h2>
        </div>
      </div>
    </motion.div>
  );
}

function PracticeView({ practice, onSuccess, onNext, attempts }: { practice: Practice, onSuccess: () => void, onNext: () => void, attempts: number }) {
    const [isTimerFinished, setIsTimerFinished] = useState(false);

    // Reset timer finished state when practice changes
    useEffect(() => {
        setIsTimerFinished(false);
    }, [practice.id]);

    const handleTimerFinish = () => {
        setIsTimerFinished(true);
    };

    return (
        <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="h-[100dvh] w-full flex flex-col overflow-hidden safe-area-bottom"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <span className="text-xs font-mono text-muted-foreground bg-secondary px-3 py-1 rounded-full uppercase tracking-wider">
                    Attempt {attempts}/3
                </span>
                <span className="text-xs font-mono text-primary border border-primary/20 px-3 py-1 rounded-full uppercase tracking-wider">
                    {practice.type}
                </span>
            </div>

            {/* Content Area - Scrollable, Centered */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-md mx-auto w-full px-4 py-6 flex flex-col justify-center min-h-full">
                    <div className="bg-card border border-white/10 p-6 rounded-2xl shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-24 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        
                        <h2 className="text-2xl font-display font-black text-primary mb-4 relative z-10">
                            {practice.title}
                        </h2>
                        
                        <p className="text-base text-foreground/90 leading-relaxed font-body relative z-10">
                            {practice.text}
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer - Timer + Buttons, Sticky at Bottom */}
            <div className="w-full p-4 bg-black/80 backdrop-blur-md border-t border-white/10">
                <div className="max-w-md mx-auto w-full space-y-3">
                    <SmartTimer 
                        text={practice.text} 
                        onFinish={handleTimerFinish}
                        onTimerFinished={setIsTimerFinished}
                    />
                    
                    {/* It Helped button - Always visible, disabled until timer finishes */}
                    <button 
                        onClick={onSuccess}
                        disabled={!isTimerFinished}
                        className={`
                            w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 
                            transition-all active:scale-95
                            ${isTimerFinished
                                ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(0,230,118,0.25)] hover:shadow-[0_0_30px_rgba(0,230,118,0.4)] cursor-pointer"
                                : "bg-secondary/50 text-muted-foreground/50 cursor-not-allowed opacity-60"
                            }
                        `}
                    >
                        <Check className="w-6 h-6" />
                        It Helped!
                    </button>

                    <button 
                        onClick={onNext}
                        className="w-full py-4 bg-secondary text-muted-foreground hover:text-foreground rounded-2xl font-medium text-lg flex items-center justify-center gap-3 transition-colors active:scale-95"
                    >
                        <RefreshCcw className="w-5 h-5" />
                        Not working, try another
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

function SuccessView({ practiceId }: { practiceId: string }) {
    const [, setLocation] = useLocation();
    const [totalWins, setTotalWins] = useState(0);
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        // Update total wins from LocalStorage
        setTotalWins(getLocalStorageWins());
        
        // Show additional content after animation completes
        const timer = setTimeout(() => {
            setShowContent(true);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    const handleBackToBot = () => {
        if (isTelegramWebApp()) {
            // Send data to Telegram bot and close
            sendWinAndClose(practiceId);
        } else {
            // Fallback: navigate to home
            setLocation("/");
        }
    };

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="h-full w-full flex flex-col items-center justify-center p-8 bg-background text-center"
        >
            <BreakingCigarette />

            {showContent && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mt-8 w-full flex flex-col items-center"
                >
                    <p className="text-xl font-mono mb-2 text-[#00E676] font-bold" style={{
                        textShadow: '0 0 10px rgba(0, 230, 118, 0.8), 0 0 20px rgba(0, 230, 118, 0.6), 0 2px 4px rgba(0, 0, 0, 0.5)',
                        filter: 'drop-shadow(0 0 8px rgba(0, 230, 118, 0.5))'
                    }}>+1 Win Recorded</p>
                    <p className="text-lg text-white/80 mb-12">
                        Total Wins: <span className="font-bold text-[#00E676]" style={{
                            textShadow: '0 0 8px rgba(0, 230, 118, 0.6), 0 2px 4px rgba(0, 0, 0, 0.5)'
                        }}>{totalWins}</span>
                    </p>

                    <div className="w-full max-w-md px-4 pb-4">
                        {isTelegramWebApp() ? (
                            <button 
                                onClick={handleBackToBot}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(0,230,118,0.3)]"
                            >
                                Back to Bot <ArrowRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <button 
                                onClick={() => setLocation("/")}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(0,230,118,0.3)]"
                            >
                                Back to Menu <ArrowRight className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}

function FailureView() {
    const [, setLocation] = useLocation();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full w-full flex flex-col items-center justify-center p-8 bg-background text-center relative"
        >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-red-900/10 pointer-events-none" />

            <div className="max-w-md space-y-8 relative z-10">
                <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                    <User className="w-10 h-10 text-muted-foreground" />
                </div>
                
                <h2 className="text-3xl font-bold text-foreground">It's okay.</h2>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                    Just breathe for 60 seconds. <br/>
                    I'm with you. <br/>
                    The craving will pass.
                </p>

                <SmartTimer text="60 seconds" />

                <button 
                    onClick={() => setLocation("/")}
                    className="w-full py-4 mt-8 border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-xl font-medium transition-colors"
                >
                    Close
                </button>
            </div>
        </motion.div>
    );
}
