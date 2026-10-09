import { sqliteClient } from '../connection.js';
import { hash } from '@node-rs/argon2';
import fs from 'fs';
import path from 'path';

export async function migrateFullData() {
  console.log('=== Ingressando Migração Integral de Dados Legados ===');
  const now = new Date().toISOString();

  // 1. Migração de Usuários Operacionais Legados
  console.log('1. Migrando operadores do CCO (auth.js)...');
  const usersToSeed = [
    { id: 'usr_admin', name: 'Administrador CCO', email: 'admin@microset.local', role: 'ADMIN', department: 'Administração', pass: 'Admin@123' },
    { id: 'usr_editor', name: 'Analista QA CCO', email: 'editor@microset.local', role: 'COORDENADOR', department: 'Q.A. CCO', pass: 'Editor@123' },
    { id: 'usr_consulta', name: 'Operador N1 CCO', email: 'consulta@microset.local', role: 'USUARIO', department: 'Operação N1', pass: 'Consulta@123' }
  ];

  for (const u of usersToSeed) {
    const existing = await sqliteClient.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [u.email]
    });
    if (existing.rows.length === 0) {
      const h = await hash(u.pass);
      await sqliteClient.execute({
        sql: `INSERT INTO users (id, name, email, password_hash, role, department, must_change_password, active, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [u.id, u.name, u.email, h, u.role, u.department, 0, 1, now, now]
      });
      console.log(`   Operador criado: ${u.email} (${u.role})`);
    }
  }

  // 2. Unidades Adicionais / Desativadas do Grupo Balbo
  console.log('2. Atualizando unidades complementares do Grupo Balbo...');
  const additionalUnits = [
    {
      id: 'balbo-barueri-gupe',
      clientId: 'grupo-balbo',
      name: 'Balbo — Barueri Gupe (Desativada)',
      city: 'Barueri',
      state: 'SP',
      isActive: false,
      dependencies: 'Unidade desativada no handover anterior.'
    },
    {
      id: 'balbo-cantagalo',
      clientId: 'grupo-balbo',
      name: 'Balbo — Cantagalo (Desativada)',
      city: 'Cantagalo',
      state: 'RJ',
      isActive: false,
      dependencies: 'Unidade desativada no handover anterior.'
    },
    {
      id: 'balbo-torre-altinopolis',
      clientId: 'grupo-balbo',
      name: 'Torre Altinópolis (Pendente de Validação)',
      city: 'Altinópolis',
      state: 'SP',
      isActive: true,
      dependencies: 'Ponto de repetição de rádio em validação de telemetria.'
    }
  ];

  for (const u of additionalUnits) {
    await sqliteClient.execute({
      sql: `INSERT INTO units (id, client_id, name, city, state, is_active, dependencies, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET is_active = excluded.is_active, dependencies = excluded.dependencies`,
      args: [u.id, u.clientId, u.name, u.city, u.state, u.isActive ? 1 : 0, u.dependencies, now, now]
    });
  }

  // 3. Migração do Histórico de Avaliações do Checklist CEM
  console.log('3. Migrando histórico de avaliações do Checklist CEM...');
  const cemBackupPath = fs.existsSync('C:\\Jaspion\\legacy\\cco\\backup-checklist-cem.json') 
    ? 'C:\\Jaspion\\legacy\\cco\\backup-checklist-cem.json' 
    : path.resolve(process.cwd(), 'legacy/cco/backup-checklist-cem.json');
  if (fs.existsSync(cemBackupPath)) {
    const raw = fs.readFileSync(cemBackupPath, 'utf-8');
    const data = JSON.parse(raw);

    if (Array.isArray(data.records) && data.records.length > 0) {
      for (const rec of data.records) {
        // Obter analista ou associar ao usr_editor
        const evalId = rec.id || `eval_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        
        // Contadores
        const answers = Array.isArray(rec.answers) ? rec.answers : [];
        const good = answers.filter((a: any) => a.answer === 'conforme').length;
        const bad = answers.filter((a: any) => a.answer === 'nao-conforme').length;
        const fourth = answers.filter((a: any) => a.answer === 'quarta' || a.answer === 'parcialmente-conforme').length;
        const na = answers.filter((a: any) => a.answer === 'na').length;

        // Upsert avaliação
        await sqliteClient.execute({
          sql: `INSERT INTO cem_evaluations (id, ticket_protocol, evaluator_id, evaluator_name, evaluation_date, shift, score_percentage, good_count, bad_count, fourth_count, na_count, notes, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET score_percentage = excluded.score_percentage`,
          args: [
            evalId,
            rec.ticket || 'SEM_TICKET',
            'usr_editor',
            'Analista QA CCO',
            rec.date || now.slice(0, 10),
            'Comercial',
            rec.score || 0,
            good,
            bad,
            fourth,
            na,
            rec.notes || 'Importado do histórico legado do Checklist CEM v2.2.1',
            rec.createdAt || now
          ]
        });

        // Respostas
        for (const ans of answers) {
          const ansId = `ans_${evalId}_${ans.questionId}`;
          let normAnswer = ans.answer;
          if (normAnswer === 'quarta') normAnswer = 'parcialmente-conforme';

          await sqliteClient.execute({
            sql: `INSERT INTO cem_answers (id, evaluation_id, question_id, answer, observation)
                  VALUES (?, ?, ?, ?, ?)
                  ON CONFLICT(id) DO UPDATE SET answer = excluded.answer, observation = excluded.observation`,
            args: [
              ansId,
              evalId,
              ans.questionId,
              normAnswer,
              ans.observation || ''
            ]
          });
        }
      }
      console.log(`   ${data.records.length} avaliação(ões) histórica(s) migrada(s) com sucesso!`);
    }
  }

  console.log('=== Migração Integral Concluída com Sucesso ===');
}

if (process.argv[1]?.endsWith('migrateFullData.ts')) {
  migrateFullData().then(() => process.exit(0)).catch(err => {
    console.error('Erro na migração:', err);
    process.exit(1);
  });
}
