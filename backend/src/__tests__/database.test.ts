import { describe, it, expect } from 'vitest';
import { sqliteClient } from '../database/connection.js';

describe('Database Integrity & Seeds Verification', () => {
  it('should have initial admin user', async () => {
    const result = await sqliteClient.execute({
      sql: 'SELECT email, role, active FROM users WHERE email = ?',
      args: ['admin@microset.local']
    });
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].role).toBe('ADMIN');
    expect(result.rows[0].active).toBe(1);
  });

  it('should have Grupo Balbo client and confirmed units', async () => {
    const client = await sqliteClient.execute({
      sql: 'SELECT id, name, is_vip FROM clients WHERE id = ?',
      args: ['grupo-balbo']
    });
    expect(client.rows.length).toBe(1);
    expect(client.rows[0].is_vip).toBe(1);

    const units = await sqliteClient.execute({
      sql: 'SELECT COUNT(*) as count FROM units WHERE client_id = ?',
      args: ['grupo-balbo']
    });
    expect(Number(units.rows[0].count)).toBeGreaterThanOrEqual(8);
  });

  it('should have 7 CEM blocks and 90 questions seeded', async () => {
    const blocks = await sqliteClient.execute('SELECT COUNT(*) as count FROM cem_blocks');
    expect(Number(blocks.rows[0].count)).toBe(7);

    const questions = await sqliteClient.execute('SELECT COUNT(*) as count FROM cem_questions');
    expect(Number(questions.rows[0].count)).toBe(90);
  });
});
