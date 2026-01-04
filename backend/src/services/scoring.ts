import { JobOpportunity } from '../types';

export interface ScoringResult {
  score: number;
  matchReason: string;
  matchedSkills: string[];
  category: 'mern' | 'backend' | 'crypto' | 'rust' | 'mixed' | 'other';
  shouldApply: boolean;
}

// Skill keyword definitions with weights
const SKILL_KEYWORDS = {
  // MERN Stack (high weight)
  mern: {
    keywords: ['mern', 'mongo', 'mongodb', 'express', 'react', 'node.js', 'nodejs', 'node', 'full stack', 'fullstack'],
    weight: 15,
    category: 'mern' as const,
  },
  
  // Backend (medium-high weight)
  backend: {
    keywords: ['backend', 'server', 'api', 'rest', 'graphql', 'microservices', 'express.js', 'fastify', 'koa'],
    weight: 12,
    category: 'backend' as const,
  },
  
  // Node.js specific (high weight)
  nodejs: {
    keywords: ['node.js', 'nodejs', 'node', 'typescript', 'ts', 'javascript', 'js', 'npm', 'yarn'],
    weight: 14,
    category: 'backend' as const,
  },
  
  // Next.js (high weight)
  nextjs: {
    keywords: ['next.js', 'nextjs', 'next', 'app router', 'pages router'],
    weight: 13,
    category: 'mern' as const,
  },
  
  // Crypto/Web3/Blockchain (very high weight)
  crypto: {
    keywords: ['crypto', 'cryptocurrency', 'blockchain', 'web3', 'web 3', 'defi', 'decentralized', 'dapp', 'dapps', 'smart contract', 'smart contracts', 'solidity', 'ethereum', 'bitcoin', 'nft', 'nfts', 'dao', 'daos'],
    weight: 18,
    category: 'crypto' as const,
  },
  
  // Rust (high weight)
  rust: {
    keywords: ['rust', 'rustlang', 'cargo', 'rustacean'],
    weight: 16,
    category: 'rust' as const,
  },
  
  // Solana (very high weight)
  solana: {
    keywords: ['solana', 'sol', 'anchor', 'solana program', 'solana blockchain', 'spl token'],
    weight: 20,
    category: 'crypto' as const,
  },
  
  // Additional relevant skills
  typescript: {
    keywords: ['typescript', 'ts', 'tsx'],
    weight: 10,
    category: 'backend' as const,
  },
  
  react: {
    keywords: ['react', 'reactjs', 'react.js', 'jsx', 'hooks', 'redux', 'context'],
    weight: 12,
    category: 'mern' as const,
  },
  
  database: {
    keywords: ['database', 'sql', 'nosql', 'postgresql', 'postgres', 'mysql', 'redis', 'prisma', 'orm'],
    weight: 8,
    category: 'backend' as const,
  },
};

// Negative keywords that reduce score
const NEGATIVE_KEYWORDS = [
  'java', 'python', 'c#', 'csharp', '.net', 'php', 'ruby', 'go lang', 'golang',
  'angular', 'vue', 'svelte', 'flutter', 'dart', 'swift', 'kotlin', 'ios', 'android',
  'devops', 'sre', 'kubernetes', 'docker only', 'only docker',
];

export class ScoringService {
  /**
   * Rule-based scoring engine - no LLMs required
   */
  evaluateRelevance(opportunity: JobOpportunity): ScoringResult {
    const text = `${opportunity.title} ${opportunity.description}`.toLowerCase();
    const matchedSkills: string[] = [];
    let totalScore = 0;
    const categoryScores: Record<string, number> = {
      mern: 0,
      backend: 0,
      crypto: 0,
      rust: 0,
    };

    // Check for negative keywords first
    const hasNegativeKeyword = NEGATIVE_KEYWORDS.some(keyword => 
      text.includes(keyword.toLowerCase())
    );

    if (hasNegativeKeyword) {
      // Reduce score but don't eliminate completely
      totalScore -= 10;
    }

    // Score each skill category
    for (const [skillName, skillDef] of Object.entries(SKILL_KEYWORDS)) {
      const matches = skillDef.keywords.filter(keyword => 
        text.includes(keyword.toLowerCase())
      );

      if (matches.length > 0) {
        // Calculate score: base weight + bonus for multiple matches
        const baseScore = skillDef.weight;
        const matchBonus = Math.min(matches.length * 2, 10); // Max 10 bonus
        const categoryScore = baseScore + matchBonus;
        
        totalScore += categoryScore;
        categoryScores[skillDef.category] += categoryScore;
        matchedSkills.push(...matches);
      }
    }

    // Bonus for MERN stack completeness (all 4 components)
    const hasMongo = text.includes('mongo') || text.includes('mongodb');
    const hasExpress = text.includes('express');
    const hasReact = text.includes('react');
    const hasNode = text.includes('node');
    
    if (hasMongo && hasExpress && hasReact && hasNode) {
      totalScore += 15; // MERN stack bonus
      categoryScores.mern += 15;
      if (!matchedSkills.includes('mern')) matchedSkills.push('mern');
    }

    // Bonus for Rust + Solana combination
    if (categoryScores.rust > 0 && categoryScores.crypto > 0 && text.includes('solana')) {
      totalScore += 10; // Rust + Solana bonus
    }

    // Determine primary category
    let primaryCategory: ScoringResult['category'] = 'other';
    const maxCategoryScore = Math.max(...Object.values(categoryScores));
    
    if (maxCategoryScore > 0) {
      if (categoryScores.mern >= maxCategoryScore) {
        primaryCategory = 'mern';
      } else if (categoryScores.crypto >= maxCategoryScore) {
        primaryCategory = categoryScores.rust > 0 ? 'rust' : 'crypto';
      } else if (categoryScores.backend >= maxCategoryScore) {
        primaryCategory = 'backend';
      } else if (categoryScores.rust >= maxCategoryScore) {
        primaryCategory = 'rust';
      }
    }

    // Mixed category if multiple strong categories
    const strongCategories = Object.entries(categoryScores)
      .filter(([_, score]) => score > 15)
      .map(([cat]) => cat);
    
    if (strongCategories.length > 1) {
      primaryCategory = 'mixed';
    }

    // Clamp score to 0-100
    totalScore = Math.max(0, Math.min(100, totalScore));

    // Generate match reason
    const matchReason = this.generateMatchReason(
      totalScore,
      matchedSkills,
      primaryCategory,
      categoryScores
    );

    return {
      score: totalScore,
      matchReason,
      matchedSkills: [...new Set(matchedSkills)], // Remove duplicates
      category: primaryCategory,
      shouldApply: totalScore >= 40, // Same threshold as before
    };
  }

  private generateMatchReason(
    score: number,
    matchedSkills: string[],
    category: ScoringResult['category'],
    categoryScores: Record<string, number>
  ): string {
    if (score < 20) {
      return 'Low relevance - few matching skills found';
    }

    const topSkills = matchedSkills.slice(0, 5).join(', ');
    const categoryNames: Record<string, string> = {
      mern: 'MERN stack',
      backend: 'Backend development',
      crypto: 'Crypto/Web3',
      rust: 'Rust/Solana',
      mixed: 'Multiple relevant categories',
      other: 'General development',
    };

    if (score >= 70) {
      return `Excellent match: Strong ${categoryNames[category]} fit with ${topSkills}`;
    } else if (score >= 50) {
      return `Good match: ${categoryNames[category]} role with ${topSkills}`;
    } else {
      return `Moderate match: Some relevant skills (${topSkills})`;
    }
  }
}

export const scoringService = new ScoringService();
