// lib/config/questions.config.ts
import { Question, ContextQuestion, Sector, DimensionId } from '../../types';

// ─── CONTEXT QUESTIONS (Human-Centric 2026v) ───
export const contextQuestions: ContextQuestion[] = [
  {
    id: 'C-Q1',
    order: 1,
    text: 'Which sector best describes your business environment?',
    options: ['Professional Services', 'Creative & Agency', 'Technology & Software', 'Trade & Field Services', 'Retail & Hospitality', 'Health & Wellbeing', 'Other'],
    isMultiSelect: false,
  },
  {
    id: 'C-Q2',
    order: 2,
    text: 'What is the current scale of your team?',
    options: ['Solo / just me', '2–9', '10–49', '50–249', '250+'],
    isMultiSelect: false,
  },
  {
    id: 'C-Q3',
    order: 3,
    text: 'Which AI capabilities are you currently using?',
    options: ['Basic Chat (ChatGPT / Claude)', 'Automated Workflows (Zapier / Make)', 'Custom AI Assistants', 'Microsoft Copilot / Google Gemini', 'Specialist Creative Tools', 'None / Manual Only', 'Other'],
    isMultiSelect: true,
  },
  {
    id: 'C-Q4',
    order: 4,
    text: 'What is your primary goal for AI in 2026?',
    options: ['Automate Repetitive Admin', 'Speed Up Client Delivery', 'Better Financial Insights', 'Scale Without Hiring', 'Improve Customer Response', 'Content & Creative Velocity', 'Data-Driven Decisions'],
    isMultiSelect: true,
    maxSelections: 3,
  },
  {
    id: 'C-Q5',
    order: 5,
    text: 'Who is leading this assessment today?',
    options: ['Owner / CEO / Director', 'Operations Manager', 'Technical / Digital Lead', 'Consultant / Advisor', 'Other'],
    isMultiSelect: false,
  },
];

// ─── THE HUMAN-CENTRIC 2026v POWER 25 (Expert Logic, Simple Language) ───
export const universalQuestions: Question[] = [
  // PHASE 01: THE COLLECTIVE BRAIN
  {
    id: 'D1-Q1',
    dimensionId: 'D1' as DimensionId,
    dimensionName: 'Collective Memory',
    order: 6,
    text: 'How easily can an AI find and use your firm\'s past expertise and documents?',
    options: {
      A: 'Impossible; it’s all trapped in separate folders and people\'s heads',
      B: 'Difficult; it involves lots of searching and manual digging',
      C: 'Easy; we have a centralized firm brain the AI can access',
      D: 'Seamless; the AI proactively uses our past work to help with new tasks',
    },
    isHardGate: true,
  },
  {
    id: 'D1-Q2',
    dimensionId: 'D1' as DimensionId,
    dimensionName: 'Collective Memory',
    order: 7,
    text: 'When you want to teach an AI about your business, how ready is your data?',
    options: {
      A: 'Not ready; our files are messy, outdated, or disorganized',
      B: 'Messy; it would take months of manual cleanup to be useful',
      C: 'Mostly ready; our core info is clean and well-structured',
      D: 'Perfectly ready; our systems are built for an AI to learn from instantly',
    },
    isHardGate: true,
  },
  {
    id: 'D5-Q1',
    dimensionId: 'D5' as DimensionId,
    dimensionName: 'Smart Workflows',
    order: 8,
    text: 'How much of your daily business logic is actually written down and followed?',
    options: {
      A: 'Almost none — we just know how to do things',
      B: 'Some notes exist, but everyone does things differently',
      C: 'Most key steps are documented and used by the team',
      D: 'Fully mapped out; even a machine could follow our steps',
    },
  },
  {
    id: 'D5-Q3',
    dimensionId: 'D5' as DimensionId,
    dimensionName: 'Smart Workflows',
    order: 9,
    text: 'How does work move between team members (or between people and AI)?',
    options: {
      A: 'Manual; requires lots of emails, messages, and chasing',
      B: 'Clunky; we use tools but things still get missed',
      C: 'Smooth; triggers and apps handle the hand-offs automatically',
      D: 'Autonomous; work flows effortlessly with zero human nagging',
    },
  },
  {
    id: 'D5-Q5',
    dimensionId: 'D5' as DimensionId,
    dimensionName: 'Smart Workflows',
    order: 10,
    text: 'Can you see in real-time if your automations are actually working?',
    options: {
      A: 'No; we only find out if something breaks',
      B: 'Sort of; we have to manually check each tool',
      C: 'Yes; we have a basic dashboard showing our progress',
      D: 'Fully; we track efficiency and errors on a live dashboard',
    },
  },

  // PHASE 02: LEADERSHIP & SAFETY
  {
    id: 'D2-Q1',
    dimensionId: 'D2' as DimensionId,
    dimensionName: 'AI Leadership',
    order: 11,
    text: 'Is your 2026 strategy about using tools or building outcome engines?',
    options: {
      A: 'Just tools (like using ChatGPT occasionally)',
      B: 'Small automations (saving 5 mins here and there)',
      C: 'Strategic shifts (automating entire departments)',
      D: 'Total transformation (AI is the core of how we grow)',
    },
    isSoftGate: true,
  },
  {
    id: 'D2-Q2',
    dimensionId: 'D2' as DimensionId,
    dimensionName: 'AI Leadership',
    order: 12,
    text: 'Who takes responsibility if an AI makes a mistake or leaks data?',
    options: {
      A: 'Nobody; we haven\'t thought about that yet',
      B: 'The individual employee who was using the tool',
      C: 'A designated lead, but they don\'t have much power',
      D: 'The leadership team; it’s a top-level priority',
    },
  },
  {
    id: 'D3-Q1',
    dimensionId: 'D3' as DimensionId,
    dimensionName: 'Trust & Safety',
    order: 13,
    text: 'If an AI assistant gave a client wrong information today, would you know?',
    options: {
      A: 'No; we trust the AI completely without checking',
      B: 'Unlikely; we don\'t have a system to verify AI output',
      C: 'Yes; we do spot checks on AI-generated work',
      D: 'Yes; we have built-in safety gates and human reviews',
    },
    isHardGate: true,
  },
  {
    id: 'D3-Q3',
    dimensionId: 'D3' as DimensionId,
    dimensionName: 'Trust & Safety',
    order: 14,
    text: 'Is your sensitive business data kept inside your own private systems?',
    options: {
      A: 'No; everything goes into public tools like free ChatGPT',
      B: 'Some is private, but most is shared with the tool providers',
      C: 'Most core data is sovereign (kept in our private accounts)',
      D: '100% Secure; we have total control over all AI data',
    },
    isHardGate: true,
  },
  {
    id: 'D3-Q4',
    dimensionId: 'D3' as DimensionId,
    dimensionName: 'Trust & Safety',
    order: 15,
    text: 'How carefully do you check new AI tools before letting the team use them?',
    options: {
      A: 'We don\'t; if it looks cool, we just sign up',
      B: 'We look at the website, but do no real testing',
      C: 'We use an informal checklist of obvious risks',
      D: 'We have a strict security process for every new tool',
    },
  },

  // PHASE 03: TEAM & SPEED
  {
    id: 'D4-Q1',
    dimensionId: 'D4' as DimensionId,
    dimensionName: 'Team Culture',
    order: 16,
    text: 'How does your team feel about AI replacing tasks or jobs?',
    options: {
      A: 'Anxious; there is a lot of fear and resistance',
      B: 'Quiet; people are skeptical but don’t say much',
      C: 'Open; they are waiting for training and guidance',
      D: 'Excited; they are actively finding ways to use AI better',
    },
  },
  {
    id: 'D4-Q4',
    dimensionId: 'D4' as DimensionId,
    dimensionName: 'Team Culture',
    order: 17,
    text: 'How much are you investing in training your people on AI?',
    options: {
      A: 'Zero; we just buy the tools and hope they work',
      B: 'Very little; maybe a webinar every now and then',
      C: 'A fair amount; we have dedicated internal AI champions',
      D: 'Significant; AI training is a core part of our culture',
    },
  },
  {
    id: 'D6-Q1',
    dimensionId: 'D6' as DimensionId,
    dimensionName: 'Business Velocity',
    order: 18,
    text: 'How fast can you launch a new service or product using AI?',
    options: {
      A: 'Months; everything is still a manual struggle',
      B: 'Weeks; we use AI to help with some of the heavy lifting',
      C: 'Days; we use smart templates and AI-assisted builds',
      D: 'Hours; we can go from idea to launch almost instantly',
    },
  },
  {
    id: 'D6-Q5',
    dimensionId: 'D6' as DimensionId,
    dimensionName: 'Business Velocity',
    order: 19,
    text: 'How many of your daily business tasks now run on auto-pilot?',
    options: {
      A: 'None — everything requires a human touch',
      B: 'A few small things (like scheduling or reminders)',
      C: 'Major sections (like lead generation or reporting)',
      D: 'End-to-end; entire workflows manage themselves',
    },
  },
  {
    id: 'D7-Q1',
    dimensionId: 'D7' as DimensionId,
    dimensionName: 'The Tech Stack',
    order: 20,
    text: 'Can your different software tools "talk" to each other easily?',
    options: {
      A: 'No; we have to copy-paste data between systems',
      B: 'Poorly; it takes a lot of manual work to bridge them',
      C: 'Well; most of our tools are connected and sync data',
      D: 'Perfectly; our systems are AI-native and fully linked',
    },
  },
  {
    id: 'D7-Q2',
    dimensionId: 'D7' as DimensionId,
    dimensionName: 'The Tech Stack',
    order: 21,
    text: 'How long does it take to get an answer from your business data?',
    options: {
      A: 'Hours or days; it requires a manual search',
      B: 'Minutes; we have to dig through several dashboards',
      C: 'Seconds; we can just ask our internal AI',
      D: 'Instantly; the data is live-streamed and always ready',
    },
  },

  // PHASE 04: PROFIT & GROWTH
  {
    id: 'D8-Q1',
    dimensionId: 'D8' as DimensionId,
    dimensionName: 'Profit Impact',
    order: 22,
    text: 'Do you know exactly how much money AI is saving (or making) you?',
    options: {
      A: 'No; AI is just an extra cost for us right now',
      B: 'We have a gut feel that it’s saving us some time',
      C: 'Yes; we track specific savings in time and money',
      D: 'Clearly; AI is a major contributor to our bottom-line profit',
    },
  },
  {
    id: 'D8-Q4',
    dimensionId: 'D8' as DimensionId,
    dimensionName: 'Profit Impact',
    order: 23,
    text: 'How do you decide where to use AI next in your business?',
    options: {
      A: 'We just follow whatever is trending in the news',
      B: 'We try things out based on what feels most painful',
      C: 'We use a simple formula to see what will have most impact',
      D: 'We use a data-driven model to find our biggest profit leaks',
    },
  },
  {
    id: 'D8-Q5',
    dimensionId: 'D8' as DimensionId,
    dimensionName: 'Profit Impact',
    order: 24,
    text: 'What is your long-term plan for Team Size vs. Business Growth?',
    options: {
      A: 'We will just hire more people as we grow',
      B: 'We hope AI makes people slightly more efficient',
      C: 'We want to double our output with the same team size',
      D: 'We want to grow infinitely without needing to hire more',
    },
  },
  {
    id: 'FUN-Q1',
    order: 25,
    dimensionId: 'D4' as DimensionId,
    dimensionName: 'Bonus Insight',
    text: 'If your business had a digital twin that never slept, what would it do first?',
    options: {
      A: 'Handling all the boring admin and paperwork',
      B: 'Finding and closing new sales automatically',
      C: 'Delivering perfect quality work to every client',
      D: 'Constantly improving itself and finding new profit',
    },
  },
];

// ─── SECTOR OVERRIDES (Human-Centric 2026v) ───
export const sectorOverrides: Partial<Record<Sector, Question[]>> = {
  professional_services: [
    {
      id: 'D3-Q1',
      dimensionId: 'D3' as DimensionId,
      dimensionName: 'Trust & Safety',
      order: 13,
      text: 'Have you checked that your AI use follows your industry\'s 2026 rules?',
      options: {
        A: 'No; we haven’t looked at the latest regulations',
        B: 'Vaguely aware of the new rules, but no action yet',
        C: 'Yes; we’ve reviewed our tools and updated our policy',
        D: 'Fully compliant; we are officially certified for AI use',
      },
      isHardGate: true,
    },
  ],
  creative_agency: [
    {
      id: 'D1-Q2',
      dimensionId: 'D1' as DimensionId,
      dimensionName: 'Collective Memory',
      order: 7,
      text: 'Do you have a creative archive of all your past client work that an AI can use?',
      options: {
        A: 'No; it lives on hard drives and in people\'s memories',
        B: 'Folders only; the AI can’t actually see or learn from it',
        C: 'Yes; we have a shared library of assets and prompts',
        D: 'Fully; we have a brain that knows every project we’ve ever done',
      },
      isHardGate: true,
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
