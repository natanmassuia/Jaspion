import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Usuários e Sessões
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('USUARIO'), // ADMIN, COORDENADOR, USUARIO
  department: text('department').notNull(),
  mustChangePassword: integer('must_change_password', { mode: 'boolean' }).notNull().default(false),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  failedAttempts: integer('failed_attempts').notNull().default(0),
  lockedUntil: integer('locked_until'), // timestamp ms
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at').notNull(), // timestamp ms
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: text('created_at').notNull()
});

// Clientes e Unidades
export const clients = sqliteTable('clients', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  isVip: integer('is_vip', { mode: 'boolean' }).notNull().default(false),
  economicGroup: text('economic_group'),
  managerName: text('manager_name'),
  gnName: text('gn_name'),
  sankhyaCode: text('sankhya_code'),
  description: text('description'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

export const units = sqliteTable('units', {
  id: text('id').primaryKey(),
  clientId: text('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  intraCode: text('intra_code'),
  sankhyaCode: text('sankhya_code'),
  city: text('city'),
  state: text('state'),
  address: text('address'),
  businessHours: text('business_hours'),
  phone: text('phone'),
  environment: text('environment').default('Produção'),
  dependencies: text('dependencies'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

// Circuitos
export const circuits = sqliteTable('circuits', {
  id: text('id').primaryKey(),
  unitId: text('unit_id').notNull().references(() => units.id, { onDelete: 'cascade' }),
  operator: text('operator').notNull(),
  technology: text('technology'),
  speedMbps: integer('speed_mbps'),
  circuitId: text('circuit_id'),
  contractId: text('contract_id'),
  lpIp: text('lp_ip'),
  lpVpn: text('lp_vpn'),
  isPrimary: integer('is_primary', { mode: 'boolean' }).notNull().default(false),
  notes: text('notes'),
  createdAt: text('created_at').notNull()
});

// Contatos
export const contacts = sqliteTable('contacts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  roleDescription: text('role_description'),
  phone: text('phone'),
  mobile: text('mobile'),
  whatsapp: text('whatsapp'),
  email: text('email'),
  schedule: text('schedule'),
  createdAt: text('created_at').notNull()
});

export const unitContacts = sqliteTable('unit_contacts', {
  unitId: text('unit_id').notNull().references(() => units.id, { onDelete: 'cascade' }),
  contactId: text('contact_id').notNull().references(() => contacts.id, { onDelete: 'cascade' }),
  priorityOrder: integer('priority_order').notNull().default(1)
});

// Procedimentos
export const procedures = sqliteTable('procedures', {
  id: text('id').primaryKey(),
  unitId: text('unit_id').references(() => units.id, { onDelete: 'cascade' }),
  clientId: text('client_id').references(() => clients.id, { onDelete: 'cascade' }),
  category: text('category').notNull(), // telecom, infra, escalonamento
  content: text('content').notNull(),
  version: integer('version').notNull().default(1),
  updatedAt: text('updated_at').notNull()
});

// Checklist CEM
export const cemBlocks = sqliteTable('cem_blocks', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  orderIndex: integer('order_index').notNull(),
  color: text('color'),
  description: text('description'),
  createdAt: text('created_at').notNull()
});

export const cemQuestions = sqliteTable('cem_questions', {
  id: text('id').primaryKey(),
  blockId: text('block_id').notNull().references(() => cemBlocks.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  orderIndex: integer('order_index').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull()
});

export const cemEvaluations = sqliteTable('cem_evaluations', {
  id: text('id').primaryKey(),
  ticketProtocol: text('ticket_protocol').notNull(),
  evaluatorId: text('evaluator_id').notNull().references(() => users.id),
  evaluatorName: text('evaluator_name').notNull(),
  evaluationDate: text('evaluation_date').notNull(),
  shift: text('shift').notNull().default('Comercial'),
  scorePercentage: integer('score_percentage').notNull(),
  goodCount: integer('good_count').notNull(),
  badCount: integer('bad_count').notNull(),
  fourthCount: integer('fourth_count').notNull(),
  naCount: integer('na_count').notNull(),
  notes: text('notes'),
  createdAt: text('created_at').notNull()
});

export const cemAnswers = sqliteTable('cem_answers', {
  id: text('id').primaryKey(),
  evaluationId: text('evaluation_id').notNull().references(() => cemEvaluations.id, { onDelete: 'cascade' }),
  questionId: text('question_id').notNull().references(() => cemQuestions.id),
  answer: text('answer').notNull(),
  observation: text('observation')
});

// Znuny Mirror
export const znunyTicketsMirror = sqliteTable('znuny_tickets_mirror', {
  id: text('id').primaryKey(), // ticket id
  tn: text('tn').notNull(), // protocolo
  title: text('title').notNull(),
  customerId: text('customer_id'),
  customerUserLogin: text('customer_user_login'),
  queue: text('queue'),
  state: text('state'),
  priority: text('priority'),
  owner: text('owner'),
  service: text('service'),
  circuitRef: text('circuit_ref'),
  createdTime: text('created_time'),
  closedTime: text('closed_time'),
  lastSyncAt: text('last_sync_at').notNull()
});

export const syncLogs = sqliteTable('sync_logs', {
  id: text('id').primaryKey(),
  source: text('source').notNull(),
  status: text('status').notNull(), // SUCCESS, FAILED
  recordsSynced: integer('records_synced').notNull().default(0),
  errorMessage: text('error_message'),
  startedAt: text('started_at').notNull(),
  finishedAt: text('finished_at').notNull()
});

// Alterações Cadastrais e Auditoria
export const changeRequests = sqliteTable('change_requests', {
  id: text('id').primaryKey(),
  authorId: text('author_id').notNull().references(() => users.id),
  authorName: text('author_name').notNull(),
  module: text('module').notNull(),
  action: text('action').notNull(), // CREATE, UPDATE, DELETE
  targetId: text('target_id').notNull(),
  previousValuesJson: text('previous_values_json'),
  newValuesJson: text('new_values_json').notNull(),
  reason: text('reason').notNull(),
  status: text('status').notNull().default('PENDING'), // PENDING, APPROVED, REJECTED
  reviewedById: text('reviewed_by_id').references(() => users.id),
  reviewedByName: text('reviewed_by_name'),
  reviewNotes: text('review_notes'),
  reviewedAt: text('reviewed_at'),
  createdAt: text('created_at').notNull()
});

export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  userName: text('user_name').notNull(),
  module: text('module').notNull(),
  action: text('action').notNull(),
  targetId: text('target_id'),
  detailsJson: text('details_json'),
  ipAddress: text('ip_address'),
  createdAt: text('created_at').notNull()
});
