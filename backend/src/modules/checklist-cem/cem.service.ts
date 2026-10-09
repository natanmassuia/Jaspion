import { sqliteClient } from '../../database/connection.js';
import { calculateCemScore } from '@jaspion/shared';

export class CemService {
  async ensureDraftStorage() {
    await sqliteClient.execute(`CREATE TABLE IF NOT EXISTS cem_drafts (
      evaluator_id TEXT PRIMARY KEY,
      ticket_protocol TEXT NOT NULL,
      evaluation_date TEXT NOT NULL,
      current_block_index INTEGER NOT NULL DEFAULT 0,
      answers_json TEXT NOT NULL DEFAULT '[]',
      updated_at TEXT NOT NULL
    )`);
  }

  async getDraft() {
    const result = await sqliteClient.execute({
      sql: 'SELECT * FROM cem_drafts WHERE evaluator_id = ?',
      args: ['usr_admin']
    });
    const draft = result.rows[0];
    if (!draft) return null;
    const storedDraft = JSON.parse(String(draft.answers_json || '[]'));
    return {
      ticketProtocol: draft.ticket_protocol,
      evaluationDate: draft.evaluation_date,
      currentBlockIndex: Number(draft.current_block_index || 0),
      answers: Array.isArray(storedDraft) ? storedDraft : storedDraft.answers || [],
      editingEvaluationId: Array.isArray(storedDraft) ? null : storedDraft.editingEvaluationId || null,
      updatedAt: draft.updated_at
    };
  }

  async saveDraft(input: any) {
    const now = new Date().toISOString();
    await sqliteClient.execute({
      sql: `INSERT INTO cem_drafts (evaluator_id, ticket_protocol, evaluation_date, current_block_index, answers_json, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(evaluator_id) DO UPDATE SET
              ticket_protocol = excluded.ticket_protocol,
              evaluation_date = excluded.evaluation_date,
              current_block_index = excluded.current_block_index,
              answers_json = excluded.answers_json,
              updated_at = excluded.updated_at`,
      args: [
        'usr_admin',
        input.ticketProtocol,
        input.evaluationDate,
        Number(input.currentBlockIndex || 0),
        JSON.stringify({
          answers: input.answers || [],
          editingEvaluationId: input.editingEvaluationId || null
        }),
        now
      ]
    });
    return { updatedAt: now };
  }

  async clearDraft() {
    await sqliteClient.execute({
      sql: 'DELETE FROM cem_drafts WHERE evaluator_id = ?',
      args: ['usr_admin']
    });
  }

  private mapEvaluation(r: any) {
    return {
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
    };
  }

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
    return res.rows.map(r => this.mapEvaluation(r));
  }

  async getEvaluation(id: string) {
    const evaluationRes = await sqliteClient.execute({
      sql: 'SELECT * FROM cem_evaluations WHERE id = ?',
      args: [id]
    });
    const row = evaluationRes.rows[0];
    if (!row) return null;

    const answersRes = await sqliteClient.execute({
      sql: 'SELECT question_id, answer, observation FROM cem_answers WHERE evaluation_id = ?',
      args: [id]
    });

    return {
      ...this.mapEvaluation(row),
      answers: answersRes.rows.map(answer => ({
        questionId: answer.question_id,
        answer: answer.answer,
        observation: answer.observation || ''
      }))
    };
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

  async updateEvaluation(id: string, input: any) {
    const existing = await sqliteClient.execute({
      sql: 'SELECT id FROM cem_evaluations WHERE id = ?',
      args: [id]
    });
    if (!existing.rows[0]) return null;

    const { ticketProtocol, evaluationDate, shift, notes, answers } = input;
    const scoreResult = calculateCemScore(answers);
    const statements: any[] = [
      {
        sql: `UPDATE cem_evaluations
              SET ticket_protocol = ?, evaluation_date = ?, shift = ?, score_percentage = ?, good_count = ?, bad_count = ?, fourth_count = ?, na_count = ?, notes = ?
              WHERE id = ?`,
        args: [
          ticketProtocol,
          evaluationDate,
          shift || 'Comercial',
          scoreResult.score,
          scoreResult.good,
          scoreResult.bad,
          scoreResult.fourth,
          scoreResult.na,
          notes || '',
          id
        ]
      },
      { sql: 'DELETE FROM cem_answers WHERE evaluation_id = ?', args: [id] },
      ...answers.map((answer: any) => ({
        sql: `INSERT INTO cem_answers (id, evaluation_id, question_id, answer, observation)
              VALUES (?, ?, ?, ?, ?)`,
        args: [
          `ans_${id}_${answer.questionId}`,
          id,
          answer.questionId,
          answer.answer,
          answer.observation || ''
        ]
      }))
    ];

    await sqliteClient.batch(statements, 'write');
    return { id, ...scoreResult };
  }
}
