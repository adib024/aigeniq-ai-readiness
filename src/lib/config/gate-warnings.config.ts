// lib/config/gate-warnings.config.ts
// Gate warning text blocks — rendered prominently on results page when gates fire
// Source: AiGENiQ_Build_Instructions.docx §10.2

export interface GateWarning {
  headline: string;
  body: string;
}

export const GATE_WARNINGS: Record<string, GateWarning> = {
  D1_HARD: {
    headline: '⚠️ Data Foundations Gate',
    body: 'Your score has been capped at 4.5 (Exploring). Your Data & Knowledge Foundations score is critically low, which means advanced AI initiatives will fail regardless of progress in other areas. The BCG AI Maturity Matrix identifies this as the single most common reason SMEs fail to generate AI value. Address your data foundations before pursuing any other AI initiative.',
  },
  D3_HARD: {
    headline: '⚠️ Governance Gate',
    body: 'Your score has been capped at 4.5 (Exploring). Your Governance & Risk score is critically low. Post-EU AI Act (2024), operating AI tools without governance controls is a legal and reputational exposure. This is not a bureaucratic hurdle — it is the foundation that makes all AI use defensible.',
  },
  D2_SOFT: {
    headline: '⚠️ Leadership Gate',
    body: 'Your score has been capped at 5.5 (Developing). Without visible leadership ownership of AI, even technically strong implementations stall at scale. McKinsey (2024) identifies leadership as the #1 barrier to AI success in organisations of your size — not technology, not employee readiness.',
  },
};
