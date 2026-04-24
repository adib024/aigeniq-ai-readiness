'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface OracleAvatarProps {
  state?: 'idle' | 'warning' | 'thinking' | 'success';
  message?: string;
}

export default function OracleAvatar({ state = 'idle', message }: OracleAvatarProps) {
  return (
    <div className="flex flex-col items-center pointer-events-none">
      
      {/* Speech/Insight Bubble */}
      <AnimatePresence mode="wait">
        {message && (
          <motion.div 
            key={message}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="mb-8 p-4 bg-black/40 border border-white/10 backdrop-blur-xl rounded-2xl max-w-xs shadow-2xl relative"
          >
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-black/40 border-r border-b border-white/10 rotate-45" />
            <p className="text-[11px] font-bold leading-tight italic uppercase tracking-wider text-[var(--cyan)] text-center">
              {message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Oracle Orb */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Outer Glow */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ repeat: Infinity, duration: 4 }}
          className={`absolute inset-0 rounded-full blur-3xl transition-colors duration-1000 ${
            state === 'warning' ? 'bg-orange-500' : 'bg-[var(--cyan)]'
          }`}
        />

        {/* Orbiting Ring 1 */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          className={`absolute inset-0 border border-dashed rounded-full transition-colors duration-1000 ${
            state === 'warning' ? 'border-orange-500/40' : 'border-[var(--cyan)]/40'
          }`}
        />

        {/* Orbiting Ring 2 */}
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
          className={`absolute inset-4 border border-white/5 rounded-full`}
        />

        {/* The Core */}
        <motion.div 
          animate={{ 
            scale: state === 'thinking' ? [1, 1.1, 1] : 1,
            boxShadow: state === 'warning' ? '0 0 30px rgba(249, 115, 22, 0.4)' : '0 0 30px rgba(0, 255, 255, 0.4)'
          }}
          className={`relative z-10 w-16 h-16 rounded-full border-2 flex items-center justify-center overflow-hidden transition-colors duration-1000 ${
            state === 'warning' ? 'border-orange-400 bg-orange-400/20' : 'border-[var(--cyan)] bg-[var(--cyan)]/20'
          }`}
        >
          <motion.div 
            animate={{ 
              opacity: [0.3, 1, 0.3],
              y: state === 'thinking' ? [-20, 20, -20] : 0
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`w-full h-full bg-gradient-to-t from-transparent via-white/20 to-transparent`}
          />
          {/* Internal Pulse */}
          <motion.div 
            animate={{ scale: [0.8, 1.2, 0.8] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className={`w-4 h-4 rounded-full blur-sm ${
                state === 'warning' ? 'bg-orange-300' : 'bg-white'
            }`}
          />
        </motion.div>
      </div>

    </div>
  );
}
