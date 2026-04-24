'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Persona = 'oracle' | 'bot' | 'strategist';

export default function AvatarSelector() {
  const [persona, setPersona] = useState<Persona>('strategist');
  const [state, setState] = useState<'idle' | 'warning' | 'success'>('idle');

  // ─── AVATAR COMPONENTS ───

  const Oracle = () => (
    <motion.div 
      animate={{ 
        scale: state === 'idle' ? [1, 1.05, 1] : state === 'warning' ? [1, 1.15, 1] : 1,
        filter: state === 'warning' ? 'hue-rotate(180deg)' : 'hue-rotate(0deg)'
      }}
      transition={{ repeat: Infinity, duration: 4 }}
      className="relative w-40 h-40"
    >
      <div className="absolute inset-0 bg-[var(--cyan)]/20 rounded-full blur-2xl" />
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
        className="absolute inset-0 border-2 border-dashed border-[var(--cyan)]/40 rounded-full" 
      />
      <div className="absolute inset-4 rounded-full border-4 border-[var(--cyan)] flex items-center justify-center overflow-hidden">
        <motion.div 
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-full h-full bg-gradient-to-t from-[var(--cyan)] to-transparent"
        />
      </div>
    </motion.div>
  );

  const Bot = () => (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <div className={`absolute inset-0 rounded-3xl border-2 transition-all duration-500 ${state === 'warning' ? 'border-orange-500 bg-orange-500/5' : 'border-[var(--cyan)] bg-[var(--cyan)]/5'}`} />
      <div className="relative z-10 text-center">
         <motion.div 
           animate={{ y: [0, -5, 0] }}
           transition={{ repeat: Infinity, duration: 2 }}
           className={`w-20 h-10 border-4 rounded-full mb-2 ${state === 'warning' ? 'border-orange-400' : 'border-[var(--cyan)]'}`}
         >
            <motion.div 
              animate={{ x: [-20, 20, -20] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className={`h-full w-4 mx-auto bg-white/80 blur-sm pointer-events-none`}
            />
         </motion.div>
         <div className="flex gap-1 justify-center">
            <div className="w-1 h-4 bg-white/20" />
            <div className="w-1 h-6 bg-white/40" />
            <div className="w-1 h-4 bg-white/20" />
         </div>
      </div>
    </div>
  );

  const Strategist = () => (
    <div className="relative w-40 h-56 flex items-end justify-center perspective-1000">
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            filter: state === 'warning' ? 'sepia(1) hue-rotate(300deg)' : 'none'
          }}
          className="relative z-10 w-32 h-48"
        >
          {/* Holographic Silhouette (SVG) */}
          <svg viewBox="0 0 100 150" className="w-full h-full">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'var(--cyan)', stopOpacity: 0.8 }} />
                <stop offset="100%" style={{ stopColor: 'var(--cyan)', stopOpacity: 0 }} />
              </linearGradient>
            </defs>
            <path 
              d="M50 10 C35 10 30 25 30 35 C30 50 40 55 40 65 L20 70 L15 150 L85 150 L80 70 L60 65 C60 55 70 50 70 35 C70 25 65 10 50 10" 
              fill="url(#grad1)"
              stroke="var(--cyan)"
              strokeWidth="0.5"
              className="animate-pulse"
            />
            {/* Grid Lines */}
            {Array.from({length: 10}).map((_, i) => (
              <line key={i} x1="0" y1={i * 15} x2="100" y2={i * 15} stroke="white" strokeOpacity="0.05" strokeWidth="0.2" />
            ))}
          </svg>
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-[var(--cyan)]/10 blur-3xl rounded-full" />
    </div>
  );

  return (
    <main className="min-h-screen bg-[#050505] text-white p-10 flex flex-col font-inter overflow-hidden">
      
      {/* ─── HEADER ─── */}
      <div className="flex justify-between items-center mb-20">
        <div className="font-grotesk font-black text-2xl italic tracking-tighter uppercase">
          AiGEN<span className="text-[var(--cyan)]">iQ</span> <span className="text-sm border border-white/20 px-3 py-1 ml-4 rounded font-mono font-normal tracking-normal not-italic opacity-50 uppercase">Lab: Persona Selector</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-20 items-center max-w-7xl mx-auto w-full">
        
        {/* LEFT: THE INTERFACE PREVIEW */}
        <div className="space-y-12 relative animate-fade-in">
           <div className="space-y-4">
              <div className="font-mono text-[var(--cyan)] text-xs tracking-[10px] uppercase">Simulation Stage 01</div>
              <h1 className="text-6xl font-grotesk font-black uppercase leading-none italic tracking-tight">
                Evaluate Your <br/> <span className="text-white/40">Data Integrity</span>
              </h1>
           </div>

           <div className="p-8 border border-white/10 bg-white/5 backdrop-blur-3xl rounded-2xl space-y-6">
              <p className="text-xl font-bold uppercase tracking-tight text-white/80">Question: How centralized is your critical business knowledge?</p>
              <div className="grid grid-cols-1 gap-3">
                 <button 
                  onMouseEnter={() => setState('warning')} 
                  onMouseLeave={() => setState('idle')}
                  className="p-4 border border-white/20 bg-white/5 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all text-left uppercase text-sm font-black"
                 >
                   Option A: Dispersed/Siloed (Simulate Risk)
                 </button>
                 <button 
                  onMouseEnter={() => setState('success')} 
                  onMouseLeave={() => setState('idle')}
                  className="p-4 border border-white/20 bg-white/5 hover:border-[var(--cyan)] hover:bg-[var(--cyan)]/5 transition-all text-left uppercase text-sm font-black"
                 >
                   Option B: Centralized (Simulate Excellence)
                 </button>
              </div>
           </div>

           <div className="flex gap-4">
              {(['oracle', 'bot', 'strategist'] as Persona[]).map(p => (
                <button 
                  key={p}
                  onClick={() => setPersona(p)}
                  className={`px-6 py-3 font-mono text-[10px] uppercase tracking-widest border transition-all ${persona === p ? 'bg-[var(--cyan)] border-[var(--cyan)] text-black font-black' : 'border-white/20 text-white/40 hover:border-white/60'}`}
                >
                  {p}
                </button>
              ))}
           </div>
        </div>

        {/* RIGHT: THE AVATAR DISPLAY */}
        <div className="flex flex-col items-center justify-center relative min-h-[500px]">
           <div className="absolute inset-0 bg-[var(--cyan)]/5 rounded-full blur-[150px] animate-pulse" />
           
           <div className="relative z-10 transition-all duration-700 transform scale-[1.5]">
              {persona === 'oracle' && <Oracle />}
              {persona === 'bot' && <Bot />}
              {persona === 'strategist' && <Strategist />}
           </div>

           <div className="mt-20 text-center space-y-4 max-w-sm">
              <div className="font-mono text-[var(--cyan)] text-xs uppercase tracking-widest">Active Presence</div>
              <p className="text-white/40 text-xs italic uppercase leading-relaxed font-bold tracking-tight">
                {persona === 'oracle' ? 'The Oracle offers unbiased computational analysis driven by deep neural patterns.' :
                 persona === 'bot' ? 'The Implementation Bot identifies technical bottlenecks and process optimizations.' :
                 'The Digital Strategist bridges executive-level strategy with cutting-edge AI capability.'}
              </p>
           </div>
        </div>

      </div>

      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .animate-spin-slow { animation: spin 20s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-fade-in { animation: fadeIn 1s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

    </main>
  );
}
