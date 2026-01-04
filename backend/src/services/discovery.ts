import { sources } from '../sources';
import { scoringService } from './scoring';
import { db } from '../db';
import { generateHash } from '../utils/hash';
import { ScoredOpportunity, JobOpportunity } from '../types';
import { telegramService } from './telegram';

export class DiscoveryService {
  async discoverAndScore(): Promise<ScoredOpportunity[]> {
    const allOpportunities: JobOpportunity[] = [];

    // Discover from all sources
    for (const source of sources) {
      try {
        const opportunities = await source.discover();
        allOpportunities.push(...opportunities);
        // Be polite between sources
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error discovering from ${source.name}:`, error);
      }
    }

    console.log(`Total opportunities discovered: ${allOpportunities.length}`);

    // Deduplicate and score
    const scoredOpportunities: ScoredOpportunity[] = [];

    for (const opportunity of allOpportunities) {
      const hash = generateHash(opportunity.url, opportunity.title);

      // Check if already exists
      const existing = db.prepare('SELECT id FROM opportunities WHERE hash = ?').get(hash) as { id: number } | undefined;
      if (existing) {
        continue;
      }

      // Score with rule-based engine (no LLM)
      const evaluation = scoringService.evaluateRelevance(opportunity);
      
      if (evaluation.score >= 40) { // Only store opportunities with score >= 40
        scoredOpportunities.push({
          ...opportunity,
          score: evaluation.score,
          matchReason: evaluation.matchReason,
          hash,
          matchedSkills: evaluation.matchedSkills,
          category: evaluation.category,
        });
      }
    }

    // Save to database
    const insertStmt = db.prepare(`
      INSERT INTO opportunities (title, description, source, url, score, tags, posted_at, hash, source_type, matched_skills, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const opp of scoredOpportunities) {
      try {
        insertStmt.run(
          opp.title,
          opp.description,
          opp.source,
          opp.url,
          opp.score,
          opp.tags ? JSON.stringify(opp.tags) : null,
          opp.postedAt || null,
          opp.hash,
          'automated', // source_type
          opp.matchedSkills ? JSON.stringify(opp.matchedSkills) : null,
          opp.category || null
        );

        // Notify via Telegram for high-scoring opportunities
        if (opp.score >= 70) {
          await telegramService.sendNotification(
            `🎯 High-scoring opportunity (${opp.score}/100)\n\n` +
            `Title: ${opp.title}\n` +
            `Source: ${opp.source}\n` +
            `Reason: ${opp.matchReason}\n` +
            `URL: ${opp.url}`
          );
        }
      } catch (error) {
        console.error('Error saving opportunity:', error);
      }
    }

    console.log(`Saved ${scoredOpportunities.length} new opportunities`);
    return scoredOpportunities;
  }
}

export const discoveryService = new DiscoveryService();
