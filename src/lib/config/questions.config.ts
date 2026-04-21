// lib/config/questions.config.ts
import { Question, ContextQuestion, Sector, DimensionId } from '../../types';

// ─── CONTEXT QUESTIONS (5 Steps) ───
export const contextQuestions: ContextQuestion[] = [
  {
    id: 'C-Q1',
    order: 1,
    text: 'Which sector best describes your business?',
    options: ['Professional Services', 'Creative & Agency', 'Technology & Software', 'Trade & Field Services', 'Retail & Hospitality', 'Health & Wellbeing', 'Other'],
    isMultiSelect: false,
  },
  {
    id: 'C-Q2',
    order: 2,
    text: 'How many people work in your business (Team Size)?',
    options: ['Solo / just me', '2–9', '10–49', '50–249', '250+'],
    isMultiSelect: false,
  },
  {
    id: 'C-Q3',
    order: 3,
    text: 'Which AI tools does your team actually use? (Select all that apply)',
    options: ['ChatGPT / OpenAI', 'Microsoft Copilot', 'Google Gemini', 'Notion AI', 'Midjourney / DALL-E', 'None', 'Other'],
    isMultiSelect: true,
  },
  {
    id: 'C-Q4',
    order: 4,
    text: 'What are you most hoping AI can help with? (Select up to 3)',
    options: ['Sales & BD', 'Operations & Delivery', 'Finance & Reporting', 'HR & People', 'Customer Service', 'Marketing & Content', 'Product Development', 'Data & Analytics', 'Legal & Compliance'],
    isMultiSelect: true,
    maxSelections: 3,
  },
  {
    id: 'C-Q5',
    order: 5,
    text: 'Who is completing this assessment today?',
    options: ['Founder / CEO / MD', 'Operations Lead', 'IT / Tech Lead', 'Consultant / Advisor', 'Other'],
    isMultiSelect: false,
  },
];

// ─── POWER 25 UNIVERSAL POOL (8 Dimensions × 2.5 Avg) ───
export const universalQuestions: Question[] = [
  // PHASE 01: FOUNDATIONS
  {
    id: 'D1-Q1',
    dimensionId: 'D1' as DimensionId,
    dimensionName: 'Data & Knowledge',
    order: 6,
    text: 'When a key team member leaves, what happens to their knowledge and files?',
    options: {
      A: 'Mostly lost; we scramble to recover it',
      B: 'Some bits are found, but it\'s messy',
      C: 'Most info is in shared systems/folders',
      D: 'Clear handover; successor starts seamlessly',
    },
    isHardGate: true,
  },
  {
    id: 'D1-Q2',
    dimensionId: 'D1' as DimensionId,
    dimensionName: 'Data & Knowledge',
    order: 7,
    text: 'If a new starter needed the "latest" price list or contract, what would they do?',
    options: {
      A: 'Ask someone; there is no single place to look',
      B: 'Check several folders; likely finding old versions',
      C: 'Go to one main system, though it\'s often out of date',
      D: 'Access a single, maintained source of truth',
    },
    isHardGate: true,
  },
  {
    id: 'D5-Q1',
    dimensionId: 'D5' as DimensionId,
    dimensionName: 'Process Maturity',
    order: 8,
    text: 'How much of your core business process is written down?',
    options: {
      A: 'Almost none — it\'s all in people\'s heads',
      B: 'Fragments exist but are hard to find',
      C: 'Key workflows are documented but spotty',
      D: 'Core processes are fully mapped & shared',
    },
  },
  {
    id: 'D5-Q3',
    dimensionId: 'D5' as DimensionId,
    dimensionName: 'Process Maturity',
    order: 9,
    text: 'How do "handoffs" work when work moves between team members?',
    options: {
      A: 'Implicit; we just know (or things get missed)',
      B: 'Mostly email or messages; often requires chasing',
      C: 'Logged in a PM tool, but not consistently',
      D: 'Standard protocol in a shared system; ownership is clear',
    },
  },
  {
    id: 'D5-Q5',
    dimensionId: 'D5' as DimensionId,
    dimensionName: 'Process Maturity',
    order: 10,
    text: 'Can you name 3 metrics that tell you if operations are running well today?',
    options: {
      A: 'No; we don\'t track operational metrics',
      B: 'We track Revenue, but not Delivery metrics',
      C: 'Yes, 2-3 metrics, but we rarely act on them',
      D: 'Live dashboard of KPIs reviewed weekly',
    },
  },

  // PHASE 02: STRATEGY & RISK
  {
    id: 'D2-Q1',
    dimensionId: 'D2' as DimensionId,
    dimensionName: 'Leadership & Strategy',
    order: 11,
    text: 'In the last 90 days, has leadership discussed a specific AI use case?',
    options: {
      A: 'No; AI hasn\'t come up formally',
      B: 'Mentioned briefly; no follow-through',
      C: 'Yes, discussed with a named next step',
      D: 'Yes, with a defined owner and timeline',
    },
    isSoftGate: true,
  },
  {
    id: 'D2-Q2',
    dimensionId: 'D2' as DimensionId,
    dimensionName: 'Leadership & Strategy',
    order: 12,
    text: 'If an AI project fails to deliver results, who is ultimately responsible?',
    options: {
      A: 'Nobody; it just "didn\'t work out"',
      B: 'Whoever was tinkering with it at the time',
      C: 'A specific lead, though they have limited authority',
      D: 'A clear owner with authority and reporting role',
    },
  },
  {
    id: 'D3-Q1',
    dimensionId: 'D3' as DimensionId,
    dimensionName: 'Governance & Risk',
    order: 13,
    text: 'If an employee pasted client data into ChatGPT today, would you know?',
    options: {
      A: 'No; there are no controls in place',
      B: 'Unlikely to be caught; we\'ve mentioned concerns but nothing is in place',
      C: 'We have a policy, but no tech controls',
      D: 'Yes; approved tools & access are managed',
    },
    isHardGate: true,
  },
  {
    id: 'D3-Q3',
    dimensionId: 'D3' as DimensionId,
    dimensionName: 'Governance & Risk',
    order: 14,
    text: 'Does your business have a written AI usage policy?',
    options: {
      A: 'No policy exists',
      B: 'Informal guidance only',
      C: 'Formal policy exists but not often reviewed',
      D: 'Current policy, reviewed & communicated',
    },
    isHardGate: true,
  },
  {
    id: 'D3-Q4',
    dimensionId: 'D3' as DimensionId,
    dimensionName: 'Governance & Risk',
    order: 15,
    text: 'When picking a new tool, do you assess its data handling and security?',
    options: {
      A: 'No; we just try it and see',
      B: 'We look at the website, but no formal check',
      C: 'Informal checklist of obvious risks',
      D: 'Structured risk & vendor due diligence process',
    },
  },

  // PHASE 03: ADOPTION & TECHNOLOGY
  {
    id: 'D4-Q1',
    dimensionId: 'D4' as DimensionId,
    dimensionName: 'People & Change',
    order: 16,
    text: 'When you last introduced a new system, what was adoption like?',
    options: {
      A: 'Most people reverted to old ways quickly',
      B: 'Mixed adoption; some used it, many didn\'t',
      C: 'Mostly adopted, but took a long time',
      D: 'Smooth rollout with clear support and training',
    },
  },
  {
    id: 'D4-Q4',
    dimensionId: 'D4' as DimensionId,
    dimensionName: 'People & Change',
    order: 17,
    text: 'What is the team\'s general reaction when you mention Automation?',
    options: {
      A: 'Anxiety or resistance (job security worries)',
      B: 'Polite interest, but no real engagement',
      C: 'Generally open; waiting for guidance',
      D: 'Empowered; actively seeking better tools',
    },
  },
  {
    id: 'D6-Q1',
    dimensionId: 'D6' as DimensionId,
    dimensionName: 'AI Usage',
    order: 18,
    text: 'How would you describe AI usage across your team right now?',
    options: {
      A: 'Virtually non-existent',
      B: 'Individuals use it informally on their own',
      C: 'Multiple members use it for specific tasks',
      D: 'Embedded in workflows; we know when to use it',
    },
  },
  {
    id: 'D6-Q5',
    dimensionId: 'D6' as DimensionId,
    dimensionName: 'AI Usage',
    order: 19,
    text: 'Do you use tools to automate tasks (scheduling, routing, reporting)?',
    options: {
      A: 'No; everything is manual',
      B: 'A few isolated "Zapier" style personal tasks',
      C: 'Team-level automations for specific stages',
      D: 'End-to-end automated workflows with monitoring',
    },
  },
  {
    id: 'D7-Q1',
    dimensionId: 'D7' as DimensionId,
    dimensionName: 'Tech & Integration',
    order: 20,
    text: 'How well do your CRM, Finance, and Ops tools talk to each other?',
    options: {
      A: 'They don\'t; we re-enter data manually',
      B: 'Occasional manual exports/imports',
      C: 'Some direct syncs; some manual bridging',
      D: 'Connected via API/iPaaS; data flows automatically',
    },
  },
  {
    id: 'D7-Q2',
    dimensionId: 'D7' as DimensionId,
    dimensionName: 'Tech & Integration',
    order: 21,
    text: 'Can team members get the reports they need without asking a specialist?',
    options: {
      A: 'No; reporting is a manual request process',
      B: 'Only "power users" know how to pull data',
      C: 'Most can access relevant shared dashboards',
      D: 'Self-service dashboards are available to all',
    },
  },

  // PHASE 04: VALUE & VISION
  {
    id: 'D8-Q1',
    dimensionId: 'D8' as DimensionId,
    dimensionName: 'Value & ROI',
    order: 22,
    text: 'How do you measure if a tool choice actually worked 6 months later?',
    options: {
      A: 'We don\'t measure it; success is a feeling',
      B: 'Anecdotal feedback ("seems better")',
      C: 'Track 1-2 metrics roughly',
      D: 'Baseline measured before & outcomes tracked',
    },
  },
  {
    id: 'D8-Q4',
    dimensionId: 'D8' as DimensionId,
    dimensionName: 'Value & ROI',
    order: 23,
    text: 'How do you decide which AI project to start first?',
    options: {
      A: 'Whoever suggests it loudest',
      B: 'Gut feel on where the biggest pain is',
      C: 'Informal scoring of speed vs. impact',
      D: 'Structured prioritization matrix',
    },
  },
  {
    id: 'D8-Q5',
    dimensionId: 'D8' as DimensionId,
    dimensionName: 'Value & ROI',
    order: 24,
    text: 'After a "test" of a new tool, how do you decide to scale it?',
    options: {
      A: 'It either stays or gets forgotten; no call',
      B: 'Individual "vibes" on whether it felt useful',
      C: 'Review against the original goal; clear go/no-go',
      D: 'Formal gate review of hypothesis vs results',
    },
  },
  {
    id: 'FUN-Q1',
    dimensionId: 'D4' as DimensionId,
    dimensionName: 'Bonus Insight',
    order: 25,
    text: 'If you had an AI "Digital Twin" of yourself, what would you delegate first?',
    options: {
      A: 'Managing my inbox and filtering noise',
      B: 'Drafting initial proposals and reports',
      C: 'Internal meetings and status updates',
      D: 'Deep-dive analysis on business performance',
    },
  },
];

// ─── SECTOR OVERRIDES ───
export const sectorOverrides: Partial<Record<Sector, Question[]>> = {
  professional_services: [
    {
      id: 'D3-Q1',
      dimensionId: 'D3' as DimensionId,
      dimensionName: 'Governance & Risk',
      order: 13,
      text: 'Has your firm assessed AI tools under professional body guidelines (SRA, ICAEW, FCA)?',
      options: {
        A: 'No — we haven\'t looked at regulatory rules',
        B: 'Vaguely aware but no formal investigation',
        C: 'Reviewed guidance and briefed leadership',
        D: 'Monitoring regs and have a compliant tool list',
      },
      isHardGate: true,
    },
    {
      id: 'D3-Q5',
      dimensionId: 'D3' as DimensionId,
      dimensionName: 'Governance & Risk',
      order: 17,
      text: 'Do you disclose to clients when AI has been used in producing their specific advice or report?',
      options: {
        A: 'No disclosure happening',
        B: 'Informal/Sometimes — no policy',
        C: 'Internal guideline exists but enforced loosely',
        D: 'Always disclosed; transparency is standard',
      },
    },
  ],
  creative_agency: [
    {
      id: 'D1-Q2',
      dimensionId: 'D1' as DimensionId,
      dimensionName: 'Data & Knowledge',
      order: 7,
      text: 'Do you have a system for storing and reusing prompts or AI-generated creative assets?',
      options: {
        A: 'No — prompts live with whoever created them',
        B: 'Some people save their own; nothing shared',
        C: 'Shared folder exists but not maintained',
        D: 'Maintained prompt & asset library available',
      },
      isHardGate: true,
    },
    {
      id: 'D3-Q1',
      dimensionId: 'D3' as DimensionId,
      dimensionName: 'Governance & Risk',
      order: 13,
      text: 'Do your client contracts address ownership of AI-generated creative work?',
      options: {
        A: 'No — contracts don\'t mention AI IP',
        B: 'We rely on general IP/Third-Party clauses',
        C: 'Some newer contracts reference AI',
        D: 'Explicit AI-generated content ownership clauses',
      },
      isHardGate: true,
    },
  ],
  technology_software: [
    {
      id: 'D6-Q1',
      dimensionId: 'D6' as DimensionId,
      dimensionName: 'AI Usage',
      order: 18,
      text: 'How is AI being used in your software development or product lifecycle?',
      options: {
        A: 'Not used at all',
        B: 'Devs use personal AI assistants informally',
        C: 'AI tools embedded in specific stages (e.g., QA, coding)',
        D: 'Full AI-assisted lifecycle: from product specs to code & support',
      },
    },
    {
      id: 'D7-Q1',
      dimensionId: 'D7' as DimensionId,
      dimensionName: 'Tech & Integration',
      order: 20,
      text: 'Are your core systems "AI-Ready" with accessible API end-points?',
      options: {
        A: 'No; systems are closed/legacy',
        B: 'Some APIs exist but they are poorly documented',
        C: 'Standard APIs available for most core systems',
        D: 'API-first architecture; fully ready for AI agent integration',
      },
    },
  ],
  trade_field_services: [
    {
      id: 'D5-Q3',
      dimensionId: 'D5' as DimensionId,
      dimensionName: 'Process Maturity',
      order: 9,
      text: 'How is data captured from the field/site and fed back to the office?',
      options: {
        A: 'Paper or verbal; re-entered later (or lost)',
        B: 'Messaging/Email; slow and manual to sync',
        C: 'Mobile app used for some tasks but not all',
        D: 'Unified mobile-to-office flow; real-time data sync',
      },
    },
    {
      id: 'D8-Q4',
      dimensionId: 'D8' as DimensionId,
      dimensionName: 'Value & ROI',
      order: 23,
      text: 'How effectively do you optimize scheduling, routing, or resource allocation?',
      options: {
        A: 'Purely manual/Intuition based',
        B: 'Basic digital calendar; no optimization',
        C: 'Some digital assistance; manual adjustments',
        D: 'Algorithmic optimization; data drives every route & slot',
      },
    },
  ],
  retail_hospitality: [
    {
      id: 'D1-Q2',
      dimensionId: 'D1' as DimensionId,
      dimensionName: 'Data & Knowledge',
      order: 7,
      text: 'How do you capture and use customer preference or loyalty data?',
      options: {
        A: 'We don\'t; every customer is a "new" transaction',
        B: 'Basic history in POS; not used for personalization',
        C: 'CRM exists; used for occasional marketing',
        D: 'Rich data profile; used to tailor every interaction',
      },
      isHardGate: true,
    },
    {
      id: 'D6-Q5',
      dimensionId: 'D6' as DimensionId,
      dimensionName: 'AI Usage',
      order: 19,
      text: 'How are you using AI for customer service or reservation handling?',
      options: {
        A: 'All manual; phone and email only',
        B: 'Basic chatbots/automated replies',
        C: 'AI-assisted service: handling standard queries automatically',
        D: 'Omnichannel AI: handling complex service & booking flows',
      },
    },
  ],
  health_wellbeing: [
    {
      id: 'D3-Q1',
      dimensionId: 'D3' as DimensionId,
      dimensionName: 'Governance & Risk',
      order: 13,
      text: 'How do you ensure AI tools comply with patient data privacy (GDPR/HIPAA)?',
      options: {
        A: 'No formal assessment has been done',
        B: 'Vague awareness; no technical controls',
        C: 'Privacy assessment completed; policy in place',
        D: 'Full compliance: BAA/Local agreements & encryption active',
      },
      isHardGate: true,
    },
    {
      id: 'D5-Q1',
      dimensionId: 'D5' as DimensionId,
      dimensionName: 'Process Maturity',
      order: 8,
      text: 'How documented are your clinical or wellness protocols?',
      options: {
        A: 'Implicit; we rely on professional training only',
        B: 'Some written guidance; not consistently followed',
        C: 'Documented protocols for main treatments/services',
        D: 'Standardized playbooks; audited & reviewed annually',
      },
    },
  ],
};

export const buildQuestionSet = (sector: Sector): Question[] => {
    const questions = [...universalQuestions];
    const overrides = sectorOverrides[sector];
    if (!overrides) return questions;
    
    return questions.map(uq => {
        const override = overrides.find(oq => oq.id === uq.id);
        return override ? { ...uq, ...override } : uq;
    });
};
