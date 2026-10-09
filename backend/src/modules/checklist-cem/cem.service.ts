import { sqliteClient } from '../../database/connection.js';
import { calculateCemScore } from '@jaspion/shared';

export class CemService {
  async listBlocksWithQuestions() {
    const blocksRes = await sqliteClient.execute('SELECT * FROM cem_blocks ORDER BY order_index ASC');
    const questionsRes = await sqliteClient.execute('SELECT * FROM cem_questions WHERE is_active = 1 ORDER BY order_index ASC');

    const questionsByBlock: Record<string, any[]> = {};
    for (const q of questionsRes.rows) {
      const bId = String(q.block_id);
      if (!questionsByBlock[bId]) questionsByBlock[bId] = [];
      questionsByBlock[bId].push({
        id: q.id,
        text: q.text,
        orderIndex: q.order_index
      });
    }

    return blocksRes.rows.map(b => ({
      id: b.id,
      name: b.name,
      orderIndex: b.order_index,
      color: b.color,
      description: b.description,
      questions: questionsByBlock[String(b.id)] || []
    }));
  }

  async listEvaluations() {
    const res = await sqliteClient.execute('SELECT * FROM cem_evaluations ORDER BY created_at DESC LIMIT 50');
    return res.rows.map(r => ({
      id: r.id,
      ticketProtocol: r.ticket_protocol,
      evaluatorName: r.evaluator_name,
      evaluationDate: r.evaluation_date,
      shift: r.shift,
      scorePercentage: r.score_percentage,
      goodCount: r.good_count,
      badCount: r.bad_count,
      fourthCount: r.fourth_count,
      naCount: r.na_count,
      notes: r.notes,
      createdAt: r.created_at
    }));
  }

  async saveEvaluation(input: any) {
    const { ticketProtocol, evaluationDate, shift, notes, answers } = input;
    const scoreResult = calculateCemScore(answers);
    const now = new Date().toISOString();
    const evalId = `eval_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    await sqliteClient.execute({
      sql: `INSERT INTO cem_evaluations (id, ticket_protocol, evaluator_id, evaluator_name, evaluation_date, shift, score_percentage, good_count, bad_count, fourth_count, na_count, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        evalId,
        ticketProtocol,
        'usr_admin',
        'Operador CCO',
        evaluationDate || now.slice(0, 10),
        shift || 'Comercial',
        scoreResult.score,
        scoreResult.good,
        scoreResult.bad,
        scoreResult.fourth,
        scoreResult.na,
        notes || '',
        now
      ]
    });

    for (const ans of answers) {
      await sqliteClient.execute({
        sql: `INSERT INTO cem_answers (id, evaluation_id, question_id, answer, observation)
              VALUES (?, ?, ?, ?, ?)`,
        args: [
          `ans_${evalId}_${ans.questionId}`,
          evalId,
          ans.questionId,
          ans.answer,
          ans.observation || ''
        ]
      });
    }

    return { id: evalId, ...scoreResult };
  }
}
