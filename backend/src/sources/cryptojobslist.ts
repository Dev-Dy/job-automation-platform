import axios from 'axios';
import * as cheerio from 'cheerio';
import { JobSource } from './base';
import { JobOpportunity } from '../types';

export class CryptoJobsListSource extends JobSource {
  name = 'cryptojobslist';

  async discover(): Promise<JobOpportunity[]> {
    const opportunities: JobOpportunity[] = [];
    
    try {
      // CryptoJobsList public job board
      const url = 'https://cryptojobslist.com';
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      
      // Look for job listings
      $('article, .job-card, .job-listing, [data-job-id]').each((_, element) => {
        const $el = $(element);
        const title = $el.find('h2, h3, .title, a').first().text().trim();
        const link = $el.find('a').first();
        const href = link.attr('href') || '';
        const fullUrl = href.startsWith('http') ? href : `https://cryptojobslist.com${href}`;
        const description = $el.find('.description, p, .summary, .job-description').text().trim() || title;
        
        if (title && fullUrl && title.length > 5) {
          opportunities.push({
            title,
            description: description.substring(0, 2000),
            source: this.name,
            url: fullUrl,
            tags: ['crypto', 'blockchain', 'web3'],
          });
        }
      });

      // Fallback: try alternative selectors
      if (opportunities.length === 0) {
        $('a[href*="/jobs"], a[href*="/job"], a[href*="/position"]').each((_, element) => {
          const $el = $(element);
          const title = $el.text().trim();
          const href = $el.attr('href');
          if (title && href && title.length > 10 && !title.includes('http')) {
            const fullUrl = href.startsWith('http') ? href : `https://cryptojobslist.com${href}`;
            opportunities.push({
              title,
              description: title,
              source: this.name,
              url: fullUrl,
              tags: ['crypto'],
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
