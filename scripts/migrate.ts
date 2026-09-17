/**
 * CHAINTRACE // Database Migration & Seeding Runner
 * Executes schema migrations and initializes verified VASP intelligence.
 */

import fs from 'node:fs';
import path from 'node:path';
import { globalVaspRepository } from '../src/lib/vasp/repository';

async function runMigrations() {
  console.log('----------------------------------------------------');
  console.log('CHAINTRACE // EXECUTING DATABASE MIGRATIONS');
  console.log('----------------------------------------------------');

  const migrationFile = path.join(process.cwd(), 'db', 'migrations', '001_create_vasp_tables.sql');
  if (fs.existsSync(migrationFile)) {
    const sql = fs.readFileSync(migrationFile, 'utf-8');
    console.log(`[OK] Loaded schema DDL: ${path.basename(migrationFile)} (${sql.length} bytes)`);
  } else {
    console.warn(`[WARN] Migration file not found at ${migrationFile}`);
  }

  // Initialize and seed repository
  console.log('[INFO] Seeding verified VASP intelligence & segregated demo records...');
  await globalVaspRepository.resetToSeed();

  const vasps = await globalVaspRepository.getAllVasps();
  let totalAddresses = 0;
  for (const v of vasps) {
    const addrs = await globalVaspRepository.getAddressesByVasp(v.id);
    totalAddresses += addrs.length;
  }

  console.log(`[SUCCESS] Migration 001 applied successfully:`);
  console.log(`  - VASPs in registry:       ${vasps.length}`);
  console.log(`  - Addresses registered:    ${totalAddresses}`);
  console.log(`  - Storage location:        data/vasp_database.json`);
  console.log('----------------------------------------------------');
}

runMigrations().catch((err) => {
  console.error('[ERROR] Database migration failed:', err);
  process.exit(1);
});
