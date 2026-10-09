import { z } from 'zod';
import { CEM_ANSWER_TYPES } from '../constants/index.js';

export const cemEvaluationAnswerSchema = z.object({
  questionId: z.string().min(1),
  answer: z.enum([
    CEM_ANSWER_TYPES.CONFORME,
    CEM_ANSWER_TYPES.NAO_CONFORME,
    CEM_ANSWER_TYPES.PARCIALMENTE_CONFORME,
    CEM_ANSWER_TYPES.NA
  ]),
  observation: z.string().optional().default('')
});

export const cemEvaluationCreateSchema = z.object({
  ticketProtocol: z.string().min(1, 'Número do chamado/ticket é obrigatório'),
  evaluationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  shift: z.string().optional().default('Comercial'),
  notes: z.string().optional().default(''),
  answers: z.array(cemEvaluationAnswerSchema)
});

export type CemEvaluationCreateInput = z.infer<typeof cemEvaluationCreateSchema>;

export function calculateCemScore(answers: Array<{ answer: string }>): {
  score: number;
  good: number;
  bad: number;
  fourth: number;
  na: number;
} {
  const good = answers.filter(a => a.answer === CEM_ANSWER_TYPES.CONFORME).length;
  const bad = answers.filter(a => a.answer === CEM_ANSWER_TYPES.NAO_CONFORME).length;
  const fourth = answers.filter(a => a.answer === CEM_ANSWER_TYPES.PARCIALMENTE_CONFORME).length;
  const na = answers.filter(a => a.answer === CEM_ANSWER_TYPES.NA).length;

  const applicable = good + bad + fourth;
  const score = applicable > 0 ? Math.round((good / applicable) * 100) : 0;

  return { score, good, bad, fourth, na };
}
