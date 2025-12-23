import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { BrainCircuit, ShieldAlert, Trophy } from "lucide-react";
import { useWins } from "@/hooks/use-wins";

export default function Home() {
  const { data: wins, isLoading } = useWins();
  
  const totalWins = wins?.length || 0;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(0,230,118,0.15),transparent_50%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md space-y-12 z-10"
      >
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary border border-border mb-4 shadow-lg shadow-black/40"
          >
            <BrainCircuit className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
            CRAVING<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60 text-glow">
              INTERRUPTER
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xs mx-auto">
            A scientifically proven panic button for when the urge hits.
          </p>
        </div>

        <Link href="/sos" className="block group">
          <button className="w-full relative py-6 rounded-2xl bg-primary text-primary-foreground font-black text-2xl uppercase tracking-wider shadow-[0_0_40px_rgba(0,230,118,0.3)] hover:shadow-[0_0_60px_rgba(0,230,118,0.5)] transition-all duration-300 transform hover:-translate-y-1 active:scale-95 active:translate-y-0 overflow-hidden">
            <span className="relative z-10 flex items-center justify-center gap-3">
              <ShieldAlert className="w-8 h-8" />
              SOS MODE
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          </button>
        </Link>

        {/* Stats Card */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-secondary/40 backdrop-blur-sm border border-white/5 rounded-2xl p-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary rounded-xl">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Wins</p>
              <p className="text-2xl font-mono font-bold text-foreground">
                {isLoading ? "..." : totalWins}
              </p>
            </div>
          </div>
          <div className="h-10 w-px bg-white/10" />
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Keep fighting.</p>
            <p className="text-xs text-primary font-bold">You are stronger.</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
