import Database from 'better-sqlite3';

export function createSchema(db: Database.Database) {
  // Opportunities table
  db.exec(`
    CREATE TABLE IF NOT EXISTS opportunities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      source TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      score INTEGER DEFAULT 0,
      tags TEXT,
      posted_at TEXT,
      discovered_at TEXT DEFAULT (datetime('now')),
      hash TEXT NOT NULL UNIQUE,
      source_type TEXT DEFAULT 'automated' CHECK(source_type IN ('automated', 'email', 'manual')),
      matched_skills TEXT,
      category TEXT
    )
  `);

  // Applications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      opportunity_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'viewed' CHECK(status IN ('viewed', 'applied', 'replied', 'rejected', 'archived', 'old', 'not_useful')),
      applied_at TEXT,
      proposal_text TEXT,
      method TEXT DEFAULT 'manual' CHECK(method IN ('manual', 'email', 'auto')),
      FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_opportunities_hash ON opportunities(hash);
    CREATE INDEX IF NOT EXISTS idx_opportunities_discovered_at ON opportunities(discovered_at);
    CREATE INDEX IF NOT EXISTS idx_applications_opportunity_id ON applications(opportunity_id);
    CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
  `);
}
