import axios from 'axios';
import * as cheerio from 'cheerio';
import { JobSource } from './base';
import { JobOpportunity } from '../types';

export class CryptoJobsSource extends JobSource {
  name = 'cryptojobs';

  async discover(): Promise<JobOpportunity[]> {
    const opportunities: JobOpportunity[] = [];
    
    try {
      // CryptoJobs.com public listings
      const url = 'https://cryptojobs.com';
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      
      // Look for job listings
      $('article, .job-item, .job-post, [class*="job"]').each((_, element) => {
        const $el = $(element);
        const title = $el.find('h2, h3, h4, .title, .job-title, a').first().text().trim();
        const link = $el.find('a').first();
        const href = link.attr('href') || '';
        const fullUrl = href.startsWith('http') ? href : `https://cryptojobs.com${href}`;
        const description = $el.find('.description, .job-description, p').text().trim() || title;
        
        if (title && fullUrl && title.length > 5) {
          opportunities.push({
            title,
            description: description.substring(0, 2000),
            source: this.name,
            url: fullUrl,
            tags: ['crypto', 'blockchain'],
          });
        }
      });

      console.log(`[${this.name}] Discovered ${opportunities.length} opportunities`);
    } catch (error) {
      console.error(`[${this.name}] Error discovering jobs:`, error);
    }

    return opportunities;
  }
}
