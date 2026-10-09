import { describe, it, expect } from 'vitest';
import { calculateCemScore } from '@jaspion/shared';

describe('Checklist CEM Score Calculation', () => {
  it('calculates 100% when all applicable answers are conforme', () => {
    const answers = [
      { answer: 'conforme' },
      { answer: 'conforme' },
      { answer: 'na' } // NA ignored
    ];
    const result = calculateCemScore(answers);
    expect(result.score).toBe(100);
    expect(result.good).toBe(2);
    expect(result.bad).toBe(0);
    expect(result.na).toBe(1);
  });

  it('calculates 50% when half are conforme and half are nao-conforme', () => {
    const answers = [
      { answer: 'conforme' },
      { answer: 'nao-conforme' }
    ];
    const result = calculateCemScore(answers);
    expect(result.score).toBe(50);
  });

  it('counts parcialmente-conforme as applicable denominator in legacy formula', () => {
    const answers = [
      { answer: 'conforme' },
      { answer: 'parcialmente-conforme' }
    ];
    const result = calculateCemScore(answers);
    expect(result.score).toBe(50);
    expect(result.fourth).toBe(1);
  });
});
