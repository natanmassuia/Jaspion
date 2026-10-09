import { sqliteClient } from './connection.js';

console.log('Running automatic schema initialization with LibSQL / SQLite...');

async function runMigrations() {
  await sqliteClient.execute('PRAGMA foreign_keys = ON;');

  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'USUARIO',
      department TEXT NOT NULL,
      must_change_password INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      failed_attempts INTEGER NOT NULL DEFAULT 0,
      locked_until INTEGER,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      expires_at INTEGER NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      is_vip INTEGER NOT NULL DEFAULT 0,
      economic_group TEXT,
      manager_name TEXT,
      gn_name TEXT,
      sankhya_code TEXT,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS units (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      intra_code TEXT,
      sankhya_code TEXT,
      city TEXT,
      state TEXT,
      address TEXT,
      business_hours TEXT,
      phone TEXT,
      environment TEXT DEFAULT 'Produção',
      dependencies TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS circuits (
      id TEXT PRIMARY KEY,
      unit_id TEXT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
      operator TEXT NOT NULL,
      technology TEXT,
      speed_mbps INTEGER,
      circuit_id TEXT,
      contract_id TEXT,
      lp_ip TEXT,
      lp_vpn TEXT,
      is_primary INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role_description TEXT,
      phone TEXT,
      mobile TEXT,
      whatsapp TEXT,
      email TEXT,
      schedule TEXT,
      created_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS unit_contacts (
      unit_id TEXT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
      contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
      priority_order INTEGER NOT NULL DEFAULT 1,
      PRIMARY KEY (unit_id, contact_id)
    );`,
    `CREATE TABLE IF NOT EXISTS procedures (
      id TEXT PRIMARY KEY,
      unit_id TEXT REFERENCES units(id) ON DELETE CASCADE,
      client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
      category TEXT NOT NULL,
      content TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS cem_blocks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      color TEXT,
      description TEXT,
      created_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS cem_questions (
      id TEXT PRIMARY KEY,
      block_id TEXT NOT NULL REFERENCES cem_blocks(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS cem_evaluations (
      id TEXT PRIMARY KEY,
      ticket_protocol TEXT NOT NULL,
      evaluator_id TEXT NOT NULL REFERENCES users(id),
      evaluator_name TEXT NOT NULL,
      evaluation_date TEXT NOT NULL,
      shift TEXT NOT NULL DEFAULT 'Comercial',
      score_percentage INTEGER NOT NULL,
      good_count INTEGER NOT NULL,
      bad_count INTEGER NOT NULL,
      fourth_count INTEGER NOT NULL,
      na_count INTEGER NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS cem_answers (
      id TEXT PRIMARY KEY,
      evaluation_id TEXT NOT NULL REFERENCES cem_evaluations(id) ON DELETE CASCADE,
      question_id TEXT NOT NULL REFERENCES cem_questions(id),
      answer TEXT NOT NULL,
      observation TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS cem_drafts (
      evaluator_id TEXT PRIMARY KEY,
      ticket_protocol TEXT NOT NULL,
      evaluation_date TEXT NOT NULL,
      current_block_index INTEGER NOT NULL DEFAULT 0,
      answers_json TEXT NOT NULL DEFAULT '[]',
      updated_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS znuny_tickets_mirror (
      id TEXT PRIMARY KEY,
      tn TEXT NOT NULL,
      title TEXT NOT NULL,
      customer_id TEXT,
      customer_user_login TEXT,
      queue TEXT,
      state TEXT,
      priority TEXT,
      owner TEXT,
      service TEXT,
      circuit_ref TEXT,
      created_time TEXT,
      closed_time TEXT,
      last_sync_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS sync_logs (
      id TEXT PRIMARY KEY,
      source TEXT NOT NULL,
      status TEXT NOT NULL,
      records_synced INTEGER NOT NULL DEFAULT 0,
      error_message TEXT,
      started_at TEXT NOT NULL,
      finished_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS change_requests (
      id TEXT PRIMARY KEY,
      author_id TEXT NOT NULL REFERENCES users(id),
      author_name TEXT NOT NULL,
      module TEXT NOT NULL,
      action TEXT NOT NULL,
      target_id TEXT NOT NULL,
      previous_values_json TEXT,
      new_values_json TEXT NOT NULL,
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      reviewed_by_id TEXT REFERENCES users(id),
      reviewed_by_name TEXT,
      review_notes TEXT,
      reviewed_at TEXT,
      created_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      user_name TEXT NOT NULL,
      module TEXT NOT NULL,
      action TEXT NOT NULL,
      target_id TEXT,
      details_json TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL
    );`,
    `CREATE INDEX IF NOT EXISTS idx_units_client ON units(client_id);`,
    `CREATE INDEX IF NOT EXISTS idx_circuits_unit ON circuits(unit_id);`,
    `CREATE INDEX IF NOT EXISTS idx_cem_questions_block ON cem_questions(block_id);`,
    `CREATE INDEX IF NOT EXISTS idx_znuny_customer ON znuny_tickets_mirror(customer_id);`,
    `CREATE INDEX IF NOT EXISTS idx_change_requests_status ON change_requests(status);`
  ];

  for (const sql of statements) {
    await sqliteClient.execute(sql);
  }

  console.log('Database tables and indexes created successfully via LibSQL / SQLite.');
}

runMigrations().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
