// lib/config/cards.config.ts
// 2026v Human-Centric Strategic Recommendations
import { RecommendationCard } from '../../types';

export const recommendationCards: RecommendationCard[] = [
    // ── D1: Collective Memory (The Brain) ──
    {
        id: 'D1-NOW',
        title: 'Build Your Firm\'s "Collective Memory"',
        placement: 'NOW',
        triggerDimension: 'D1',
        triggerThreshold: 4.5,
        ownerRole: 'Owner / Ops Lead',
        effortLevel: 'LOW',
        firstSteps: [
            'Audit where your best project work is currently "hidden"',
            'Move your top 10 most valuable documents into a single, clean workspace',
            'Name one "Knowledge Librarian" to keep this space updated weekly',
        ],
        whyItMatters: 'In 2026, an AI is only as smart as the data it can see. If your best work is stuck in separate heads and folders, your AI will be average. Centralizing it creates your firm\'s "Neural Moat."',
    },
    {
        id: 'D1-NEXT',
        title: 'Implement "AI-Ready" File Standards',
        placement: 'NEXT',
        triggerDimension: 'D1',
        triggerThreshold: 7.4,
        ownerRole: 'Ops Lead',
        effortLevel: 'MEDIUM',
        firstSteps: [
            'Define what a "Clean File" looks like for your business',
            'Require all new project work to follow a standard summary format',
            'Run a monthly check to ensure the "Collective Memory" stays high-quality',
        ],
        whyItMatters: '2026 Research: Firms with "Clean Data" achieve 4x faster AI deployment. You aren\'t just organizing files; you are prepping your business for autonomous agents to take over the heavy lifting.',
    },

    // ── D2: Smart Leadership (The Strategy) ──
    {
        id: 'D2-NOW',
        title: 'Appoint an "Internal AI Navigator"',
        placement: 'NOW',
        triggerDimension: 'D2',
        triggerThreshold: 4.5,
        ownerRole: 'CEO / Founder',
        effortLevel: 'LOW',
        firstSteps: [
            'Identify one person to spend 2 hours a week testing "smart assistants"',
            'Protect their time from normal duties; this is a strategic role',
            'Have them report one "Quick Win" back to the team every fortnight',
        ],
        whyItMatters: 'McKinsey 2026 Study: 80% of companies fail to scale AI because they treat it as an IT project. By naming a Lead, you turn AI into a leadership outcome.',
    },
    {
        id: 'D2-NEXT',
        title: 'Draft a 2026 "Outcome Roadmap"',
        placement: 'NEXT',
        triggerDimension: 'D2',
        triggerThreshold: 7.4,
        ownerRole: 'Leadership Team',
        effortLevel: 'LOW',
        firstSteps: [
            'Stop buying tools; start defining "Outcome Engines" (e.g., "Auto-Lead Gen")',
            'Pick 3 business bottlenecks that AI must solve in the next 6 months',
            'Assign a "Profit Owner" to each to ensure they actually deliver results',
        ],
        whyItMatters: 'In 2026, tools are a commodity. The winners are firms that design their business around "Outcome Engines" that run while the team sleeps.',
    },

    // ── D3: Trust & Safety (The Shield) ──
    {
        id: 'D3-NOW',
        title: 'Install "Human-in-the-Loop" Safety Gates',
        placement: 'NOW',
        triggerDimension: 'D3',
        triggerThreshold: 4.5,
        ownerRole: 'Compliance / Ops Lead',
        effortLevel: 'LOW',
        firstSteps: [
            'Write a 1-page "Safe Use" guide for the team',
            'Mandate that no AI-generated work goes to clients without a human factual check',
            'Ban the use of public, unsecure tools for sensitive client data immediately',
        ],
        whyItMatters: '47% of businesses faced an AI incident in the last 12 months. In 2026, trust is your most valuable currency. These gates stop expensive hallucinations before they reach the client.',
    },
    {
        id: 'D3-NEXT',
        title: 'Move to a "Sovereign AI" Infrastructure',
        placement: 'NEXT',
        triggerDimension: 'D3',
        triggerThreshold: 7.4,
        ownerRole: 'Tech / Ops Lead',
        effortLevel: 'MEDIUM',
        firstSteps: [
            'Audit which tools are currently "listening" to your private business data',
            'Identify private, secure alternatives that don\'t share your IP with the world',
            'Migrate your core "Knowledge Base" to a secure, private node',
        ],
        whyItMatters: 'IP leakage is the #1 risk of 2026. By building your own "Sovereign Brain," you protect your firm\'s secret sauce while still getting all the benefits of automation.',
    },

    // ── D5: Smart Workflows (The Engine) ──
    {
        id: 'D5-NOW',
        title: 'Map Your "Golden Path" Workflows',
        placement: 'NOW',
        triggerDimension: 'D5',
        triggerThreshold: 4.5,
        ownerRole: 'Ops Lead',
        effortLevel: 'LOW',
        firstSteps: [
            'Pick your most repeated task (e.g., Proposals, Onboarding, Reporting)',
            'Spend 1 hour mapping the exact steps a human currently takes',
            'Look for the "Decision Points" where an AI could assist',
        ],
        whyItMatters: 'You cannot automate what you haven\'t defined. These maps are the blueprints for your future "Auto-Pilot" business.',
    },
    {
        id: 'D5-NEXT',
        title: 'Design "Human-AI Handshakes"',
        placement: 'NEXT',
        triggerDimension: 'D5',
        triggerThreshold: 7.4,
        ownerRole: 'Ops Lead',
        effortLevel: 'MEDIUM',
        firstSteps: [
            'Pick a workflow and define exactly where the AI "Starts" and the Human "Stops"',
            'Use automated triggers (like CRM webhooks) to pass work between them',
            'Test the flow for 30 days to remove friction and human "nagging"',
        ],
        whyItMatters: 'Firms with "Seamless Handshakes" report 55% higher efficiency. This is how you scale your output without ever hiring another person.',
    },

    // ── D8: Pure Profit Impact (The Payoff) ──
    {
        id: 'D8-NOW',
        title: 'Start Tracking "Efficiency Leaks"',
        placement: 'NOW',
        triggerDimension: 'D8',
        triggerThreshold: 4.5,
        ownerRole: 'Owner / Finance',
        effortLevel: 'LOW',
        firstSteps: [
            'Identify 3 manual tasks that follow no consistent rules',
            'Calculate how much those "leaks" are currently costing you in wages',
            'Set a 2026 goal to plug those leaks with a "Smart Assistant"',
        ],
        whyItMatters: 'In 2026, AI is no longer a "Cool Tech" budget line—it’s an efficiency investment. If you aren\'t tracking the leak, you aren\'t really investing.',
    },
    {
        id: 'D8-NEXT',
        title: 'Build a "Live Impact Dashboard"',
        placement: 'NEXT',
        triggerDimension: 'D8',
        triggerThreshold: 10.1,
        ownerRole: 'Owner / AI Lead',
        effortLevel: 'LOW',
        firstSteps: [
            'Pick 3 key metrics that AI is meant to improve (e.g., Lead Velocity)',
            'Create a simple one-page view of these metrics updated monthly',
            'Stop any AI experiment that hasn\'t moved the needle in 60 days',
        ],
        whyItMatters: 'The ROI Paradox: 88% of firms see some ROI, but only 15% reach enterprise scale. A live dashboard ensures you stay in that top 15%.',
    },
];
