'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sector, SECTOR_LABELS, AnswerValue, Answers, ContextAnswers } from '../../../types';
import { contextQuestions, buildQuestionSet } from '../../../lib/config/questions.config';
import { evaluateBranching } from '../../../lib/engine/branch';
import { calculateScore } from '../../../lib/engine/score';
import { selectRecommendations, buildPriorityMatrix } from '../../../lib/engine/recommend';
import { getLiveBenchmark, BenchmarkData } from '../../../lib/engine/benchmark';
import OracleAvatar from '../../../components/OracleAvatar';

type Phase = 'intro' | 'context' | 'assessment' | 'milestone' | 'complete';

export default function AssessmentPage() {
    const params = useParams();
    const router = useRouter();
    const sector = params.sector as Sector;
    const sectorLabel = SECTOR_LABELS[sector] || sector;

    // State
    const [phase, setPhase] = useState<Phase>('intro');
    const [contextIndex, setContextIndex] = useState(0);
    const [contextAnswersState, setContextAnswersState] = useState<Record<string, string | string[]>>({});
    const [answers, setAnswers] = useState<Answers>({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [animating, setAnimating] = useState(false);
    const [showTip, setShowTip] = useState(false);
    const [currentTip, setCurrentTip] = useState('');
    const [oracleState, setOracleState] = useState<'idle' | 'warning' | 'thinking' | 'success'>('idle');
    const [benchmark, setBenchmark] = useState<BenchmarkData>({ averageScore: 35, count: 0, percentile: 50 });

    // Load specialized question set for this sector
    const allQuestions = useMemo(() => buildQuestionSet(sector), [sector]);

    // Handle Sector question skip
    const filteredContextQuestions = useMemo(() => 
        contextQuestions.filter(q => q.id !== 'C-Q1'),
    [contextQuestions]);

    // Get visible questions based on branching
    const { visibleQuestions } = useMemo(
        () => evaluateBranching(allQuestions, answers),
        [allQuestions, answers]
    );

    // Current question
    const currentContextQ = filteredContextQuestions[contextIndex];
    const currentScoredQ = visibleQuestions[currentQuestionIndex];

    // Progress calculation
    // const totalContextQs = filteredContextQuestions.length;
    const totalScoredQs = visibleQuestions.length;
    
    // Overall Progress %
    /* const overallProgress = phase === 'context'
        ? (contextIndex / (totalContextQs + totalScoredQs)) * 100
        : phase === 'assessment'
            ? ((totalContextQs + currentQuestionIndex) / (totalContextQs + totalScoredQs)) * 100
            : 100; */

    // Phase Labels based on Power 25 structure
    const getPhaseLabel = () => {
        if (phase === 'intro') return 'CONNECTING...';
        if (phase === 'context') return '00: THE SETUP';
        if (currentQuestionIndex < 5) return '01: FOUNDATIONS';
        if (currentQuestionIndex < 10) return '02: STRATEGY & RISK';
        if (currentQuestionIndex < 16) return '03: ADOPTION & TECH';
        return '04: VALUE & VISION';
    };

    // Fetch live benchmarks on load
    useEffect(() => {
        getLiveBenchmark(sector, 0).then(setBenchmark);
    }, [sector]);
    
    // Calculate a "Live Readiness Score" for the gamified meter
    const liveScore = useMemo(() => {
        if (Object.keys(answers).length === 0) return 0;
        const result = calculateScore(answers, sector);
        return result.finalScore * 10; // 0-100 scale
    }, [answers, sector]);

    // ─── CONTEXT ANSWER HANDLER ───
    const handleContextAnswer = useCallback((answer: string | string[]) => {
        setContextAnswersState(prev => ({
            ...prev,
            [currentContextQ.id]: answer,
        }));

        setAnimating(true);
        setTimeout(() => {
            if (contextIndex < filteredContextQuestions.length - 1) {
                setContextIndex(prev => prev + 1);
            } else {
                setPhase('assessment');
            }
            setAnimating(false);
        }, 400);
    }, [contextIndex, currentContextQ, filteredContextQuestions.length]);

    // ─── UPGRADED INSIGHT ENGINE (THE BRAIN) ───
    const getTipForAnswer = (dim: string, letter: string, sector: Sector) => {
        const baseTips: Record<string, string> = {
            'D1_A': 'Critical: Knowledge silos are costing you 20%+ in productivity. AI can bridge this gap.',
            'D1_D': 'Excellent: You have the "Data Moat" required for high-end custom AI training.',
            'D2_A': 'Warning: 70% of AI projects fail without a dedicated owner. You need an AI Lead.',
            'D2_D': 'Elite Tier: Leadership-led AI adoption is the strongest predictor of long-term ROI.',
            'D3_A': 'Security Alert: "Shadow AI" is your biggest risk. Employees are likely inputting client data into public tools.',
            'D3_D': 'Safety First: Having an AI Policy allows your team to innovate without risking your IP.',
            'D4_A': 'Cultural Gap: Upskilling is faster than hiring. Start an internal AI Champions program.',
            'D5_A': 'Process Block: AI cannot automate what is not documented. Map your workflows first.',
            'D6_A': 'Passive Phase: Basic tool usage (ChatGPT) is just the start. Integrated AI is where the value is.',
            'D8_A': 'Value Leak: Without an ROI framework, you are spending on AI, not investing in it.'
        };

        // Sector-Specific Overrides (The "Gold" Insights)
        const sectorOverrides: Record<string, Record<string, string>> = {
            'creative_agency': {
                'D1_A': 'Agency Alert: Your project archives are a goldmine. Without centralizing them, you are losing billable speed.',
                'D6_A': 'Creative Edge: Generative AI can cut asset production time by 40%. Start with repetitive edits.',
            },
            'professional_services': {
                'D1_A': 'Consultant Risk: Your institutional knowledge is walking out the door whenever a senior partner leaves.',
                'D3_A': 'Regulator Warning: Professional services are under scrutiny for AI data bias. Ensure local storage.',
            },
            'tech_software': {
                'D5_A': 'Dev Warning: Process debt is AI debt. Clean your documentation before deploying AI agents.',
                'D7_A': 'Legacy Load: Outdated APIs will choke your AI innovation. Focus on integration first.',
            }
        };

        const tip = sectorOverrides[sector]?.[`${dim}_${letter}`] || baseTips[`${dim}_${letter}`] || 'Insight Logged: This data point is critical for your 90-day roadmap.';
        return tip;
    };

    // ─── SCORED ANSWER HANDLER ───
    const handleScoredAnswer = useCallback((answer: AnswerValue) => {
        const qId = currentScoredQ.id;
        const newAnswers = { ...answers, [qId]: answer };
        
        // Trigger Oracle Thinking
        setOracleState('thinking');
        
        setAnswers(newAnswers);
        const tip = getTipForAnswer(currentScoredQ.dimensionId, answer, sector);
        setCurrentTip(tip);
        setShowTip(true);

        // Analyze sentiment (Warning vs Success)
        if (answer === 'A') setOracleState('warning');
        else if (answer === 'D') setOracleState('success');
        else setOracleState('idle');

        // Pause to show the tip (Gamification)
        setTimeout(() => {
            setShowTip(false);
            setAnimating(true);
            setOracleState('thinking');
            
            setTimeout(() => {
                const { visibleQuestions: newVisible } = evaluateBranching(allQuestions, newAnswers);

                // Check for Phase Complete (Milestone)
                const currentPhase = getPhaseLabel();
                
                if (currentQuestionIndex < newVisible.length - 1) {
                    setCurrentQuestionIndex(prev => prev + 1);
                    
                    // Transition to Milestone if phase just changed
                    // (Logic: If next question is 5, 10, or 16 - based on getPhaseLabel)
                    const nextQIndex = currentQuestionIndex + 1;
                    if (nextQIndex === 5 || nextQIndex === 10 || nextQIndex === 16) {
                        setPhase('milestone');
                        setOracleState('success');
                    }
                } else {
                    // AUDIT COMPLETE - PERSIST & REPORT
                    const scoreResult = calculateScore(newAnswers, sector);
                    const ctx: ContextAnswers = {
                        sector,
                        companySize: contextAnswersState['C-Q2'] as string || '',
                        aiToolsUsed: (contextAnswersState['C-Q3'] as string[]) || [],
                        priorityAreas: (contextAnswersState['C-Q4'] as string[]) || [],
                        respondentRole: contextAnswersState['C-Q5'] as string || '',
                    };

                    const cards = selectRecommendations(scoreResult, ctx);
                    const matrix = buildPriorityMatrix(scoreResult, sector);

                    sessionStorage.setItem('aigeniq_score', JSON.stringify(scoreResult));
                    sessionStorage.setItem('aigeniq_context', JSON.stringify(ctx));
                    sessionStorage.setItem('aigeniq_answers', JSON.stringify(newAnswers));
                    sessionStorage.setItem('aigeniq_cards', JSON.stringify(cards));
                    sessionStorage.setItem('aigeniq_matrix', JSON.stringify(matrix));

                    setPhase('complete');
                    router.push('/results');
                }
                setAnimating(false);
                setOracleState('idle');
            }, 400);
        }, 1200); 
    }, [currentScoredQ, currentQuestionIndex, answers, sector, contextAnswersState, router, allQuestions]);

    return (
        <main className="min-h-screen bg-black flex flex-col md:flex-row overflow-hidden font-inter">
            {/* LEFT SIDEBAR: Gamified Meter */}
            <div className="w-full md:w-[350px] border-r border-white/10 p-10 flex flex-col justify-between bg-[#050505] z-20">
                <div>
                     <div className="mb-12">
                        <div className="wordmark font-mono font-bold text-[26px] tracking-[-1px] text-white">
                            Ai<span className="text-[var(--cyan)]">GEN</span>iQ
                        </div>
                        <div className="strapline font-grotesk text-[11px] text-white/40 mt-[3px] uppercase tracking-widest">
                            Making AI work for you.
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <div className="text-[10px] font-mono text-white/40 uppercase tracking-[4px] mb-2">Phase Indicator</div>
                            <div className="text-xl font-grotesk font-black text-[var(--cyan)] uppercase leading-none shadow-glow">{getPhaseLabel()}</div>
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-3">
                                <div className="text-[10px] font-mono text-white/40 uppercase tracking-[4px]">Readiness Meter</div>
                                <div className="text-2xl font-grotesk font-black text-white">{Math.round(liveScore)}%</div>
                            </div>
                            <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden p-1 border border-white/10 relative">
                                {/* Industry Average Marker */}
                                <div 
                                    className="absolute top-0 bottom-0 w-0.5 bg-white/40 z-10 transition-all duration-1000"
                                    style={{ left: `${benchmark.averageScore}%` }}
                                >
                                    <div className="absolute -top-4 -translate-x-1/2 text-[8px] font-mono text-white/30 whitespace-nowrap uppercase">Avg: {benchmark.averageScore}%</div>
                                </div>
                                
                                <div 
                                    className="h-full bg-gradient-to-r from-[var(--cyan)] to-[var(--green)] rounded-full shadow-[0_0_15px_rgba(0,255,255,0.4)] transition-all duration-1000 ease-out"
                                    style={{ width: `${Math.max(liveScore, 5)}%` }}
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-white/5 border border-white/5 rounded">
                            <div className="text-[9px] font-mono text-white/30 uppercase mb-2">Sector Pulse</div>
                            <div className="text-[10px] font-grotesk font-bold text-white uppercase opacity-70">
                                {benchmark.count > 0 ? `${benchmark.count} ${sectorLabel} firms audited` : 'Initializing Industry Data'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-left">
                    <div className="text-[10px] font-mono text-white/20 uppercase mb-4 tracking-[2px]">Evaluating {sectorLabel}</div>
                    <div className="flex gap-2">
                        {Array.from({ length: totalScoredQs }).map((_, i) => (
                            <div 
                                key={i} 
                                className={`h-1 flex-1 transition-all duration-500 ${i < currentQuestionIndex ? 'bg-[var(--cyan)] shadow-[0_0_5px_var(--cyan)]' : i === currentQuestionIndex ? 'bg-white opacity-40' : 'bg-white/5'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT: Question Card */}
            <div className="flex-1 flex flex-col relative overflow-y-auto">
                <div className="absolute top-8 right-8 z-30">
                    <OracleAvatar state={oracleState} message={showTip ? currentTip : (phase === 'intro' ? 'Awaiting System Link...' : '')} />
                </div>

                {/* Visual Background Elements */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--cyan)]/5 rounded-full blur-[150px] -mr-[300px] -mt-[300px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--green)]/5 rounded-full blur-[120px] -ml-[200px] -mb-[200px]" />

                <div className="flex-1 flex items-center justify-center p-6 md:p-20 relative z-10">
                    <div className={`max-w-xl w-full transition-all duration-700 ${animating ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'}`}>
                        
                        {phase === 'milestone' && (
                            <div className="text-center space-y-12">
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-4"
                                >
                                    <div className="font-mono text-[var(--cyan)] text-xs tracking-[8px] uppercase">Section Snapshot</div>
                                    <h2 className="text-5xl md:text-7xl font-grotesk font-black uppercase leading-[0.9] text-white">
                                        PHASE <br/> <span className="text-[var(--cyan)]">COMPLETE</span>
                                    </h2>
                                    <p className="text-white/60 font-mono tracking-widest text-sm uppercase">Evaluation Logged Successfully</p>
                                </motion.div>

                                <div className="p-8 bg-white/5 border border-white/10 rounded-2xl space-y-6">
                                    <div className="flex justify-between items-center text-xs font-mono text-white/40 uppercase">
                                        <span>Current Maturity</span>
                                        <span className="text-[var(--cyan)] font-black">{Math.round(liveScore)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${liveScore}%` }}
                                            className="h-full bg-[var(--cyan)]"
                                        />
                                    </div>
                                    <p className="text-sm font-bold italic text-white/80 leading-snug">
                                        &quot;Your Foundations are solidifying. We have identified core competitive advantages in your {sectorLabel} data structure. Ready for the next layer.&quot;
                                    </p>
                                </div>
                                
                                <button 
                                    onClick={() => {
                                        setAnimating(true);
                                        setTimeout(() => {
                                            setPhase('assessment');
                                            setAnimating(false);
                                            setOracleState('idle');
                                        }, 800);
                                    }}
                                    className="px-12 py-5 bg-[var(--cyan)] text-black font-black uppercase text-xl hover:scale-105 transition-transform"
                                >
                                    Next Phase →
                                </button>
                            </div>
                        )}

                        {phase === 'intro' && (
                            <div className="text-center space-y-12">
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-6"
                                >
                                    <h1 className="text-6xl md:text-8xl font-grotesk font-black uppercase italic tracking-tighter leading-none text-white">
                                        The <span className="text-[var(--cyan)]">Oracle</span>
                                    </h1>
                                    <p className="text-white/40 font-mono tracking-[4px] uppercase text-sm">Neural Audit initialization sequence</p>
                                </motion.div>
                                
                                <button 
                                    onClick={() => {
                                        setAnimating(true);
                                        setTimeout(() => {
                                            setPhase('context');
                                            setAnimating(false);
                                        }, 800);
                                    }}
                                    className="px-12 py-5 bg-[var(--cyan)] text-black font-black uppercase text-xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(0,255,255,0.3)]"
                                >
                                    Connect Brain
                                </button>
                            </div>
                        )}

                        {/* PHASE: CONTEXT */}
                        {phase === 'context' && currentContextQ && (
                            <div className="space-y-10 animate-fade-in-up">
                                <div className="space-y-4">
                                    <div className="font-mono text-xs text-[var(--cyan)] uppercase tracking-[5px]">IDENTIFICATION: {currentContextQ.id}</div>
                                    <h2 className="text-3xl md:text-5xl font-grotesk font-black uppercase leading-[0.9] text-white tracking-tighter">
                                        {currentContextQ.text}
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    {currentContextQ.isMultiSelect ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {currentContextQ.options.map((opt, i) => (
                                                    <button 
                                                        key={i}
                                                        onClick={() => {
                                                            const max = currentContextQ.maxSelections || 10;
                                                            const current = (contextAnswersState[currentContextQ.id] as string[]) || [];
                                                            let next;
                                                            if (current.includes(opt)) next = current.filter(x => x !== opt);
                                                            else if (current.length < max) next = [...current, opt];
                                                            else next = current;
                                                            setContextAnswersState(prev => ({...prev, [currentContextQ.id]: next}));
                                                        }}
                                                        className={`p-4 border text-left text-sm font-bold transition-all backdrop-blur-sm ${
                                                            ((contextAnswersState[currentContextQ.id] as string[]) || []).includes(opt) 
                                                            ? 'bg-[var(--cyan)] border-[var(--cyan)] text-black' 
                                                            : 'bg-white/5 border-white/10 text-white/70 hover:border-white/40'
                                                        }`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                            <button 
                                                onClick={() => handleContextAnswer((contextAnswersState[currentContextQ.id] as string[]))}
                                                disabled={!contextAnswersState[currentContextQ.id] || (contextAnswersState[currentContextQ.id] as string[]).length === 0}
                                                className="btn-primary w-full mt-6 disabled:opacity-30 disabled:cursor-not-allowed group"
                                            >
                                                LOCK OPTIONS & CONTINUE
                                                <span className="ml-3 group-hover:translate-x-2 transition-transform inline-block">→</span>
                                            </button>
                                        </div>
                                    ) : (
                                        currentContextQ.options.map((opt, i) => (
                                            <button 
                                                key={i}
                                                onClick={() => handleContextAnswer(opt)}
                                                className="group relative p-6 border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[var(--cyan)] transition-all text-left backdrop-blur-md"
                                            >
                                                <div className="text-xl font-bold uppercase tracking-tight text-white group-hover:text-[var(--cyan)] transition-colors">{opt}</div>
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-2">
                                                    <svg className="w-5 h-5 text-[var(--cyan)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                    </svg>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* PHASE: ASSESSMENT */}
                        {phase === 'assessment' && currentScoredQ && (
                            <div className="space-y-10 animate-fade-in-up">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="px-3 py-1 bg-white/10 border border-white/10 text-[var(--cyan)] font-mono text-[10px] uppercase tracking-widest">
                                            {currentScoredQ.dimensionName}
                                        </div>
                                        {showTip && (
                                            <div className="animate-bounce-in text-[10px] font-bold text-[var(--green)] uppercase tracking-wider bg-[var(--green)]/10 px-2 py-0.5 rounded border border-[var(--green)]/20">
                                                ✓ PERSPECTIVE LOGGED
                                            </div>
                                        )}
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-grotesk font-black uppercase leading-[0.95] text-white tracking-tighter">
                                        {currentScoredQ.text}
                                    </h2>
                                </div>

                                <div className="space-y-3">
                                    {(['A', 'B', 'C', 'D'] as const).map((letter) => (
                                        <button 
                                            key={letter}
                                            onClick={() => handleScoredAnswer(letter)}
                                            disabled={showTip}
                                            className={`w-full group relative p-5 border transition-all text-left flex items-center gap-6 backdrop-blur-sm ${
                                                answers[currentScoredQ.id] === letter 
                                                ? 'bg-[var(--cyan)] border-[var(--cyan)] text-black font-black' 
                                                : 'bg-white/5 border-white/10 text-white/70 hover:border-white/40 disabled:opacity-50'
                                            }`}
                                        >
                                            <div className={`w-8 h-8 flex items-center justify-center font-mono text-sm border transition-colors ${
                                                answers[currentScoredQ.id] === letter ? 'border-black/40 bg-black/10' : 'border-white/10 bg-white/5'
                                            }`}>
                                                {letter}
                                            </div>
                                            <span className="text-sm md:text-lg font-bold uppercase tracking-tight">
                                                {currentScoredQ.options[letter]}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                {/* Consultant Tip Box */}
                                <div className={`p-6 bg-white/5 border-l-4 border-[var(--green)] transition-all duration-700 overflow-hidden ${showTip ? 'max-h-[300px] opacity-100 mt-6 translate-y-0' : 'max-h-0 opacity-0 mt-0 translate-y-4'}`}>
                                    <div className="text-[10px] font-mono text-white/50 uppercase mb-2 tracking-[2px]">Consultant Insight</div>
                                    <p className="text-base font-bold text-[var(--green)] leading-tight italic uppercase tracking-tight">
                                        &quot;{currentTip}&quot;
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* FOOTER NAV */}
                <div className="p-10 border-t border-white/5 flex justify-between items-center bg-black/80 backdrop-blur-xl z-20">
                    <button 
                        onClick={() => {
                             if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1);
                             else if (phase === 'assessment') setPhase('context');
                             else if (contextIndex > 0) setContextIndex(prev => prev - 1);
                             else router.push('/');
                        }}
                        className="text-[11px] font-mono text-white/40 hover:text-[var(--cyan)] uppercase tracking-[3px] transition-colors flex items-center gap-2 group"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> [ BACK ]
                    </button>
                    <div className="text-[9px] font-mono text-white/20 uppercase tracking-[2px] hidden md:block">
                        AI MATURITY ENGINE V4.0 // ENCRYPTED SESSION
                    </div>
                </div>
            </div>
        </main>
    );
}
