import axios from 'axios';
import * as cheerio from 'cheerio';
import { JobSource } from './base';
import { JobOpportunity } from '../types';

export class Web3CareersSource extends JobSource {
  name = 'web3.careers';

  async discover(): Promise<JobOpportunity[]> {
    const opportunities: JobOpportunity[] = [];
    
    try {
      // Web3.careers public job listings
      const url = 'https://web3.careers';
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      
      // Look for job listings (adjust selectors based on actual site structure)
      $('article, .job-listing, [data-job-id]').each((_, element) => {
        const $el = $(element);
        const title = $el.find('h2, h3, .title, a').first().text().trim();
        const link = $el.find('a').first();
        const href = link.attr('href') || '';
        const fullUrl = href.startsWith('http') ? href : `https://web3.careers${href}`;
        const description = $el.find('.description, p, .summary').text().trim() || title;
        
        if (title && fullUrl) {
          opportunities.push({
            title,
            description: description.substring(0, 2000),
            source: this.name,
            url: fullUrl,
            tags: ['web3', 'blockchain'],
          });
        }
      });

      // If no jobs found with common selectors, try alternative approach
      if (opportunities.length === 0) {
        // Fallback: try to find any links that might be job postings
        $('a[href*="/jobs"], a[href*="/job"]').each((_, element) => {
          const $el = $(element);
          const title = $el.text().trim();
          const href = $el.attr('href');
          if (title && href && title.length > 10) {
            const fullUrl = href.startsWith('http') ? href : `https://web3.careers${href}`;
            opportunities.push({
              title,
              description: title,
              source: this.name,
              url: fullUrl,
              tags: ['web3'],
            });
          }
        });
      }

      console.log(`[${this.name}] Discovered ${opportunities.length} opportunities`);
    } catch (error) {
      console.error(`[${this.name}] Error discovering jobs:`, error);
    }

    return opportunities;
  }
}
