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
    []);

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
        if (phase === 'milestone') {
            if (currentQuestionIndex === 0) return '00: SETUP COMPLETE';
            if (currentQuestionIndex === 5) return '01: FOUNDATIONS COMPLETE';
            if (currentQuestionIndex === 10) return '02: STRATEGY COMPLETE';
            if (currentQuestionIndex === 16) return '03: ADOPTION COMPLETE';
        }
        if (currentQuestionIndex < 5) return '01: FOUNDATIONS';
        if (currentQuestionIndex < 10) return '02: STRATEGY & RISK';
        if (currentQuestionIndex < 16) return '03: ADOPTION & TECH';
        return '04: VALUE & VISION';
    };

    // Fetch live benchmarks on load
    useEffect(() => {
        const loadBenchmark = async () => {
            try {
                // Set a timeout of 3s for live data, otherwise use 2026 generic fallback
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject('timeout'), 3000));
                const data = await Promise.race([getLiveBenchmark(sector, 0), timeoutPromise]) as BenchmarkData;
                setBenchmark(data);
            } catch (err) {
                console.warn('Benchmarking fallback active:', err);
                setBenchmark({ averageScore: 64, count: 1240, percentile: 50 }); // High-fidelity 2026 average
            }
        };
        loadBenchmark();
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
                setPhase('milestone'); // Show Milestone after Setup
                setOracleState('success');
            }
            setAnimating(false);
        }, 400);
    }, [contextIndex, currentContextQ, filteredContextQuestions.length]);

    // ─── UPGRADED INSIGHT ENGINE (THE BRAIN) ───
    const getTipForAnswer = (dim: string, letter: string, sector: Sector) => {
        // High-level dimension mappings for generic but logical fallback advice
        const dimAdvice: Record<string, string> = {
            'D1': 'data organization and knowledge management',
            'D2': 'AI leadership and accountability',
            'D3': 'data security and compliance',
            'D4': 'team culture and training',
            'D5': 'process documentation and standardisation',
            'D6': 'workflow automation and speed',
            'D7': 'software integration and tech stack',
            'D8': 'ROI measurement and profit tracking',
            'FUN': 'long-term scaling goals'
        };

        const maturityAdvice: Record<string, string> = {
            'A': 'Action Step: This is a critical vulnerability. Start by mapping out your current manual steps for ',
            'B': 'Action Step: You have started progressing, but inconsistency is holding you back. Standardize your approach to ',
            'C': 'Strategic Move: Good foundation. Your next step is to fully automate your ',
            'D': 'Elite Standard: Excellent maturity here. Focus on scaling your '
        };

        const baseTips: Record<string, string> = {
            'D1_A': 'Action Step: Before buying AI tools, consolidate your scattered files into a single, searchable drive.',
            'D1_D': 'Strategic Move: Since your data is ready, focus on connecting AI directly to your central knowledge base.',
            'D2_A': 'Action Step: Appoint a single leader accountable for AI adoption before rolling out any new software.',
            'D2_D': 'Strategic Move: Ensure your leadership team is actively tracking the profit margins generated by your AI workflows.',
            'D3_A': 'Action Step: Immediately restrict public AI tool usage for client data. Establish a secure, internal AI environment.',
            'D3_D': 'Strategic Move: Your privacy is solid. Begin expanding automated workflows to external client-facing tasks.',
            'D5_A': 'Action Step: AI cannot automate what isn\'t documented. Map out your top 3 daily processes step-by-step.',
            'D6_A': 'Action Step: Identify the most repetitive manual task your team does daily and find a specialized AI tool to automate it.',
            'D8_A': 'Action Step: Start measuring the hours saved by current AI tools to calculate your actual return on investment.',
            'D8_D': 'Strategic Move: You are scaling effectively. Reinvest saved capital into developing custom AI models for your specific niche.'
        };

        // 2026v Human-Centric Sector Overrides
        const sectorOverrides: Record<string, Record<string, string>> = {
            'creative_agency': {
                'D1_A': 'Action Step: Organize your past client assets into a structured creative archive so AI can quickly reference your brand styles.',
                'D6_A': 'Action Step: Automate your asset resizing and format generation first, as this drains the most manual creative time.',
            },
            'professional_services': {
                'D1_A': 'Action Step: Digitize your senior partners\' expertise into a firm-wide knowledge base so junior staff can query it instantly.',
                'D3_A': 'Action Step: Conduct a strict compliance audit on your current tools. Regulatory bodies penalize public AI data leaks heavily.',
            },
            'tech_software': {
                'D5_A': 'Action Step: Standardize your coding workflows and QA processes before integrating AI coding assistants.',
                'D7_A': 'Action Step: Audit your API connections. Isolated systems will bottleneck your automation efforts.',
            }
        };

        // Check overrides -> check base specific tips -> fallback to dynamic logical generation
        const tip = sectorOverrides[sector]?.[`${dim}_${letter}`] 
                 || baseTips[`${dim}_${letter}`] 
                 || `${maturityAdvice[letter] || 'Action Step: Focus on '}${dimAdvice[dim] || 'this process'}.`;
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
        if (answer === 'A') {
            setOracleState('warning');
        } else if (answer === 'D') {
            setOracleState('success');
        } else {
            setOracleState('thinking');
            setTimeout(() => setOracleState('idle'), 2000);
        }

        // Pause to show the tip (Gamification)
        setTimeout(() => {
            setShowTip(false);
            setAnimating(true);
            setOracleState('thinking');
            
            setTimeout(() => {
                const { visibleQuestions: newVisible } = evaluateBranching(allQuestions, newAnswers);

                // Check for Phase Complete (Milestone)
                if (currentQuestionIndex < newVisible.length - 1) {
                    const nextQIndex = currentQuestionIndex + 1;
                    
                    // Trigger Milestone at the END of each phase
                    // Foundations end (Q5 is index 4), Strategy end (Q10 is index 9), Adoption end (Q16 is index 15)
                    if (nextQIndex === 5 || nextQIndex === 10 || nextQIndex === 16) {
                        setPhase('milestone');
                        setOracleState('success');
                    }
                    
                    setCurrentQuestionIndex(nextQIndex);
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
                            <div className="text-xl font-grotesk font-black text-[var(--cyan)] uppercase leading-none shadow-glow">{getPhaseLabel()}</div>
                        </div>

                        {/* Persistent Expert Insights */}
                        <AnimatePresence mode="wait">
                            {currentTip && (
                                <motion.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="p-4 bg-[var(--cyan)]/5 border-l-2 border-[var(--cyan)] rounded-r-lg space-y-2 translate-y-2"
                                >
                                    <div className="text-[9px] font-mono text-[var(--green)] uppercase tracking-[3px] font-bold">Consultant Insight</div>
                                    <p className="text-xs font-bold text-white/90 leading-relaxed uppercase tracking-tight">
                                        &quot;{currentTip}&quot;
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

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
                    <OracleAvatar state={oracleState} message={
                        phase === 'intro' ? 'Awaiting System Initialization...' : 
                        phase === 'milestone' ? (
                            currentQuestionIndex < 5 ? "Next: Foundations. We will evaluate how well your data is organized for AI. Be honest about your current setup." :
                            currentQuestionIndex < 10 ? "Next: Strategy & Risk. We will assess your leadership policies. Only answer what is officially documented." :
                            currentQuestionIndex < 16 ? "Next: Adoption & Tech. We will look at your team's current tool usage and tech stack readiness." :
                            "Final Stage: Value & Vision. We will analyze your profit metrics and long-term scaling strategy."
                        ) : ''
                    } />
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
                                    <div className="space-y-4">
                                        <p className="text-sm font-bold text-white/80 leading-snug">
                                            {currentQuestionIndex < 5 ? "Setup complete. Your firm profile has been logged." :
                                             currentQuestionIndex < 10 ? "Foundations Phase Complete. Core competencies identified." :
                                             currentQuestionIndex < 16 ? "Strategy & Risk Logged. Governance patterns mapped." :
                                             "Adoption Phase Verified. Tooling and cultural readiness assessed."}
                                        </p>
                                        <div className="p-3 bg-[var(--cyan)]/10 border border-[var(--cyan)]/30 rounded text-center">
                                            <span className="text-xs font-mono text-[var(--cyan)] uppercase tracking-wider block mb-1">Up Next</span>
                                            <strong className="text-white text-sm uppercase">
                                                {currentQuestionIndex < 5 ? "Phase 01: Foundations Audit" :
                                                 currentQuestionIndex < 10 ? "Phase 02: Strategy & Risk" :
                                                 currentQuestionIndex < 16 ? "Phase 03: Adoption & Tech" :
                                                 "Final Phase: Value & Vision"}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => {
                                        setAnimating(true);
                                        setTimeout(() => {
                                            if (phase === 'milestone' && contextIndex === filteredContextQuestions.length - 1 && currentQuestionIndex === 0) {
                                                setPhase('assessment');
                                            } else {
                                                setPhase('assessment');
                                            }
                                            setAnimating(false);
                                            setOracleState('idle');
                                        }, 800);
                                    }}
                                    className="px-12 py-5 bg-[var(--cyan)] text-black font-black uppercase text-xl hover:scale-105 transition-transform"
                                >
                                    Continue →
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
                                    <h1 className="text-6xl md:text-8xl font-grotesk font-black uppercase tracking-tighter leading-none text-white">
                                        AiGENiQ <span className="text-[var(--cyan)]">Engine</span>
                                    </h1>
                                    <p className="text-white/40 font-mono tracking-[4px] uppercase text-sm">Readiness assessment initialization sequence</p>
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
                                    Begin Audit
                                </button>
                            </div>
                        )}

                        {/* PHASE: CONTEXT */}
                        {phase === 'context' && currentContextQ && (
                            <div className="space-y-10 animate-fade-in-up">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-4">
                                        <span className="text-white/40 text-[10px] font-mono uppercase tracking-[4px]">IDENTIFICATION • STEP {contextIndex + 1} OF {filteredContextQuestions.length}</span>
                                    </div>
                                    <h2 className="text-4xl md:text-6xl font-grotesk font-black uppercase text-white leading-[0.95] tracking-tighter">
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
                                                className="group relative p-6 border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[var(--cyan)] hover:shadow-cyan-glow transition-all text-left backdrop-blur-md rounded-sm"
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
                                            {getPhaseLabel()} • STEP {currentQuestionIndex + 1} OF 21
                                        </div>
                                        <div className="text-white/20 font-mono text-[10px] uppercase tracking-[4px]">
                                            {currentScoredQ.dimensionName}
                                        </div>
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
                                            className={`w-full group relative p-5 border transition-all duration-300 text-left flex items-center gap-6 backdrop-blur-sm rounded-sm ${
                                                answers[currentScoredQ.id] === letter 
                                                ? 'bg-[var(--cyan)] border-[var(--cyan)] text-black font-black shadow-cyan-glow-strong scale-[1.02]' 
                                                : 'bg-white/5 border-white/10 text-white/70 hover:border-[var(--cyan)] hover:shadow-cyan-glow hover:translate-x-1 disabled:opacity-50'
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

                                {/* Insight Box Removed from Main Content */}
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
                        AI MATURITY ENGINE // SECURE SESSION
                    </div>
                </div>
            </div>
        </main>
    );
}
