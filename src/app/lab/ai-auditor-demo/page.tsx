'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── DEMO DATA ───
const demoQuestions = [
  {
    id: 'Q1',
    phase: 'FOUNDATIONS',
    text: 'When a key team member leaves, what happens to their knowledge?',
    options: [
      { text: 'Mostly lost; it is a scramble', label: 'A', trait: 'risk' },
      { text: 'Locked in a shared source of truth', label: 'D', trait: 'strength' }
    ],
    insights: {
      risk: "Knowledge fragmentation identified. In your sector, this costs roughly £14,000 per turnover event.",
      strength: "Excellent data hygiene. You have the raw material needed to build private AI agents."
    }
  },
  {
    id: 'Q2',
    phase: 'RISK & GOVERNANCE',
    text: 'Do your employees use personal ChatGPT accounts for client work?',
    options: [
      { text: 'Yes, informally without a policy', label: 'A', trait: 'risk' },
      { text: 'No, we have an approved AI Gateway', label: 'D', trait: 'strength' }
    ],
    insights: {
      risk: "Security Red-Flag. Unmonitored LLM usage is the #1 cause of data leaks in 2024.",
      strength: "Compliance Shield active. You are ready for high-stakes enterprise AI integration."
    }
  }
];

export default function AvatarDemo() {
  const [step, setStep] = useState<'intro' | 'audit' | 'milestone'>('intro');
  const [qIndex, setQIndex] = useState(0);
  const [avatarState, setAvatarState] = useState<'idle' | 'talking' | 'thinking' | 'warning' | 'celebrating'>('idle');
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);

  // ─── AVATAR SPEECH LOGIC ───
  useEffect(() => {
    if (step === 'intro') {
      speak("Greetings. I am the AiGENiQ Core. I will be your auditor today. Let's begin the link.", 'talking');
    }
  }, [step]);

  const speak = (text: string, state: typeof avatarState, duration = 3000) => {
    setMessage(text);
    setAvatarState(state);
    setTimeout(() => setAvatarState('idle'), duration);
  };

  const handleAnswer = (trait: 'risk' | 'strength') => {
    const q = demoQuestions[qIndex];
    if (trait === 'strength') {
      setScore(s => s + 50);
      speak(q.insights.strength, 'celebrating', 4000);
    } else {
      speak(q.insights.risk, 'warning', 4000);
    }

    setTimeout(() => {
      if (qIndex < demoQuestions.length - 1) {
        setQIndex(prev => prev + 1);
      } else {
        setStep('milestone');
        speak("Phase Complete. Compiling snapshot...", 'thinking', 2000);
      }
    }, 4500);
  };

  return (
    <main className="min-h-screen bg-black text-white font-inter flex flex-col items-center justify-center p-6 overflow-hidden">
      
      {/* 🔮 THE NEURAL ORB (AVATAR) */}
      <div className="fixed bottom-12 right-12 md:bottom-24 md:right-24 z-50 flex flex-col items-end">
        
        {/* Speech Bubble */}
        <AnimatePresence mode="wait">
          {message && (
            <motion.div 
              key={message}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="mb-6 mr-4 p-4 bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl rounded-br-none max-w-xs shadow-2xl"
            >
              <p className="text-sm font-bold leading-tight italic uppercase tracking-tight text-[var(--cyan)]">
                {message}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Core */}
        <motion.div 
          animate={{
            y: [0, -20, 0],
            scale: avatarState === 'thinking' ? [1, 1.2, 1] : 1,
            rotate: avatarState === 'thinking' ? [0, 180, 360] : 0
          }}
          transition={{
            y: { repeat: Infinity, duration: 4, ease: "easeInOut" },
            rotate: { repeat: Infinity, duration: 2, ease: "linear" }
          }}
          className={`w-32 h-32 rounded-full relative flex items-center justify-center transition-all duration-700 shadow-glow ${
            avatarState === 'warning' ? 'bg-orange-500/20 shadow-orange-500/40' : 
            avatarState === 'celebrating' ? 'bg-green-500/20 shadow-green-500/40' : 
            'bg-[var(--cyan)]/20 shadow-[var(--cyan)]/40'
          }`}
        >
          {/* Inner Core Pulsing */}
          <motion.div 
             animate={{ opacity: [0.4, 1, 0.4] }}
             transition={{ repeat: Infinity, duration: 2 }}
             className={`w-16 h-16 rounded-full border-2 ${
                avatarState === 'warning' ? 'border-orange-400 bg-orange-400/30' : 
                avatarState === 'celebrating' ? 'border-green-400 bg-green-400/30' : 
                'border-[var(--cyan)] bg-[var(--cyan)]/30'
             }`}
          />
          {/* Orbiting Ring */}
          <div className={`absolute inset-0 rounded-full border border-dashed animate-spin-slow ${
              avatarState === 'warning' ? 'border-orange-200/40' : 'border-[var(--cyan)]/40'
          }`} />
        </motion.div>
      </div>

      {/* ─── UI LAYERS ─── */}
      <div className="max-w-4xl w-full z-10">
        
        {step === 'intro' && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-12"
          >
             <h1 className="text-6xl md:text-8xl font-grotesk font-black uppercase italic tracking-tighter leading-none">
               Meet The <span className="text-[var(--cyan)]">Auditor</span>
             </h1>
             <div className="space-y-6">
                <p className="text-white/40 font-mono tracking-[4px] uppercase text-sm">Experimental Interface v0.1</p>
                <button 
                  onClick={() => setStep('audit')}
                  className="px-12 py-5 bg-[var(--cyan)] text-black font-black uppercase text-xl hover:scale-105 transition-transform"
                >
                  Initiate Link
                </button>
             </div>
          </motion.div>
        )}

        {step === 'audit' && (
          <motion.div className="space-y-12">
            <div className="space-y-4">
              <div className="font-mono text-[var(--cyan)] text-xs tracking-[8px] uppercase">{demoQuestions[qIndex].phase}</div>
              <h2 className="text-4xl md:text-7xl font-grotesk font-black uppercase leading-[0.9] text-white">
                {demoQuestions[qIndex].text}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
               {demoQuestions[qIndex].options.map((opt, i) => (
                 <button 
                    key={i}
                    onClick={() => handleAnswer(opt.trait as 'risk' | 'strength')}
                    className="p-8 bg-white/5 border border-white/10 text-left hover:bg-white/10 hover:border-[var(--cyan)] transition-all group"
                 >
                    <div className="text-lg font-bold text-white uppercase font-mono mb-2">Option {opt.label}</div>
                    <div className="text-2xl font-bold uppercase tracking-tight text-white/70 group-hover:text-white">{opt.text}</div>
                 </button>
               ))}
            </div>
          </motion.div>
        )}

        {step === 'milestone' && (
          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="text-center space-y-8 bg-[var(--cyan)]/5 p-20 border border-[var(--cyan)]/20 backdrop-blur-3xl rounded-3xl"
          >
             <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-12">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  className="h-full bg-[var(--cyan)] shadow-glow"
                />
             </div>
             <h2 className="text-7xl font-grotesk font-black uppercase tracking-tighter">Foundation Complete</h2>
             <p className="text-xl text-[var(--cyan)] font-bold uppercase tracking-widest italic">
               You are outperforming 72% of the industry in this quadrant.
             </p>
             <button 
                onClick={() => window.location.reload()}
                className="mt-10 px-8 py-4 border border-[var(--cyan)] text-[var(--cyan)] font-bold uppercase hover:bg-[var(--cyan)] hover:text-black transition-all"
             >
               Restart Simulation
             </button>
          </motion.div>
        )}

      </div>

      {/* Grid Pattern BG */}
      <div className="fixed inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(var(--cyan) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

    </main>
  );
}
