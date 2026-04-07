// lib/engine/recommend.ts
// AiGENiQ Recommendation Engine — card selection + priority matrix
// Source: AiGENiQ_Build_Instructions.docx §14 + Selection Algorithm Rules 5-6
// Deterministic, no LLM.

import {
    ScoreResult, ContextAnswers, RecommendationCard,
    DimensionId, MaturityStage, Sector,
} from '../../types';
import { recommendationCards } from '../config/cards.config';
import { sectorWeights } from '../config/weights.config';

// ── Maturity stage ordering for filtering ──
const STAGE_ORDER: Record<MaturityStage, number> = {
    unaware: 0,
    exploring: 1,
    developing: 2,
    scaling: 3,
    leading: 4,
};

// ── Priority Matrix types ──
export type Quadrant = 'FIX_FIRST' | 'LEVERAGE' | 'DEFER' | 'MAINTAIN';

export interface PriorityMatrixItem {
    dimension: DimensionId;
    dimensionName: string;
    impact: number;    // dimension weight (0-1)
    readiness: number; // raw dimension score (0-10)
    quadrant: Quadrant;
}

const DIMENSION_NAMES: Record<DimensionId, string> = {
    D1: 'Data & Knowledge',
    D2: 'Leadership & Strategy',
    D3: 'Governance & Risk',
    D4: 'People & Change',
    D5: 'Process Maturity',
    D6: 'AI Usage & Adoption',
    D7: 'Tech & Integration',
    D8: 'Value & ROI',
};

/**
 * Build the 2×2 Priority Matrix: Impact (weight) vs Readiness (score)
 * Quadrants:
 *   Top-left:     FIX_FIRST  (High Impact, Low Readiness)
 *   Top-right:    LEVERAGE   (High Impact, High Readiness)
 *   Bottom-left:  DEFER      (Low Impact, Low Readiness)
 *   Bottom-right: MAINTAIN   (Low Impact, High Readiness)
 */
export function buildPriorityMatrix(
    scoreResult: ScoreResult,
    sector: Sector
): PriorityMatrixItem[] {
    const weights = sectorWeights[sector] ?? sectorWeights.base;
    const dims: DimensionId[] = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8'];

    // Median thresholds for quadrant assignment
    const impactMedian = 0.13; // median of base weights
    const readinessMedian = 5.0; // midpoint of 0-10 scale

    return dims.map(dim => {
        const impact = weights[dim];
        const readiness = scoreResult.dimensionScores[dim];

        let quadrant: Quadrant;
        if (impact >= impactMedian && readiness < readinessMedian) {
            quadrant = 'FIX_FIRST';
        } else if (impact >= impactMedian && readiness >= readinessMedian) {
            quadrant = 'LEVERAGE';
        } else if (impact < impactMedian && readiness < readinessMedian) {
            quadrant = 'DEFER';
        } else {
            quadrant = 'MAINTAIN';
        }

        return {
            dimension: dim,
            dimensionName: DIMENSION_NAMES[dim],
            impact,
            readiness,
            quadrant,
        };
    });
}

/**
 * Select recommendation cards — 5-step algorithm from spec §14:
 *
 * 1. Weakest dims first — sort by raw score ascending, take top 3
 * 2. Sector filter — only include cards matching current sector
 * 3. Maturity filter — only include cards at/above current maturity stage
 * 4. Gate override — if hard gate fired, force NOW cards for gate dimensions
 * 5. Balance — max 5 cards total
 */
export function selectRecommendations(
    scoreResult: ScoreResult,
    context: ContextAnswers
): RecommendationCard[] {
    const { dimensionScores, gatesTriggered, maturityStage } = scoreResult;
    const dims: DimensionId[] = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8'];

    // Step 1: Sort dimensions by raw score ascending, take weakest 3
    const sortedDims = [...dims].sort(
        (a, b) => dimensionScores[a] - dimensionScores[b]
    );
    const weakestDims = new Set(sortedDims.slice(0, 3));

    // Step 2 & 3: Filter cards by sector and maturity
    const eligible = recommendationCards.filter(card => {
        // Sector filter
        if (card.sectors && card.sectors.length > 0 && !card.sectors.includes(context.sector)) {
            return false;
        }
        if (card.excludeSectors && card.excludeSectors.includes(context.sector)) {
            return false;
        }

        // Maturity filter
        if (card.minMaturityStage && STAGE_ORDER[maturityStage] < STAGE_ORDER[card.minMaturityStage]) {
            return false;
        }

        return true;
    });

    // Step 4: Gate override — force foundational NOW cards for gate dimensions
    const gateCards: RecommendationCard[] = [];
    if (gatesTriggered.length > 0) {
        for (const gate of gatesTriggered) {
            const dim = gate.split('_')[0] as DimensionId; // e.g. 'D1_HARD' -> 'D1'
            const gateCard = eligible.find(
                c => c.triggerDimension === dim && c.placement === 'NOW'
            );
            if (gateCard && !gateCards.find(c => c.id === gateCard.id)) {
                gateCards.push(gateCard);
            }
        }
    }

    // Select cards for weakest dimensions (excluding already-selected gate cards)
    const selectedIds = new Set(gateCards.map(c => c.id));
    const weakCards: RecommendationCard[] = [];

    for (const dim of sortedDims) {
        if (!weakestDims.has(dim)) continue;

        // Find the best card for this dimension based on score
        const dimScore = dimensionScores[dim];
        const candidates = eligible.filter(
            c => c.triggerDimension === dim && !selectedIds.has(c.id) && dimScore <= c.triggerThreshold
        );

        if (candidates.length > 0) {
            // Pick the card with the lowest trigger threshold (most appropriate)
            candidates.sort((a, b) => a.triggerThreshold - b.triggerThreshold);
            weakCards.push(candidates[0]);
            selectedIds.add(candidates[0].id);
        }
    }

    // Step 5: Combine and balance — max 5 cards
    const allSelected = [...gateCards, ...weakCards];

    // If we have fewer than 5, add more from other dimensions
    if (allSelected.length < 5) {
        for (const dim of sortedDims) {
            if (allSelected.length >= 5) break;
            const dimScore = dimensionScores[dim];
            const candidate = eligible.find(
                c => c.triggerDimension === dim && !selectedIds.has(c.id) && dimScore <= c.triggerThreshold
            );
            if (candidate) {
                allSelected.push(candidate);
                selectedIds.add(candidate.id);
            }
        }
    }

    // Cap at 5
    const result = allSelected.slice(0, 5);

    // Sort by placement order: NOW first, then NEXT, then LATER
    const placementOrder = { NOW: 0, NEXT: 1, LATER: 2 };
    result.sort((a, b) => placementOrder[a.placement] - placementOrder[b.placement]);

    return result;
}
