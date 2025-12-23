import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wine, Home as HomeIcon, User, X, Check, ArrowRight, RefreshCcw } from "lucide-react";
import { PRACTICES_DB, type Practice } from "@/lib/constants";
import { SmartTimer } from "@/components/SmartTimer";
import { useCreateWin } from "@/hooks/use-wins";
import confetti from "canvas-confetti";
import { useLocation } from "wouter";

// --- TYPES ---
type QuizStep = 0 | 1 | 2;
type ViewState = "QUIZ" | "PRACTICE" | "SUCCESS" | "FAILURE";

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
  const [location, setLocation] = useLocation(); // Hook usage

  const createWin = useCreateWin();

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
      generatePractice(newAnswers, []);
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
        candidates = PRACTICES_DB;
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
    createWin.mutate();
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00E676', '#ffffff', '#262626']
    });
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

            {viewState === "SUCCESS" && (
                <SuccessView key="success" />
            )}

            {viewState === "FAILURE" && (
                <FailureView key="failure" />
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
      className="h-full w-full flex flex-col"
    >
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-2 bg-secondary z-20">
        <motion.div 
            className="h-full bg-primary" 
            initial={{ width: "0%" }}
            animate={{ width: `${((step + 1) / 3) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col relative">
        {/* Question Overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
            <div className="bg-background/90 backdrop-blur-md border border-white/10 p-8 rounded-3xl max-w-xs text-center shadow-2xl">
                <CurrentIcon className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground">{questions[step].text}</h2>
            </div>
        </div>

        {/* Yes Button (Top Half) */}
        <button 
          onClick={() => onAnswer(true)}
          className="flex-1 bg-primary/10 hover:bg-primary/20 active:bg-primary/30 transition-colors flex flex-col items-center justify-start pt-24 pb-10 group"
        >
            <div className="mt-auto transform group-hover:scale-110 transition-transform duration-300">
                <div className="bg-primary text-primary-foreground p-6 rounded-full shadow-[0_0_30px_rgba(0,230,118,0.4)]">
                    <Check className="w-12 h-12" />
                </div>
                <p className="text-primary font-bold mt-4 text-xl tracking-widest uppercase">Yes</p>
            </div>
        </button>

        {/* No Button (Bottom Half) */}
        <button 
          onClick={() => onAnswer(false)}
          className="flex-1 bg-secondary hover:bg-secondary/80 active:bg-secondary/60 transition-colors flex flex-col items-center justify-end pb-24 pt-10 group"
        >
            <div className="mb-auto transform group-hover:scale-110 transition-transform duration-300">
                <div className="bg-muted text-muted-foreground p-6 rounded-full">
                    <X className="w-12 h-12" />
                </div>
                <p className="text-muted-foreground font-bold mt-4 text-xl tracking-widest uppercase">No</p>
            </div>
        </button>
      </div>
    </motion.div>
  );
}

function PracticeView({ practice, onSuccess, onNext, attempts }: { practice: Practice, onSuccess: () => void, onNext: () => void, attempts: number }) {
    return (
        <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="h-full w-full flex flex-col p-6 safe-area-bottom"
        >
            <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                <div className="flex items-center justify-between mb-8">
                    <span className="text-xs font-mono text-muted-foreground bg-secondary px-3 py-1 rounded-full uppercase tracking-wider">
                        Attempt {attempts}/3
                    </span>
                    <span className="text-xs font-mono text-primary border border-primary/20 px-3 py-1 rounded-full uppercase tracking-wider">
                        {practice.type}
                    </span>
                </div>

                <div className="bg-card border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    
                    <h2 className="text-3xl font-display font-black text-primary mb-6 relative z-10">
                        {practice.title}
                    </h2>
                    
                    <p className="text-lg text-foreground/90 leading-relaxed font-body relative z-10">
                        {practice.text}
                    </p>

                    <SmartTimer text={practice.text} />
                </div>
            </div>

            <div className="mt-auto max-w-md mx-auto w-full space-y-4 mb-8">
                <button 
                    onClick={onSuccess}
                    className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(0,230,118,0.25)] hover:shadow-[0_0_30px_rgba(0,230,118,0.4)] transition-all active:scale-95"
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
        </motion.div>
    );
}

function SuccessView() {
    const [, setLocation] = useLocation();

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="h-full w-full flex flex-col items-center justify-center p-8 bg-background text-center"
        >
            <motion.div
                animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                className="w-32 h-32 bg-primary rounded-full flex items-center justify-center mb-8 shadow-[0_0_60px_rgba(0,230,118,0.6)]"
            >
                <Check className="w-16 h-16 text-primary-foreground" strokeWidth={4} />
            </motion.div>

            <h1 className="text-4xl font-black text-white mb-4">YOU ARE STRONG</h1>
            <p className="text-xl text-primary font-mono mb-12">+1 Win Recorded</p>

            <button 
                onClick={() => setLocation("/")}
                className="bg-secondary hover:bg-secondary/80 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95"
            >
                Back to Home <ArrowRight className="w-5 h-5" />
            </button>
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
