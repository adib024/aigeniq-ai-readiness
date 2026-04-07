'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sector, SECTOR_LABELS, AnswerValue, Answers, ContextAnswers, DimensionId } from '../../../types';
import { contextQuestions, buildQuestionSet } from '../../../lib/config/questions.config';
import { evaluateBranching } from '../../../lib/engine/branch';
import { calculateScore } from '../../../lib/engine/score';
import { selectRecommendations, buildPriorityMatrix } from '../../../lib/engine/recommend';

type Phase = 'context' | 'assessment' | 'complete';

export default function AssessmentPage() {
    const params = useParams();
    const router = useRouter();
    const sector = params.sector as Sector;
    const sectorLabel = SECTOR_LABELS[sector] || sector;

    // State
    const [phase, setPhase] = useState<Phase>('context');
    const [contextIndex, setContextIndex] = useState(0);
    const [contextAnswersState, setContextAnswersState] = useState<Record<string, string | string[]>>({});
    const [answers, setAnswers] = useState<Answers>({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [animating, setAnimating] = useState(false);

    // Build sector-specific question set
    const allQuestions = useMemo(() => buildQuestionSet(sector), [sector]);

    // Get visible questions based on branching
    const { visibleQuestions } = useMemo(
        () => evaluateBranching(allQuestions, answers),
        [allQuestions, answers]
    );

    // Current question
    const currentContextQ = contextQuestions[contextIndex];
    const currentScoredQ = visibleQuestions[currentQuestionIndex];

    // Progress calculation
    const totalContextQs = contextQuestions.length;
    const totalScoredQs = visibleQuestions.length;
    const overallProgress = phase === 'context'
        ? (contextIndex / (totalContextQs + totalScoredQs)) * 100
        : phase === 'assessment'
            ? ((totalContextQs + currentQuestionIndex) / (totalContextQs + totalScoredQs)) * 100
            : 100;

    // Get the current dimension info for the progress display
    const currentDimension = currentScoredQ?.dimensionName || '';
    const currentDimId = currentScoredQ?.dimensionId || '';

    // ─── CONTEXT ANSWER HANDLER ───
    const handleContextAnswer = useCallback((answer: string | string[]) => {
        setContextAnswersState(prev => ({
            ...prev,
            [currentContextQ.id]: answer,
        }));

        setAnimating(true);
        setTimeout(() => {
            if (contextIndex < contextQuestions.length - 1) {
                setContextIndex(prev => prev + 1);
            } else {
                setPhase('assessment');
            }
            setAnimating(false);
        }, 300);
    }, [contextIndex, currentContextQ]);

    // ─── SCORED ANSWER HANDLER ───
    const handleScoredAnswer = useCallback((answer: AnswerValue) => {
        const qId = currentScoredQ.id;
        const newAnswers = { ...answers, [qId]: answer };

        // If this is a branch parent and answer is A, auto-score children
        if (currentScoredQ.isBranchParent && answer === 'A') {
            (currentScoredQ.childQuestions || []).forEach(childId => {
                newAnswers[childId] = 'SKIPPED';
            });
        }

        // If branch parent answer changes from A to something else, un-skip children
        if (currentScoredQ.isBranchParent && answer !== 'A') {
            (currentScoredQ.childQuestions || []).forEach(childId => {
                if (newAnswers[childId] === 'SKIPPED') {
                    delete newAnswers[childId];
                }
            });
        }

        setAnswers(newAnswers);

        setAnimating(true);
        setTimeout(() => {
            // Recalculate visible questions with new answers
            const { visibleQuestions: newVisible } = evaluateBranching(allQuestions, newAnswers);

            if (currentQuestionIndex < newVisible.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
            } else {
                // Assessment complete — compute scores and navigate to results
                const scoreResult = calculateScore(newAnswers, sector);

                // Build context answers object
                const ctx: ContextAnswers = {
                    sector,
                    companySize: contextAnswersState['C-Q2'] as string || '',
                    aiToolsUsed: (contextAnswersState['C-Q3'] as string[]) || [],
                    priorityAreas: (contextAnswersState['C-Q4'] as string[]) || [],
                    respondentRole: contextAnswersState['C-Q5'] as string || '',
                };

                // Compute recommendations and priority matrix
                const cards = selectRecommendations(scoreResult, ctx);
                const matrix = buildPriorityMatrix(scoreResult, sector);

                // Store in sessionStorage for results page
                sessionStorage.setItem('aigeniq_score', JSON.stringify(scoreResult));
                sessionStorage.setItem('aigeniq_context', JSON.stringify(ctx));
                sessionStorage.setItem('aigeniq_answers', JSON.stringify(newAnswers));
                sessionStorage.setItem('aigeniq_cards', JSON.stringify(cards));
                sessionStorage.setItem('aigeniq_matrix', JSON.stringify(matrix));

                setPhase('complete');
                router.push('/results');
            }
            setAnimating(false);
        }, 300);
    }, [currentScoredQ, currentQuestionIndex, answers, allQuestions, sector, contextAnswersState, router]);

    // ─── BACK BUTTON ───
    const handleBack = useCallback(() => {
        if (phase === 'assessment' && currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        } else if (phase === 'assessment' && currentQuestionIndex === 0) {
            setPhase('context');
            setContextIndex(contextQuestions.length - 1);
        } else if (phase === 'context' && contextIndex > 0) {
            setContextIndex(prev => prev - 1);
        }
    }, [phase, currentQuestionIndex, contextIndex]);

    // ─── MULTI-SELECT HANDLER ───
    const [multiSelectState, setMultiSelectState] = useState<string[]>([]);

    const handleMultiToggle = (option: string) => {
        setMultiSelectState(prev => {
            const max = currentContextQ?.maxSelections;
            if (prev.includes(option)) {
                return prev.filter(o => o !== option);
            }
            if (max && prev.length >= max) return prev;
            return [...prev, option];
        });
    };

    const confirmMultiSelect = () => {
        if (multiSelectState.length > 0) {
            handleContextAnswer(multiSelectState);
            setMultiSelectState([]);
        }
    };

    // Reset multi-select when question changes
    useEffect(() => {
        if (phase === 'context' && currentContextQ?.isMultiSelect) {
            const existing = contextAnswersState[currentContextQ.id];
            setMultiSelectState(Array.isArray(existing) ? existing : []);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contextIndex, phase, currentContextQ?.isMultiSelect, currentContextQ?.id]);

    // ─── RENDER ───
    return (
        <main className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="py-4 px-6 border-b border-white/5">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center font-bold text-sm">
                            Ai
                        </div>
                        <span className="font-semibold text-sm">
                            AiGEN<span className="text-blue-400">iQ</span>
                        </span>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-medium text-slate-300">{sectorLabel}</div>
                        <div className="text-xs text-slate-500">
                            {phase === 'context' ? 'Setting up your assessment' :
                                phase === 'assessment' ? `${currentDimension}` : 'Complete'}
                        </div>
                    </div>
                </div>
            </header>

            {/* Progress Bar */}
            <div className="px-6 py-3">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between text-xs text-slate-500 mb-2">
                        <span>
                            {phase === 'context'
                                ? `Context ${contextIndex + 1} of ${totalContextQs}`
                                : phase === 'assessment'
                                    ? `Question ${currentQuestionIndex + 1} of ${totalScoredQs}`
                                    : 'Complete'}
                        </span>
                        <span>{Math.round(overallProgress)}%</span>
                    </div>
                    <div className="progress-bar-bg">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${overallProgress}%` }}
                        />
                    </div>
                    {phase === 'assessment' && (
                        <div className="flex gap-1 mt-2">
                            {(['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8'] as DimensionId[]).map(dim => (
                                <div
                                    key={dim}
                                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${dim === currentDimId
                                        ? 'bg-blue-400'
                                        : visibleQuestions.findIndex(q => q.dimensionId === dim) <= currentQuestionIndex
                                            && visibleQuestions.some(q => q.dimensionId === dim && answers[q.id])
                                            ? 'bg-blue-400/30'
                                            : 'bg-white/5'
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Question Content */}
            <div className="flex-1 flex items-center justify-center px-6 py-8">
                <div className={`max-w-2xl w-full transition-all duration-300 ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>

                    {/* ─── CONTEXT QUESTIONS ─── */}
                    {phase === 'context' && currentContextQ && (
                        <div className="glass-card p-8 sm:p-10">
                            <div className="text-xs font-medium text-blue-400 mb-4 uppercase tracking-wider">
                                Setting up your assessment
                            </div>
                            <h2 className="text-xl sm:text-2xl font-semibold mb-8 leading-relaxed">
                                {currentContextQ.text}
                            </h2>

                            {currentContextQ.isMultiSelect ? (
                                /* Multi-select */
                                <div className="space-y-3">
                                    {currentContextQ.options.map((option, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleMultiToggle(option)}
                                            className={`option-btn ${multiSelectState.includes(option) ? 'selected' : ''}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${multiSelectState.includes(option)
                                                    ? 'bg-blue-500 border-blue-500'
                                                    : 'border-slate-500'
                                                    }`}>
                                                    {multiSelectState.includes(option) && (
                                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className="text-sm sm:text-base text-slate-200">{option}</span>
                                            </div>
                                        </button>
                                    ))}
                                    {currentContextQ.maxSelections && (
                                        <p className="text-xs text-slate-500 mt-2">
                                            Select up to {currentContextQ.maxSelections} options
                                        </p>
                                    )}
                                    <button
                                        onClick={confirmMultiSelect}
                                        disabled={multiSelectState.length === 0}
                                        className="btn-primary w-full mt-4 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        Continue
                                    </button>
                                </div>
                            ) : (
                                /* Single-select */
                                <div className="space-y-3">
                                    {currentContextQ.options.map((option, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleContextAnswer(option)}
                                            className="option-btn"
                                        >
                                            <span className="text-sm sm:text-base text-slate-200">{option}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ─── SCORED ASSESSMENT QUESTIONS ─── */}
                    {phase === 'assessment' && currentScoredQ && (
                        <div className="glass-card p-8 sm:p-10">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                    {currentScoredQ.dimensionName}
                                </span>
                            </div>

                            <h2 className="text-xl sm:text-2xl font-semibold mb-8 leading-relaxed">
                                {currentScoredQ.text}
                            </h2>

                            <div className="space-y-3">
                                {(['A', 'B', 'C', 'D'] as const).map((letter) => (
                                    <button
                                        key={letter}
                                        onClick={() => handleScoredAnswer(letter)}
                                        className={`option-btn ${answers[currentScoredQ.id] === letter ? 'selected' : ''}`}
                                    >
                                        <span className="text-sm sm:text-base text-slate-200">
                                            {currentScoredQ.options[letter]}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="py-4 px-6 border-t border-white/5">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <button
                        onClick={handleBack}
                        disabled={phase === 'context' && contextIndex === 0}
                        className="text-sm text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                    <div className="text-xs text-slate-600">
                        Your responses are saved automatically
                    </div>
                </div>
            </div>
        </main>
    );
}
