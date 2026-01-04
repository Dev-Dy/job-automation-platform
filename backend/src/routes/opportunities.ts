import { Router } from 'express';
import { db } from '../db';
import { proposalService } from '../services/proposal';
import { scoringService } from '../services/scoring';
import { OpportunityRow, ApplicationRow } from '../types';

const router = Router();

// Get all opportunities with optional filters
router.get('/', (req, res) => {
  try {
    const { status, minScore, source, limit = '100', excludeArchived = 'true' } = req.query;

    let query = `
      SELECT o.*, 
             a.status as application_status,
             a.applied_at,
             a.proposal_text,
             a.method
      FROM opportunities o
      LEFT JOIN applications a ON o.id = a.opportunity_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (minScore) {
      query += ' AND o.score >= ?';
      params.push(parseInt(minScore as string));
    }

    if (source) {
      query += ' AND o.source = ?';
      params.push(source);
    }

    // Filter by application status if provided
    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    // Exclude archived/old/not_useful by default
    if (excludeArchived === 'true') {
      query += ' AND (a.status IS NULL OR a.status NOT IN (\'archived\', \'old\', \'not_useful\'))';
    }

    query += ' ORDER BY o.discovered_at DESC LIMIT ?';
    params.push(parseInt(limit as string));

    const opportunities = db.prepare(query).all(...params) as any[];

    // Group by opportunity (handle multiple applications)
    const grouped = new Map();
    for (const row of opportunities) {
      const id = row.id;
      if (!grouped.has(id)) {
        grouped.set(id, {
          id: row.id,
          title: row.title,
          description: row.description,
          source: row.source,
          url: row.url,
          score: row.score,
          tags: row.tags ? JSON.parse(row.tags) : [],
          postedAt: row.posted_at,
          discoveredAt: row.discovered_at,
          hash: row.hash,
          status: row.application_status || null,
          appliedAt: row.applied_at,
          proposalText: row.proposal_text,
          method: row.method,
          sourceType: row.source_type || 'automated',
          matchedSkills: row.matched_skills ? JSON.parse(row.matched_skills) : [],
          category: row.category || null,
        });
      }
    }

    res.json(Array.from(grouped.values()));
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
});

// Get single opportunity
router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const opp = db.prepare('SELECT * FROM opportunities WHERE id = ?').get(id) as OpportunityRow | undefined;

    if (!opp) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    const app = db.prepare('SELECT * FROM applications WHERE opportunity_id = ? ORDER BY id DESC LIMIT 1')
      .get(id) as ApplicationRow | undefined;

    res.json({
      ...opp,
      tags: opp.tags ? JSON.parse(opp.tags) : [],
      sourceType: opp.source_type || 'automated',
      matchedSkills: opp.matched_skills ? JSON.parse(opp.matched_skills) : [],
      category: opp.category || null,
      application: app ? {
        status: app.status,
        appliedAt: app.applied_at,
        proposalText: app.proposal_text,
        method: app.method,
      } : null,
    });
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    res.status(500).json({ error: 'Failed to fetch opportunity' });
  }
});

// Mark opportunity with status (viewed/applied/replied/archived/old/not_useful)
router.post('/:id/apply', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status = 'applied', method = 'manual' } = req.body;

    // Validate status
    const validStatuses = ['viewed', 'applied', 'replied', 'rejected', 'archived', 'old', 'not_useful'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    // Check if opportunity exists
    const opp = db.prepare('SELECT * FROM opportunities WHERE id = ?').get(id) as OpportunityRow | undefined;
    if (!opp) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    // Check if already marked as archived/old/not_useful - prevent applying
    const existing = db.prepare('SELECT id, status FROM applications WHERE opportunity_id = ?')
      .get(id) as { id: number; status: string } | undefined;

    if (existing) {
      const nonApplicableStatuses = ['archived', 'old', 'not_useful'];
      if (nonApplicableStatuses.includes(existing.status) && status === 'applied') {
        return res.status(400).json({ 
          error: `Cannot apply to job marked as "${existing.status}". Please change status first.` 
        });
      }
    }

    // Generate proposal if not provided (template-based, no LLM)
    let proposalText = req.body.proposalText;
    if (!proposalText && status === 'applied') {
      const matchedSkills = opp.matched_skills ? JSON.parse(opp.matched_skills) : undefined;
      proposalText = proposalService.generateProposal({
        title: opp.title,
        description: opp.description,
        source: opp.source,
        url: opp.url,
      }, matchedSkills);
    }

    // Don't set applied_at for non-application statuses
    const appliedAt = (status === 'applied' || status === 'replied') ? new Date().toISOString() : null;

    // Insert or update application
    if (existing) {
      db.prepare(`
        UPDATE applications 
        SET status = ?, applied_at = ?, proposal_text = ?, method = ?
        WHERE id = ?
      `).run(status, appliedAt, proposalText, method, existing.id);
    } else {
      db.prepare(`
        INSERT INTO applications (opportunity_id, status, applied_at, proposal_text, method)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, status, appliedAt, proposalText, method);
    }

    res.json({ success: true, proposalText, status });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// Get analytics
router.get('/analytics/overview', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const newToday = db.prepare(`
      SELECT COUNT(*) as count 
      FROM opportunities 
      WHERE DATE(discovered_at) = DATE(?)
    `).get(today) as { count: number };

    const totalApplied = db.prepare(`
      SELECT COUNT(DISTINCT opportunity_id) as count 
      FROM applications 
      WHERE status IN ('applied', 'replied')
    `).get() as { count: number };

    const totalReplied = db.prepare(`
      SELECT COUNT(*) as count 
      FROM applications 
      WHERE status = 'replied'
    `).get() as { count: number };

    const totalAppliedCount = totalApplied.count;
    const responseRate = totalAppliedCount > 0 
      ? ((totalReplied.count / totalAppliedCount) * 100).toFixed(1)
      : '0';

    res.json({
      newToday: newToday.count,
      totalApplied: totalAppliedCount,
      totalReplied: totalReplied.count,
      responseRate: parseFloat(responseRate),
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get funnel data
router.get('/analytics/funnel', (req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM opportunities').get() as { count: number };
    const viewed = db.prepare(`
      SELECT COUNT(DISTINCT opportunity_id) as count 
      FROM applications 
      WHERE status = 'viewed'
    `).get() as { count: number };
    const applied = db.prepare(`
      SELECT COUNT(DISTINCT opportunity_id) as count 
      FROM applications 
      WHERE status IN ('applied', 'replied', 'rejected')
    `).get() as { count: number };
    const replied = db.prepare(`
      SELECT COUNT(*) as count 
      FROM applications 
      WHERE status = 'replied'
    `).get() as { count: number };

    res.json({
      discovered: total.count,
      viewed: viewed.count,
      applied: applied.count,
      replied: replied.count,
    });
  } catch (error) {
    console.error('Error fetching funnel:', error);
    res.status(500).json({ error: 'Failed to fetch funnel data' });
  }
});

// Get source performance
router.get('/analytics/sources', (req, res) => {
  try {
    const sources = db.prepare(`
      SELECT 
        source,
        COALESCE(source_type, 'automated') as source_type,
        COUNT(*) as total,
        AVG(score) as avgScore,
        COUNT(CASE WHEN o.id IN (SELECT opportunity_id FROM applications WHERE status IN ('applied', 'replied')) THEN 1 END) as applied
      FROM opportunities o
      GROUP BY source, COALESCE(source_type, 'automated')
      ORDER BY total DESC
    `).all() as any[];

    res.json(sources.map(s => ({
      source: s.source,
      sourceType: s.source_type || 'automated',
      total: s.total,
      avgScore: Math.round(s.avgScore || 0),
      applied: s.applied,
    })));
  } catch (error) {
    console.error('Error fetching source analytics:', error);
    res.status(500).json({ error: 'Failed to fetch source analytics' });
  }
});

// Get skill category analytics
router.get('/analytics/categories', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT 
        COALESCE(category, 'other') as category,
        COUNT(*) as total,
        AVG(score) as avgScore,
        COUNT(CASE WHEN o.id IN (SELECT opportunity_id FROM applications WHERE status IN ('applied', 'replied')) THEN 1 END) as applied
      FROM opportunities o
      GROUP BY category
      ORDER BY total DESC
    `).all() as any[];

    res.json(categories.map(c => ({
      category: c.category || 'other',
      total: c.total,
      avgScore: Math.round(c.avgScore || 0),
      applied: c.applied,
    })));
  } catch (error) {
    console.error('Error fetching category analytics:', error);
    res.status(500).json({ error: 'Failed to fetch category analytics' });
  }
});

// Manual job import (for freelance platforms, email alerts, etc.)
router.post('/import', async (req, res) => {
  try {
    const { title, description, url, source, sourceType = 'manual', tags } = req.body;

    if (!title || !description || !url) {
      return res.status(400).json({ error: 'Title, description, and URL are required' });
    }

    // Generate hash for deduplication
    const { generateHash } = require('../utils/hash');
    const hash = generateHash(url, title);

    // Check if already exists
    const existing = db.prepare('SELECT id FROM opportunities WHERE hash = ?').get(hash) as { id: number } | undefined;
    if (existing) {
      return res.status(409).json({ error: 'Opportunity already exists', id: existing.id });
    }

    // Score the opportunity
    const evaluation = scoringService.evaluateRelevance({
      title,
      description,
      source: source || 'manual',
      url,
      tags,
    });

    // Insert into database
    const result = db.prepare(`
      INSERT INTO opportunities (title, description, source, url, score, tags, hash, source_type, matched_skills, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title,
      description,
      source || 'manual',
      url,
      evaluation.score,
      tags ? JSON.stringify(tags) : null,
      hash,
      sourceType,
      JSON.stringify(evaluation.matchedSkills),
      evaluation.category
    );

    res.json({
      success: true,
      id: result.lastInsertRowid,
      score: evaluation.score,
      matchReason: evaluation.matchReason,
      matchedSkills: evaluation.matchedSkills,
      category: evaluation.category,
    });
  } catch (error) {
    console.error('Error importing opportunity:', error);
    res.status(500).json({ error: 'Failed to import opportunity' });
  }
});

// Email alert ingestion (webhook endpoint for email parsing services)
router.post('/import/email', async (req, res) => {
  try {
    const { subject, body, from, url } = req.body;

    if (!subject || !body) {
      return res.status(400).json({ error: 'Subject and body are required' });
    }

    // Extract source from email
    let source = 'email';
    if (from) {
      if (from.includes('upwork')) source = 'Upwork (email)';
      else if (from.includes('freelancer')) source = 'Freelancer (email)';
      else if (from.includes('indeed')) source = 'Indeed (email)';
      else if (from.includes('naukri')) source = 'Naukri (email)';
      else source = `Email: ${from}`;
    }

    // Use subject as title, body as description
    const title = subject;
    const description = body.substring(0, 5000); // Limit description length

    // Generate hash
    const { generateHash } = require('../utils/hash');
    const hash = generateHash(url || title, title);

    // Check if already exists
    const existing = db.prepare('SELECT id FROM opportunities WHERE hash = ?').get(hash) as { id: number } | undefined;
    if (existing) {
      return res.status(409).json({ error: 'Opportunity already exists', id: existing.id });
    }

    // Score the opportunity
    const evaluation = scoringService.evaluateRelevance({
      title,
      description,
      source,
      url: url || `email://${hash}`,
    });

    // Insert into database
    const result = db.prepare(`
      INSERT INTO opportunities (title, description, source, url, score, hash, source_type, matched_skills, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title,
      description,
      source,
      url || `email://${hash}`,
      evaluation.score,
      hash,
      'email',
      JSON.stringify(evaluation.matchedSkills),
      evaluation.category
    );

    res.json({
      success: true,
      id: result.lastInsertRowid,
      score: evaluation.score,
      matchReason: evaluation.matchReason,
    });
  } catch (error) {
    console.error('Error importing from email:', error);
    res.status(500).json({ error: 'Failed to import from email' });
  }
});

export default router;
