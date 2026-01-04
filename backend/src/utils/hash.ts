import crypto from 'crypto';

export function generateHash(url: string, title: string): string {
  const content = `${url}|${title}`;
  return crypto.createHash('sha256').update(content).digest('hex');
}
