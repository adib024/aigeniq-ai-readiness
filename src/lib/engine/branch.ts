// lib/engine/branch.ts
// Branching logic evaluator
// Source: AiGENiQ_Build_Instructions.docx §5.3

import { Question, Answers, AnswerValue } from '../../types';

/**
 * Evaluate branching logic based on current answers.
 * When a BRANCH PARENT question is answered A:
 *   - Mark all child Q-IDs as SKIPPED
 *   - Assign autoScoreOnSkip (0.5 pts)
 *   - Skip those questions in the UI
 * 
 * Returns: Updated answers with SKIPPED entries, and filtered visible question list.
 */
export function evaluateBranching(
  questions: Question[],
  answers: Answers
): { visibleQuestions: Question[]; updatedAnswers: Answers } {
  const updatedAnswers = { ...answers };
  const skippedIds = new Set<string>();

  // Find all branch parents and evaluate their triggers
  questions.forEach(q => {
    if (q.isBranchParent && updatedAnswers[q.id] === 'A') {
      // Branch triggered — skip all children
      (q.childQuestions || []).forEach(childId => {
        updatedAnswers[childId] = 'SKIPPED' as AnswerValue;
        skippedIds.add(childId);
      });
    }
  });

  // Also clear SKIPPED status if parent answer changes from A to something else
  questions.forEach(q => {
    if (q.isBranchParent && updatedAnswers[q.id] && updatedAnswers[q.id] !== 'A') {
      (q.childQuestions || []).forEach(childId => {
        if (updatedAnswers[childId] === 'SKIPPED') {
          delete updatedAnswers[childId];
          skippedIds.delete(childId);
        }
      });
    }
  });

  // Filter out skipped questions for the visible list
  const visibleQuestions = questions.filter(q => !skippedIds.has(q.id));

  return { visibleQuestions, updatedAnswers };
}

/**
 * Get the count of visible questions for progress tracking.
 */
export function getVisibleQuestionCount(
  questions: Question[],
  answers: Answers
): number {
  const { visibleQuestions } = evaluateBranching(questions, answers);
  return visibleQuestions.length;
}
