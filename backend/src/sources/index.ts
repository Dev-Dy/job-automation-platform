import { JobSource } from './base';
import { Web3CareersSource } from './web3careers';
import { GitHubSource } from './github';
import { CryptoJobsListSource } from './cryptojobslist';
import { CryptoJobsSource } from './cryptojobs';

export const sources: JobSource[] = [
  new Web3CareersSource(),
  new GitHubSource(),
  new CryptoJobsListSource(),
  new CryptoJobsSource(),
];

export { JobSource } from './base';
