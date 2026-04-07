'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ScoreResult, ContextAnswers, RecommendationCard, DimensionId,
    DIMENSION_NAMES, MATURITY_LABELS, MATURITY_DESCRIPTIONS,
    SECTOR_LABELS, MaturityStage
} from '../../types';
import { getDiagnosticBlock, getDiagnosticLevel, DiagnosticBlock } from '../../lib/config/diagnostics.config';
import { GATE_WARNINGS } from '../../lib/config/gate-warnings.config';

// ── Helpers ──
const getScoreColorClass = (score: number) => {
    if (score <= 2.0) return 'l1';
    if (score <= 4.0) return 'l2';
    if (score <= 6.0) return 'l3';
    if (score <= 8.0) return 'l4';
    return 'l5';
};

const getMaturityVerb = (stage: MaturityStage) => {
    switch (stage) {
        case 'unaware': return 'Exploring.';
        case 'exploring': return 'Exploring.';
        case 'developing': return 'Building.';
        case 'scaling': return 'Scaling.';
        case 'leading': return 'Leading.';
        default: return 'Building.';
    }
};

export default function ResultsPage() {
    const router = useRouter();
    const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
    const [contextAnswers, setContextAnswers] = useState<ContextAnswers | null>(null);
    const [cards, setCards] = useState<RecommendationCard[]>([]);
    const [gateUnlocked, setGateUnlocked] = useState(false);
    const [leadName, setLeadName] = useState('');
    const [leadEmail, setLeadEmail] = useState('');
    const [companyName, setCompanyName] = useState('');

    useEffect(() => {
        const scoreData = sessionStorage.getItem('aigeniq_score');
        const contextData = sessionStorage.getItem('aigeniq_context');

        if (!scoreData || !contextData) {
            router.push('/');
            return;
        }

        setScoreResult(JSON.parse(scoreData));
        setContextAnswers(JSON.parse(contextData));

        const cardsData = sessionStorage.getItem('aigeniq_cards');
        if (cardsData) setCards(JSON.parse(cardsData));

        // const matrixData = sessionStorage.getItem('aigeniq_matrix');
        // if (matrixData) setMatrix(JSON.parse(matrixData));
    }, [router]);

    if (!scoreResult || !contextAnswers) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-[var(--cyan)] font-mono">
                Loading Results...
            </div>
        );
    }

    const sortedDims = (Object.keys(DIMENSION_NAMES) as DimensionId[]).sort(
        (a, b) => scoreResult.dimensionScores[a] - scoreResult.dimensionScores[b]
    );

    const nowCards = cards.filter(c => c.placement === 'NOW');
    const nextCards = cards.filter(c => c.placement === 'NEXT');
    const laterCards = cards.filter(c => c.placement === 'LATER');

    const handleLeadSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        // INSTANT UNLOCK: High reliability for the user
        setGateUnlocked(true);
        console.log('Gate unlocked: report revealed.');
        
        const leadData = {
            leadName: leadName || 'Quick Preview',
            leadEmail: leadEmail || 'preview@aigeniq.ai',
            companyName: companyName || 'Guest Organization',
            sector: contextAnswers.sector,
            contextAnswers: contextAnswers,
            assessmentAnswers: JSON.parse(sessionStorage.getItem('aigeniq_answers') || '{}'),
            scores: scoreResult.dimensionScores,
            finalScore: scoreResult.finalScore,
            maturityStage: scoreResult.maturityStage,
            gatesTriggered: scoreResult.gatesTriggered
        };

        // Persist lead in session for PDF generation
        sessionStorage.setItem('aigeniq_lead', JSON.stringify({ 
            name: leadName || 'Guest User', 
            email: leadEmail || 'guest@aigeniq.ai', 
            company: companyName || 'The Organization' 
        }));

        try {
            // Save to Supabase (Background)
            fetch('/api/submit-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(leadData)
            }).then(res => res.json()).then(result => {
                console.log('Lead persistence success:', result.message);
            }).catch(e => console.warn('Persistence background error:', e));

        } catch (err) {
            console.warn('Silent failure on background persistence:', err);
        }
    };

    return (
        <main className="min-h-screen bg-white">
            {/* ════ HEADER ════ */}
            <div className="bg-black p-[22px_40px] grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-white">
                <div>
                    <div className="wordmark font-mono font-bold text-[26px] tracking-[-1px]">
                        Ai<span className="text-[var(--cyan)]">GEN</span>iQ
                    </div>
                    <div className="strapline font-grotesk text-[11px] text-[var(--g60)] mt-[3px]">
                        Making AI work for you.
                    </div>
                </div>
                <div className="hdr-title font-grotesk font-bold text-[13px] text-center tracking-[1.5px] uppercase">
                    AI Readiness<br />Assessment
                </div>
                <div className="hdr-right text-right">
                    <div className="hdr-client font-grotesk font-extrabold text-[16px] text-[var(--cyan)]">
                        {companyName || 'Your Organization'}
                    </div>
                    <div className="hdr-meta font-inter text-[11px] text-[var(--g60)] mt-1 leading-[1.7]">
                        {SECTOR_LABELS[contextAnswers.sector]}<br />
                        Date: {new Date().toLocaleDateString('en-GB')}<br />
                        aigeniq.ai
                    </div>
                </div>
            </div>

            {/* ════ HERO ════ */}
            <div className="flex flex-wrap gap-8 items-start justify-between bg-[var(--cyan)] p-[28px_40px]">
                <div className="hero-left font-grotesk">
                    <div className="hero-lbl font-bold text-[11px] tracking-[1.5px] uppercase text-[var(--g40)] mb-[6px]">
                        Overall AI Maturity
                    </div>
                    <div className="hero-band text-[52px] font-black text-[var(--black)] leading-none tracking-[-2px]">
                        {getMaturityVerb(scoreResult.maturityStage)}
                    </div>
                    <div className="hero-band-sub text-[14px] font-medium text-[var(--g40)] mt-2">
                        {MATURITY_LABELS[scoreResult.maturityStage]} · Final Score: {scoreResult.finalScore}/10
                    </div>
                    <div className="flex gap-2 mt-4 flex-wrap">
                        <span className="font-mono text-[11px] font-bold p-[5px_14px] bg-black text-[var(--cyan)] rounded-sm">
                            8 / 8 dimensions assessed
                        </span>
                        {scoreResult.gatesTriggered.length > 0 ? (
                            <span className="font-mono text-[11px] font-bold p-[5px_14px] bg-[var(--g20)] text-[var(--warn)] rounded-sm">
                                {scoreResult.gatesTriggered.length} blockers identified
                            </span>
                        ) : (
                            <span className="font-mono text-[11px] font-bold p-[5px_14px] bg-black text-[var(--green)] rounded-sm">
                                No critical blockers
                            </span>
                        )}
                    </div>
                </div>
                <div className="hero-right max-w-[520px]">
                    <div className="hero-summary-lbl font-mono text-[10px] font-bold tracking-[1px] uppercase text-[var(--g40)] mb-2">
                        Executive Summary
                    </div>
                    <div className="hero-summary-text text-[14px] leading-[1.75] text-[var(--black)]">
                        {MATURITY_DESCRIPTIONS[scoreResult.maturityStage]} Based on your responses, {companyName || 'the organization'} is currently at the <strong>{MATURITY_LABELS[scoreResult.maturityStage]}</strong> stage. 
                        Your strongest areas provide a foundation for scaling, while specific gaps in {DIMENSION_NAMES[sortedDims[0]]} and {DIMENSION_NAMES[sortedDims[1]]} represent the most immediate leverage points for improvement.
                    </div>
                    <div className="mt-[14px] p-[12px_16px] bg-black/15 rounded-sm border-l-[3px] border-black text-[12px] text-[var(--g40)] leading-[1.65] font-inter">
                        <strong className="text-black font-grotesk font-bold">About this report.</strong> This is a deterministic readiness assessment calculated using the AiGENiQ 8-dimension framework. It identifies where to focus resources and how to sequence your AI roadmap for maximum ROI and compliance.
                    </div>
                </div>
            </div>

            {/* ════ SECTION 1 ════ */}
            <div className="bg-[var(--g95)] px-10 py-3 border-y border-[var(--g90)] flex items-center gap-3">
                <span className="font-mono font-bold text-[11px] tracking-[1.5px] uppercase text-black">Section 1 — Executive Summary</span>
            </div>

            <div className="max-w-[1200px] mx-auto p-[36px_32px]">
                {/* ═══ AT A GLANCE ═══ */}
                <div className="mb-12">
                    <div className="slabel">At a Glance — Key Points</div>
                    <div className="summary-grid">
                        <div className="sg-cell highlight">
                            <div className="sg-lbl">Overall Maturity</div>
                            <div className="sg-val">{MATURITY_LABELS[scoreResult.maturityStage]}</div>
                            <div className="sg-note">
                                <strong className="text-black">Score Impact:</strong> {scoreResult.finalScore}/10. {MATURITY_DESCRIPTIONS[scoreResult.maturityStage]}
                            </div>
                        </div>
                        <div className="sg-cell highlight">
                            <div className="sg-lbl">Strongest Pillar</div>
                            <div className="sg-val !text-green-600">{DIMENSION_NAMES[sortedDims[7]]}</div>
                            <div className="sg-note">
                                Scoring {Math.round(scoreResult.dimensionScores[sortedDims[7]] * 10) / 10}/10. This is your primary anchor for AI adoption.
                            </div>
                        </div>
                        <div className="sg-cell highlight">
                            <div className="sg-lbl">Blocker Check</div>
                            <div className="sg-val">{scoreResult.gatesTriggered.length > 0 ? 'Action Needed' : 'Passed'}</div>
                            <div className="sg-note">
                                {scoreResult.gatesTriggered.length > 0 
                                    ? `Triggered ${scoreResult.gatesTriggered.length} safety gates which capped the total score.` 
                                    : 'Found no hard or soft gates preventing scaling.'}
                            </div>
                        </div>
                        {scoreResult.gatesTriggered.length > 0 ? (
                            <div className="sg-cell blocker">
                                <div className="sg-lbl">Critical Blocker</div>
                                <div className="sg-val uppercase text-[var(--warn)]">{DIMENSION_NAMES[scoreResult.gatesTriggered[0].split('_')[0] as DimensionId]}</div>
                                <div className="sg-note">
                                    The {scoreResult.gatesTriggered[0].includes('HARD') ? 'Hard' : 'Soft'} gate here is the primary constraint.
                                </div>
                            </div>
                        ) : (
                            <div className="sg-cell positive">
                                <div className="sg-lbl">Key Advantage</div>
                                <div className="sg-val !text-green-700">{DIMENSION_NAMES[sortedDims[6]]}</div>
                                <div className="sg-note">
                                    Your maturity in this area allows you to pilot advanced AI use cases faster.
                                </div>
                            </div>
                        )}
                        <div className="sg-cell full">
                            <div className="sg-lbl !text-[var(--g60)]">Top Priority Action</div>
                            <div className="sg-val !text-[var(--cyan)]">Optimize {DIMENSION_NAMES[sortedDims[0]]} Foundations</div>
                            <div className="sg-note !text-[var(--g60)]">
                                Improving your {DIMENSION_NAMES[sortedDims[0]]} score from {Math.round(scoreResult.dimensionScores[sortedDims[0]] * 10) / 10}/10 is the single most effective way to unlock higher-tier AI capabilities.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ════ SECTION 2 DIVIDER ════ */}
            <div className="bg-black p-[28px_40px] flex flex-wrap gap-4 items-center justify-between">
                <div>
                    <div className="font-mono font-bold text-[10px] tracking-[2px] uppercase text-[var(--g40)] mb-1">Section 2 of 2</div>
                    <div className="font-grotesk font-black text-[24px] text-white tracking-[-1px]">Full Assessment Detail</div>
                    <div className="font-inter text-[13px] text-[var(--g60)] mt-1">Evidence, scores, roadmap and opportunities behind the summary.</div>
                </div>
                <div className="flex gap-2 print-hidden">
                    <button 
                        onClick={() => window.print()}
                        className="font-mono font-bold text-[11px] p-[7px_14px] bg-[var(--cyan)] text-black border border-[var(--cyan)] hover:bg-black hover:text-[var(--cyan)] rounded-sm transition-all"
                    >
                        Download PDF Report
                    </button>
                    <a href="#diagnostics" className="font-mono font-bold text-[11px] p-[7px_14px] border border-[var(--g40)] text-[var(--g60)] hover:bg-[var(--cyan)] hover:text-black hover:border-[var(--cyan)] rounded-sm">Diagnostics</a>
                    <a href="#roadmap" className="font-mono font-bold text-[11px] p-[7px_14px] border border-[var(--g40)] text-[var(--g60)] hover:bg-[var(--cyan)] hover:text-black hover:border-[var(--cyan)] rounded-sm">Roadmap</a>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto p-[36px_32px]">
                
                {/* ═══ LEAD GATE ═══ */}
                {!gateUnlocked && (
                    <div className="bg-black p-10 text-center mb-12 rounded-sm" id="lead-gate-section">
                        <div className="font-mono font-bold text-[12px] text-[var(--cyan)] uppercase tracking-widest mb-2">Detailed Report Locked</div>
                        <h2 className="font-grotesk font-black text-3xl text-white mb-4">
                            Access Your Full Diagnostic Report
                        </h2>
                        <p className="text-[var(--g60)] mb-8 max-w-md mx-auto text-sm leading-relaxed">
                            Unlock detailed dimension diagnostics, gate warnings, priority matrix, and your personalised 90-day action roadmap.
                        </p>
                        <form onSubmit={handleLeadSubmit} className="max-w-sm mx-auto space-y-4">
                            <input
                                type="text"
                                placeholder="Organization Name"
                                value={companyName}
                                onChange={e => setCompanyName(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-sm bg-white/5 border border-white/10 text-white placeholder-[var(--g60)] focus:border-[var(--cyan)] outline-none transition font-inter text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Your Name"
                                value={leadName}
                                onChange={e => setLeadName(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-sm bg-white/5 border border-white/10 text-white placeholder-[var(--g60)] focus:border-[var(--cyan)] outline-none transition font-inter text-sm"
                            />
                            <input
                                type="email"
                                placeholder="Work Email"
                                value={leadEmail}
                                onChange={e => setLeadEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-sm bg-white/5 border border-white/10 text-white placeholder-[var(--g60)] focus:border-[var(--cyan)] outline-none transition font-inter text-sm"
                            />
                            <button
                                type="submit"
                                className="btn-primary w-full"
                            >
                                Unlock Full Report →
                            </button>
                            <div className="mt-4">
                                <button 
                                    type="button" 
                                    onClick={() => handleLeadSubmit()}
                                    className="text-[10px] text-[var(--g40)] underline hover:text-[var(--cyan)] transition-colors uppercase tracking-widest font-mono"
                                >
                                    Or Quick Preview (No Save) →
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ═══ GATED CONTENT ═══ */}
                {gateUnlocked && (
                    <div className="animate-fade-in-up">
                        
                        {/* ── READY AT A GLANCE (Bar Chart) ── */}
                        <div className="mb-12">
                            <div className="slabel">Readiness at a Glance — All 8 Areas Scored</div>
                            <div className="bar-chart">
                                <div className="bar-chart-header">
                                    <div className="bch-l">Area</div>
                                    <div className="bch-c text-center">Score Track</div>
                                    <div className="bch-r">Readiness</div>
                                </div>
                                {Object.keys(DIMENSION_NAMES).map(dimKey => {
                                    const dim = dimKey as DimensionId;
                                    const score = scoreResult.dimensionScores[dim];
                                    const scorePercent = (score / 10) * 100;
                                    const colorClass = getScoreColorClass(score);
                                    const hasGate = scoreResult.gatesTriggered.some(g => g.startsWith(dim));
                                    
                                    return (
                                        <div key={dim} className={`bar-row ${hasGate ? 'bg-[#fffbeb]' : ''}`}>
                                            <div className="bar-dim-name">
                                                <span className="bar-dim-num">{dim}</span>
                                                {DIMENSION_NAMES[dim]} {hasGate && '⚠'}
                                            </div>
                                            <div className="px-4">
                                                <div className="bar-track">
                                                    <div 
                                                        className="bar-fill" 
                                                        style={{ 
                                                            width: `${scorePercent}%`,
                                                            backgroundColor: colorClass === 'l1' ? 'var(--l1c)' : colorClass === 'l2' ? 'var(--l2c)' : colorClass === 'l3' ? 'var(--l3c)' : colorClass === 'l4' ? 'var(--l4c)' : 'var(--l5c)'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="p-4 text-right">
                                                <span 
                                                    className="font-mono font-bold text-[11px] p-[3px_9px] rounded-sm text-white"
                                                    style={{ 
                                                        backgroundColor: colorClass === 'l1' ? 'var(--l1c)' : colorClass === 'l2' ? 'var(--l2c)' : colorClass === 'l3' ? 'var(--l3c)' : colorClass === 'l4' ? 'var(--l4c)' : 'var(--l5c)'
                                                    }}
                                                >
                                                    {getDiagnosticLevel(score)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── GATE WARNINGS ── */}
                        {scoreResult.gatesTriggered.length > 0 && (
                            <div className="mb-12">
                                <div className="slabel">Important Findings — Safety Gates</div>
                                {scoreResult.gatesTriggered.map(gate => {
                                    const warning = GATE_WARNINGS[gate];
                                    if (!warning) return null;
                                    const isHard = gate.includes('HARD');
                                    return (
                                        <div key={gate} className={`notice-block mb-4 ${isHard ? 'notice-blocker' : 'notice-positive'}`}>
                                            <div className="text-2xl">{isHard ? '⚠️' : '✅'}</div>
                                            <div>
                                                <div className="notice-title">{warning.headline}</div>
                                                <div className="notice-body">{warning.body}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* ── DIMENSION CARDS ── */}
                        <div className="mb-12" id="diagnostics">
                            <div className="slabel">Detailed Dimension Analysis</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {sortedDims.map(dim => {
                                    const score = scoreResult.dimensionScores[dim];
                                    const diag: DiagnosticBlock = getDiagnosticBlock(dim, score);
                                    const colorClass = getScoreColorClass(score);
                                    
                                    return (
                                        <div key={dim} className={`dcard ${colorClass}`}>
                                            <div className="dnum">DIMENSION {dim}</div>
                                            <div className="dname">{DIMENSION_NAMES[dim]}</div>
                                            <div className="flex gap-2 mb-4">
                                                <span className="font-mono text-[10px] font-bold p-[3px_9px] rounded-sm bg-black text-white">
                                                    {Math.round(score * 10) / 10} / 10
                                                </span>
                                                <span className="font-mono text-[10px] font-bold p-[3px_9px] rounded-sm bg-[var(--g95)] text-[var(--g60)] border border-[var(--g90)]">
                                                    {diag.scoreLabel}
                                                </span>
                                            </div>
                                            <div className="p-4 bg-[var(--g95)] border-l-[3px] border-[var(--g90)] text-[13px] text-[var(--g40)] leading-relaxed mb-4 font-inter">
                                                <span className="font-mono font-bold text-[9px] uppercase tracking-wider block mb-1 text-[var(--g60)]">Diagnosis</span>
                                                {diag.diagnosis}
                                            </div>
                                            <div className="text-[13px] text-[var(--g20)] border-t border-[var(--g90)] pt-4 leading-relaxed font-inter">
                                                <span className="font-grotesk font-bold text-[11px] uppercase tracking-wider text-[var(--g60)] block mb-1">Recommended Next Step</span>
                                                {diag.nextStep}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── ROADMAP ── */}
                        <div className="mb-12" id="roadmap">
                            <div className="slabel">Phased Roadmap — What to Do and When</div>
                            <div className="rmgrid">
                                <div className="rmcol">
                                    <div className="rmhead now">NOW <span className="float-right text-[9px] opacity-60">0–30 days</span></div>
                                    <div className="rmcards">
                                        {nowCards.length > 0 ? nowCards.map(card => (
                                            <div key={card.id} className={`rmc ${scoreResult.gatesTriggered.some(g => g.startsWith(card.triggerDimension)) ? 'flagged' : ''}`}>
                                                <div className="rct">{card.title}</div>
                                                <div className="rcd font-inter">{card.whyItMatters}</div>
                                                <div className="flex flex-wrap gap-1">
                                                    <span className="rctag">{DIMENSION_NAMES[card.triggerDimension].split(' ')[0]}</span>
                                                    <span className="rcown">{card.ownerRole}</span>
                                                </div>
                                            </div>
                                        )) : <p className="text-[10px] text-[var(--g60)] italic p-4">No immediate actions found.</p>}
                                    </div>
                                </div>
                                <div className="rmcol">
                                    <div className="rmhead next">NEXT <span className="float-right text-[9px] opacity-60">1–3 months</span></div>
                                    <div className="rmcards">
                                        {nextCards.length > 0 ? nextCards.map(card => (
                                            <div key={card.id} className="rmc">
                                                <div className="rct">{card.title}</div>
                                                <div className="rcd font-inter">{card.whyItMatters}</div>
                                                <div className="flex flex-wrap gap-1">
                                                    <span className="rctag">{DIMENSION_NAMES[card.triggerDimension].split(' ')[0]}</span>
                                                    <span className="rcown">{card.ownerRole}</span>
                                                </div>
                                            </div>
                                        )) : <p className="text-[10px] text-[var(--g60)] italic p-4">No medium-term actions.</p>}
                                    </div>
                                </div>
                                <div className="rmcol">
                                    <div className="rmhead later">LATER <span className="float-right text-[9px] opacity-60">3–12 months</span></div>
                                    <div className="rmcards">
                                        {laterCards.length > 0 ? laterCards.map(card => (
                                            <div key={card.id} className="rmc">
                                                <div className="rct">{card.title}</div>
                                                <div className="rcd font-inter">{card.whyItMatters}</div>
                                                <div className="flex flex-wrap gap-1">
                                                    <span className="rctag">{DIMENSION_NAMES[card.triggerDimension].split(' ')[0]}</span>
                                                    <span className="rcown">{card.ownerRole}</span>
                                                </div>
                                            </div>
                                        )) : <p className="text-[10px] text-[var(--g60)] italic p-4">No long-term actions.</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── FOOTER ── */}
                        <div className="bg-[var(--cyan)] p-[32px_40px] flex flex-wrap gap-10 justify-between items-start rounded-sm mt-12 mb-8">
                            <div>
                                <div className="font-mono font-bold text-[24px] text-black tracking-[-1.5px] mb-2">AiGENiQ</div>
                                <div className="font-grotesk text-[13px] text-[var(--g40)] leading-relaxed max-w-[320px]">
                                    Professional AI Readiness Platform. Full assessment completed for <strong className="text-black">{companyName || 'the organization'}</strong> on {new Date().toLocaleDateString('en-GB')}.
                                </div>
                            </div>
                            <div className="max-w-[560px] font-inter text-[11px] text-[var(--g40)] leading-relaxed border-l border-black/10 pl-6">
                                <strong className="text-black block mb-1">Methodology &amp; Risk Disclaimer</strong>
                                This assessment was generated by the AiGENiQ Readiness Engine. The results are deterministic and based on self-reported data. This report does not constitute legal or technical advice. The score reflects organizational readiness across 8 dimensions benchmarked against industry standards. 
                            </div>
                        </div>

                        <div className="text-center py-10">
                            <button
                                onClick={() => router.push('/')}
                                className="btn-primary"
                            >
                                Retake Assessment
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
