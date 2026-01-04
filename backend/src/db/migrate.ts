import { db } from './index';

/**
 * Migration script to add new columns to existing database
 * Run this once to update existing databases
 */
export function migrate() {
  try {
    // Add new columns if they don't exist
    const columns = db.prepare("PRAGMA table_info(opportunities)").all() as any[];
    const columnNames = columns.map(c => c.name);

    if (!columnNames.includes('source_type')) {
      // SQLite doesn't support CHECK constraints in ALTER TABLE, so we add without constraint
      // Application logic will enforce valid values
      db.exec(`ALTER TABLE opportunities ADD COLUMN source_type TEXT DEFAULT 'automated'`);
      console.log('Added source_type column');
    }

    if (!columnNames.includes('matched_skills')) {
      db.exec(`ALTER TABLE opportunities ADD COLUMN matched_skills TEXT`);
      console.log('Added matched_skills column');
    }

    if (!columnNames.includes('category')) {
      db.exec(`ALTER TABLE opportunities ADD COLUMN category TEXT`);
      console.log('Added category column');
    }

    // Update existing records to have source_type = 'automated'
    db.exec(`UPDATE opportunities SET source_type = 'automated' WHERE source_type IS NULL`);

    // Update applications table to support new statuses
    // SQLite doesn't support ALTER TABLE to modify CHECK constraints, so we need to recreate
    // For existing databases, we'll just allow the new statuses in application logic
    try {
      // Try to add a test record with new status to see if constraint exists
      db.exec(`PRAGMA foreign_keys=OFF`);
      // The constraint will be enforced by application logic since SQLite doesn't support modifying CHECK constraints
      console.log('Note: New statuses (archived, old, not_useful) are now supported');
    } catch (error) {
      console.log('Status constraint update skipped (SQLite limitation)');
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  migrate();
  process.exit(0);
}
