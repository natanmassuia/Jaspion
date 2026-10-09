import { sqliteClient } from '../connection.js';
import fs from 'fs';
import path from 'path';

export async function seedCem() {
  console.log('Seeding Checklist CEM blocks and questions...');
  
  const cemBackupPath = path.resolve(process.cwd(), '../legacy/cco/backup-checklist-cem.json');
  if (!fs.existsSync(cemBackupPath)) {
    console.warn('  Checklist CEM backup file not found at:', cemBackupPath);
    return;
  }

  const raw = fs.readFileSync(cemBackupPath, 'utf-8');
  const data = JSON.parse(raw);
  const now = new Date().toISOString();

  let blocksInserted = 0;
  let questionsInserted = 0;

  for (let i = 0; i < data.blocks.length; i++) {
    const b = data.blocks[i];
    
    // Upsert block
    await sqliteClient.execute({
      sql: `INSERT INTO cem_blocks (id, name, order_index, color, description, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET name = excluded.name, order_index = excluded.order_index, color = excluded.color`,
      args: [b.id, b.name, i + 1, b.color || null, b.description || null, now]
    });
    blocksInserted++;

    if (Array.isArray(b.questions)) {
      for (let j = 0; j < b.questions.length; j++) {
        const q = b.questions[j];
        await sqliteClient.execute({
          sql: `INSERT INTO cem_questions (id, block_id, text, order_index, is_active, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET text = excluded.text, order_index = excluded.order_index`,
          args: [q.id, b.id, q.text, j + 1, 1, now]
        });
        questionsInserted++;
      }
    }
  }

  console.log(`  Checklist CEM seeded: ${blocksInserted} blocks, ${questionsInserted} questions.`);
}
