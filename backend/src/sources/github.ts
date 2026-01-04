import axios from 'axios';
import { JobSource } from './base';
import { JobOpportunity } from '../types';

export class GitHubSource extends JobSource {
  name = 'github';

  async discover(): Promise<JobOpportunity[]> {
    const opportunities: JobOpportunity[] = [];
    
    try {
      // Search GitHub issues with "hiring" or "job" labels
      const queries = [
        'label:hiring language:javascript',
        'label:hiring language:rust',
        'label:job language:typescript',
        'is:issue is:open "looking for" OR "hiring" node.js',
        'is:issue is:open "looking for" OR "hiring" solana',
      ];

      for (const query of queries) {
        try {
          const response = await axios.get('https://api.github.com/search/issues', {
            params: {
              q: query,
              sort: 'updated',
              per_page: 10,
            },
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'JobAutomationBot',
            },
            timeout: 10000,
          });

          for (const item of response.data.items || []) {
            const title = item.title;
            const body = item.body || '';
            const url = item.html_url;
            const repo = item.repository_url.split('/').slice(-2).join('/');

            // Filter for relevant keywords
            const relevantKeywords = ['node.js', 'next.js', 'web3', 'rust', 'solana', 'blockchain', 'full-stack', 'backend'];
            const hasRelevantKeyword = relevantKeywords.some(keyword => 
              (title + ' ' + body).toLowerCase().includes(keyword.toLowerCase())
            );

            if (hasRelevantKeyword && title && url) {
              opportunities.push({
                title: `${title} (${repo})`,
                description: body.substring(0, 2000) || title,
                source: this.name,
                url,
                postedAt: item.created_at,
                tags: ['github', 'open-source'],
              });
            }
          }

          // Be polite with rate limits
          await this.delay(1000);
        } catch (error: any) {
          if (error.response?.status === 403) {
            console.warn(`[${this.name}] Rate limited, skipping query: ${query}`);
            break;
          }
          console.error(`[${this.name}] Error querying: ${query}`, error.message);
        }
      }

      console.log(`[${this.name}] Discovered ${opportunities.length} opportunities`);
    } catch (error) {
      console.error(`[${this.name}] Error discovering jobs:`, error);
    }

    return opportunities;
  }
}
