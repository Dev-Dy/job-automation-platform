import Database from 'better-sqlite3';
import path from 'path';
import { createSchema } from './schema';

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/jobs.db');

// Ensure data directory exists
import { mkdirSync } from 'fs';
const dataDir = path.dirname(dbPath);
try {
  mkdirSync(dataDir, { recursive: true });
} catch (e) {
  // Directory might already exist
}

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Initialize schema
createSchema(db);

export default db;
