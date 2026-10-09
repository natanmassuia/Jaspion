import { sqliteClient } from '../connection.js';
import { hash } from '@node-rs/argon2';

export async function seedUsers() {
  console.log('Seeding initial users...');
  
  const existing = await sqliteClient.execute({
    sql: 'SELECT id FROM users WHERE email = ?',
    args: ['admin@microset.local']
  });

  if (existing.rows.length === 0) {
    const passwordHash = await hash('Admin@123');
    const now = new Date().toISOString();
    
    await sqliteClient.execute({
      sql: `INSERT INTO users (id, name, email, password_hash, role, department, must_change_password, active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'usr_admin_poc',
        'Administrador CCO',
        'admin@microset.local',
        passwordHash,
        'ADMIN',
        'Administração CCO',
        0, // Admin inicial ativo
        1,
        now,
        now
      ]
    });
    console.log('  Admin user created: admin@microset.local (Senha: Admin@123)');
  } else {
    console.log('  Admin user already exists.');
  }
}
