// types/index.ts — AiGENiQ shared TypeScript interfaces
// Source of truth: AiGENiQ_Build_Instructions.docx §4

export type Sector =
  | 'professional_services'
  | 'creative_agency'
  | 'technology_software'
  | 'trade_field_services'
  | 'retail_hospitality'
  | 'health_wellbeing';

export type AnswerValue = 'A' | 'B' | 'C' | 'D' | 'SKIPPED';
export type Answers = Record<string, AnswerValue>;

export type DimensionId = 'D1' | 'D2' | 'D3' | 'D4' | 'D5' | 'D6' | 'D7' | 'D8';

export type MaturityStage = 'unaware' | 'exploring' | 'developing' | 'scaling' | 'leading';

export interface Question {
  id: string;
  dimensionId: DimensionId;
  dimensionName: string;
  order: number;
  text: string;
  options: { A: string; B: string; C: string; D: string };
  isBranchParent?: boolean;
  branchTrigger?: 'A';
  childQuestions?: string[];
  autoScoreOnSkip?: number;
  isBranchChild?: boolean;
  isHardGate?: boolean;
  isSoftGate?: boolean;
}

export interface ContextQuestion {
  id: string;
  order: number;
  text: string;
  options: string[];
  isMultiSelect: boolean;
  maxSelections?: number | null;
}

export interface ScoreResult {
  finalScore: number;
  maturityStage: MaturityStage;
  dimensionScores: Record<DimensionId, number>;
  gatesTriggered: string[];
  gateCap: number;
  penaltyApplied: number;
  boostApplied: boolean;
}

export interface ContextAnswers {
  sector: Sector;
  companySize: string;
  aiToolsUsed: string[];
  priorityAreas: string[];
  respondentRole: string;
}

export interface RecommendationCard {
  id: string;
  title: string;
  placement: 'NOW' | 'NEXT' | 'LATER';
  triggerDimension: DimensionId;
  triggerThreshold: number;
  minMaturityStage?: MaturityStage;
  ownerRole: string;
  effortLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  firstSteps: string[];
  whyItMatters: string;
  sectors?: Sector[];
  excludeSectors?: Sector[];
  sizeMin?: number;
  sizeMax?: number;
}

export interface AssessmentResult {
  score: ScoreResult;
  context: ContextAnswers;
  selectedCards: RecommendationCard[];
  answers: Answers;
}

export const SECTOR_LABELS: Record<Sector, string> = {
  professional_services: 'Professional Services',
  creative_agency: 'Creative Agency',
  technology_software: 'Tech & Software',
  trade_field_services: 'Trade & Field',
  retail_hospitality: 'Retail & Hospitality',
  health_wellbeing: 'Health & Wellbeing',
};

export const SECTOR_DESCRIPTIONS: Record<Sector, string> = {
  professional_services: 'Legal, accountancy, HR, finance, consultancy',
  creative_agency: 'Marketing, design, PR, content, media',
  technology_software: 'SaaS, IT services, digital agency, tech startup',
  trade_field_services: 'Construction, engineering, maintenance, logistics',
  retail_hospitality: 'E-commerce, physical retail, restaurants, hotels',
  health_wellbeing: 'Clinics, dentists, physios, wellness, care homes',
};

export const DIMENSION_NAMES: Record<DimensionId, string> = {
  D1: 'Data & Knowledge Foundations',
  D2: 'Leadership & Strategy',
  D3: 'Governance & Risk',
  D4: 'People & Change Readiness',
  D5: 'Process Maturity',
  D6: 'AI Usage & Adoption',
  D7: 'Tech & Integration',
  D8: 'Value & ROI Discipline',
};

export const MATURITY_LABELS: Record<MaturityStage, string> = {
  unaware: 'Unaware',
  exploring: 'Exploring',
  developing: 'Developing',
  scaling: 'Scaling',
  leading: 'Leading',
};

export const MATURITY_DESCRIPTIONS: Record<MaturityStage, string> = {
  unaware: 'Owner-led, spreadsheet-driven, no dedicated IT, AI not on radar',
  exploring: 'Individuals experimenting with ChatGPT etc. No coordination, rules, or shared direction',
  developing: 'First pilots underway. A champion exists. Governance conversations started. Leadership aware but patchy',
  scaling: 'AI in core processes. Governance exists. ROI measured. Multiple tools in production with clear owners',
  leading: 'AI is a strategic differentiator. Budget line item. Continuous improvement. Governance mature',
};
