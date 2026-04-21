// lib/config/questions-preview.config.ts
import { Question, ContextQuestion } from '../../types';
import { contextQuestions, universalQuestions } from './questions.config';

// Mirror of the main config for the preview environment
export const contextQuestionsPreview: ContextQuestion[] = contextQuestions;
export const highImpactQuestionsPreview: Question[] = universalQuestions;
