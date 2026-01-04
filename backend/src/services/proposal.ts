import { JobOpportunity } from '../types';

export class ProposalService {
  /**
   * Generate proposal using templates - no LLM required
   */
  generateProposal(opportunity: JobOpportunity, matchedSkills?: string[]): string {
    const title = opportunity.title.toLowerCase();
    const description = opportunity.description.toLowerCase();
    
    // Detect job type
    const isMERN = this.hasSkills(['mern', 'mongo', 'express', 'react', 'node'], title + ' ' + description);
    const isCrypto = this.hasSkills(['crypto', 'blockchain', 'web3', 'defi', 'solana'], title + ' ' + description);
    const isRust = this.hasSkills(['rust', 'solana'], title + ' ' + description);
    const isBackend = this.hasSkills(['backend', 'api', 'server'], title + ' ' + description);

    // Build skill highlights
    const skillHighlights: string[] = [];
    
    if (isMERN || matchedSkills?.some(s => ['mern', 'mongo', 'express', 'react', 'node'].includes(s.toLowerCase()))) {
      skillHighlights.push('MERN stack (MongoDB, Express, React, Node.js)');
    }
    if (isCrypto || matchedSkills?.some(s => ['crypto', 'blockchain', 'web3'].includes(s.toLowerCase()))) {
      skillHighlights.push('Web3 and blockchain development');
    }
    if (isRust || matchedSkills?.some(s => ['rust', 'solana'].includes(s.toLowerCase()))) {
      skillHighlights.push('Rust and Solana ecosystem');
    }
    if (isBackend || matchedSkills?.some(s => ['backend', 'node', 'typescript'].includes(s.toLowerCase()))) {
      skillHighlights.push('Backend development with Node.js and TypeScript');
    }
    
    // Default skills if none detected
    if (skillHighlights.length === 0) {
      skillHighlights.push('Full-stack development with Node.js, Next.js, and modern web technologies');
    }

    // Generate proposal
    const skillsText = skillHighlights.join(', ');
    
    return `I'm interested in the ${opportunity.title} position. I have extensive experience with ${skillsText}. 

I'm particularly drawn to this opportunity because it aligns with my expertise in building scalable, modern applications. I'm comfortable working with the technologies mentioned and would be excited to contribute to your team.

I'd love to discuss how my background in ${skillHighlights[0].toLowerCase()} can help achieve your project goals.`;
  }

  private hasSkills(keywords: string[], text: string): boolean {
    return keywords.some(keyword => text.includes(keyword.toLowerCase()));
  }
}

export const proposalService = new ProposalService();
