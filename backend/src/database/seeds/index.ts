import { seedUsers } from './seedUsers.js';
import { seedCem } from './seedCem.js';
import { importBalbo } from './importBalbo.js';

async function runAllSeeds() {
  console.log('=== Starting Jaspion Database Seeds ===');
  await seedUsers();
  await seedCem();
  await importBalbo();
  console.log('=== All Seeds Completed Successfully ===');
  process.exit(0);
}

runAllSeeds().catch(err => {
  console.error('Seed execution error:', err);
  process.exit(1);
});
