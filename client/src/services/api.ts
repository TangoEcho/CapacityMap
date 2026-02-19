import { Bank, BankInput, Project, ProjectInput, Settings, CountryInfo } from '../types';

const BASE_URL = 'http://localhost:3001/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 204) return undefined as T;
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

// Banks
export const banksApi = {
  getAll: () => request<Bank[]>('/banks'),
  getById: (id: string) => request<Bank>(`/banks/${id}`),
  create: (data: BankInput) =>
    request<Bank>('/banks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<BankInput>) =>
    request<Bank>(`/banks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<void>(`/banks/${id}`, { method: 'DELETE' }),
};

// Projects
export const projectsApi = {
  getAll: () => request<Project[]>('/projects'),
  getById: (id: string) => request<Project>(`/projects/${id}`),
  create: (data: ProjectInput) =>
    request<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<ProjectInput>) =>
    request<Project>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<void>(`/projects/${id}`, { method: 'DELETE' }),
  markIssued: (id: string) =>
    request<Project>(`/projects/${id}/issue`, { method: 'POST' }),
};

// Settings
export const settingsApi = {
  get: () => request<Settings>('/settings'),
  update: (data: Partial<Settings>) =>
    request<Settings>('/settings', { method: 'PUT', body: JSON.stringify(data) }),
};

// Countries
export const countriesApi = {
  getAll: () => request<CountryInfo[]>('/countries'),
  getRegions: () => request<Record<string, string[]>>('/countries/regions'),
};

// Upload
export const uploadApi = {
  uploadLogo: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('logo', file);
    const res = await fetch(`${BASE_URL}/upload/logo`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },
  importExcel: async (file: File, preview = false) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE_URL}/upload/excel/import?preview=${preview}`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },
  exportExcelUrl: `${BASE_URL}/upload/excel/export`,
  templateUrl: `${BASE_URL}/upload/excel/template`,
};
