import OpenAI from 'openai';
import axios from 'axios';
import { JobOpportunity } from '../types';

interface RelevanceResult {
  score: number;
  matchReason: string;
  shouldApply: boolean;
}

interface ProposalResult {
  proposal: string;
}

const PROFILE = `Backend-focused full-stack developer with expertise in:
- Node.js and TypeScript
- Next.js (App Router)
- Web3 and blockchain development
- Rust programming
- Solana blockchain ecosystem`;

export class LLMClient {
  private openai: OpenAI | null = null;
  private useOllama: boolean = false;
  private ollamaBaseUrl: string = '';
  private ollamaModel: string = '';

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    const ollamaUrl = process.env.OLLAMA_BASE_URL;
    const ollamaModel = process.env.OLLAMA_MODEL;

    if (ollamaUrl && ollamaModel) {
      this.useOllama = true;
      this.ollamaBaseUrl = ollamaUrl;
      this.ollamaModel = ollamaModel;
      console.log(`Using Ollama: ${ollamaUrl} with model ${ollamaModel}`);
    } else if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      console.log('Using OpenAI API');
    } else {
      console.warn('No LLM configured. Set OPENAI_API_KEY or OLLAMA_BASE_URL');
    }
  }

  async evaluateRelevance(opportunity: JobOpportunity): Promise<RelevanceResult> {
    const prompt = `Evaluate this job opportunity for relevance:

Title: ${opportunity.title}
Description: ${opportunity.description.substring(0, 2000)}
Source: ${opportunity.source}

Target Profile:
${PROFILE}

Respond with a JSON object containing:
- score: integer 0-100 (relevance score)
- matchReason: one sentence explaining why it matches or doesn't match
- shouldApply: boolean (true if score >= 60)

Only respond with valid JSON, no other text.`;

    try {
      const response = await this.callLLM(prompt);
      const result = JSON.parse(response.trim());
      return {
        score: Math.max(0, Math.min(100, result.score || 0)),
        matchReason: result.matchReason || 'No reason provided',
        shouldApply: result.shouldApply || false,
      };
    } catch (error) {
      console.error('Error evaluating relevance:', error);
      return {
        score: 0,
        matchReason: 'Error evaluating opportunity',
        shouldApply: false,
      };
    }
  }

  async generateProposal(opportunity: JobOpportunity): Promise<string> {
    const prompt = `Generate a short, professional, non-spammy proposal for this job opportunity:

Title: ${opportunity.title}
Description: ${opportunity.description.substring(0, 1500)}

Requirements:
- Keep it under 150 words
- Be specific about relevant skills (Node.js, Next.js, Web3, Rust, Solana)
- Show genuine interest
- Professional but personable tone
- No generic templates

Generate only the proposal text, no greetings or signatures.`;

    try {
      const proposal = await this.callLLM(prompt);
      return proposal.trim();
    } catch (error) {
      console.error('Error generating proposal:', error);
      return `I'm interested in this ${opportunity.title} position. I have experience with Node.js, Next.js, Web3, Rust, and Solana development.`;
    }
  }

  private async callLLM(prompt: string): Promise<string> {
    if (this.useOllama) {
      return this.callOllama(prompt);
    } else if (this.openai) {
      return this.callOpenAI(prompt);
    } else {
      throw new Error('No LLM configured');
    }
  }

  private async callOpenAI(prompt: string): Promise<string> {
    if (!this.openai) throw new Error('OpenAI not initialized');
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || '';
  }

  private async callOllama(prompt: string): Promise<string> {
    const response = await axios.post(
      `${this.ollamaBaseUrl}/api/generate`,
      {
        model: this.ollamaModel,
        prompt,
        stream: false,
      },
      { timeout: 60000 }
    );

    return response.data.response || '';
  }
}

export const llmClient = new LLMClient();
