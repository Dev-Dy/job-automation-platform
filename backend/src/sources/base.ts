import { JobOpportunity } from '../types';

export abstract class JobSource {
  abstract name: string;
  abstract discover(): Promise<JobOpportunity[]>;

  protected async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
