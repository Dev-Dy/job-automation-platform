export interface JobOpportunity {
  title: string;
  description: string;
  source: string;
  url: string;
  postedAt?: string;
  tags?: string[];
}

export interface ScoredOpportunity extends JobOpportunity {
  score: number;
  matchReason: string;
  hash: string;
  matchedSkills?: string[];
  category?: 'mern' | 'backend' | 'crypto' | 'rust' | 'mixed' | 'other';
  sourceType?: 'automated' | 'email' | 'manual';
}

export interface Application {
  id?: number;
  opportunityId: number;
  status: 'viewed' | 'applied' | 'replied' | 'rejected' | 'archived' | 'old' | 'not_useful';
  appliedAt?: string;
  proposalText?: string;
  method: 'manual' | 'email' | 'auto';
}

export interface OpportunityRow {
  id: number;
  title: string;
  description: string;
  source: string;
  url: string;
  score: number;
  tags: string | null;
  posted_at: string | null;
  discovered_at: string;
  hash: string;
  source_type: string | null;
  matched_skills: string | null;
  category: string | null;
}

export interface ApplicationRow {
  id: number;
  opportunity_id: number;
  status: string;
  applied_at: string | null;
  proposal_text: string | null;
  method: string;
}
