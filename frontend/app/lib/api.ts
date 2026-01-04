import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function fetchOpportunities(params?: { minScore?: number; source?: string }) {
  const response = await api.get('/api/opportunities', { params });
  return response.data;
}

export async function fetchOpportunity(id: number) {
  const response = await api.get(`/api/opportunities/${id}`);
  return response.data;
}

export async function applyToOpportunity(id: number, status: string = 'applied') {
  const response = await api.post(`/api/opportunities/${id}/apply`, { status, method: 'manual' });
  return response.data;
}

export async function fetchOverview() {
  const response = await api.get('/api/opportunities/analytics/overview');
  return response.data;
}

export async function fetchFunnel() {
  const response = await api.get('/api/opportunities/analytics/funnel');
  return response.data;
}

export async function fetchSources() {
  const response = await api.get('/api/opportunities/analytics/sources');
  return response.data;
}

export async function triggerDiscovery() {
  const response = await api.post('/api/discover');
  return response.data;
}

export async function fetchCategories() {
  const response = await api.get('/api/opportunities/analytics/categories');
  return response.data;
}

export async function importOpportunity(data: {
  title: string;
  description: string;
  url: string;
  source?: string;
  sourceType?: 'manual' | 'email';
  tags?: string[];
}) {
  const response = await api.post('/api/opportunities/import', data);
  return response.data;
}

export async function importFromEmail(data: {
  subject: string;
  body: string;
  from?: string;
  url?: string;
}) {
  const response = await api.post('/api/opportunities/import/email', data);
  return response.data;
}
