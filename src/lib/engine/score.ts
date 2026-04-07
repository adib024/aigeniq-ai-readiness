// lib/engine/score.ts
// AiGENiQ Scoring Engine — ~60 lines, deterministic, no LLM
// Source: AiGENiQ_Build_Instructions.docx §6
// The 8-Step Formula — exact implementation from spec

import { sectorWeights } from '../config/weights.config';
import { Sector, Answers, DimensionId, ScoreResult, MaturityStage } from '../../types';

const ANSWER_POINTS: Record<string, number> = { A: 0, B: 1.5, C: 3, D: 4, SKIPPED: 0.5 };
const HARD_CAP = 4.5;
const SOFT_CAP = 5.5;
const HARD_THRESH = 2.0;
const SOFT_THRESH = 2.5;
const PENALTY_AMT = 0.3;
const BOOST_AMT = 0.4;
const BOOST_MIN = 7.0;
const PENALTY_MIN = 2.0;
const DIMS: DimensionId[] = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8'];
const NON_GATE_DIMS: DimensionId[] = ['D4', 'D5', 'D6', 'D7', 'D8'];

export function calculateScore(
  answers: Answers,
  sector: Sector
): ScoreResult {
  const dimScores: Record<string, number> = {};

  // Steps 1 & 2: Calculate raw dimension scores (0–10)
  DIMS.forEach(dim => {
    let sum = 0, max = 0;
    Object.entries(answers).forEach(([qid, ans]) => {
      if (!qid.startsWith(dim + '-')) return;
      sum += ANSWER_POINTS[ans] ?? 0;
      max += 4;
    });
    dimScores[dim] = max > 0 ? (sum / max) * 10 : 0;
  });

  // Step 3: Hard gate check (D1, D3)
  let gateCap = 10;
  const gatesTriggered: string[] = [];
  if (dimScores['D1'] < HARD_THRESH) { gateCap = Math.min(gateCap, HARD_CAP); gatesTriggered.push('D1_HARD'); }
  if (dimScores['D3'] < HARD_THRESH) { gateCap = Math.min(gateCap, HARD_CAP); gatesTriggered.push('D3_HARD'); }

  // Step 4: Soft gate check (D2) — only applies if hard gate hasn't already capped lower
  if (dimScores['D2'] < SOFT_THRESH && gateCap > SOFT_CAP) {
    gateCap = SOFT_CAP;
    gatesTriggered.push('D2_SOFT');
  }

  // Step 5: Weighted composite using sector weight profile
  const weights = sectorWeights[sector] ?? sectorWeights.base;
  let weighted = DIMS.reduce((sum, d) => sum + (dimScores[d] * weights[d]), 0);

  // Step 6: Penalty deduction for weak non-gate dimensions
  const penaltyDims = NON_GATE_DIMS.filter(d => dimScores[d] < PENALTY_MIN);
  const penaltyApplied = penaltyDims.length * PENALTY_AMT;
  weighted -= penaltyApplied;

  // Step 7: Boost if ALL 8 dimensions ≥ 7.0
  const allHigh = DIMS.every(d => dimScores[d] >= BOOST_MIN);
  const boostApplied = allHigh;
  if (boostApplied) weighted += BOOST_AMT;

  // Step 8: Final score = min(weighted, gateCap), rounded to 1 decimal
  const finalScore = Math.round(Math.min(Math.max(weighted, 0), gateCap) * 10) / 10;
  const maturityStage = getStage(finalScore);

  return {
    finalScore,
    maturityStage,
    dimensionScores: dimScores as Record<DimensionId, number>,
    gatesTriggered,
    gateCap,
    penaltyApplied,
    boostApplied,
  };
}

function getStage(score: number): MaturityStage {
  if (score <= 2.0) return 'unaware';
  if (score <= 4.0) return 'exploring';
  if (score <= 6.0) return 'developing';
  if (score <= 8.0) return 'scaling';
  return 'leading';
}
