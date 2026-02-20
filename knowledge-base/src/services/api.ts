import { Article, ArticleInput, Category, GlossaryTerm, DecisionTree, KBSettings } from '../types';

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

export const articlesApi = {
  getAll: () => request<Article[]>('/articles'),
  getBySlug: (slug: string) => request<Article>(`/articles/by-slug/${encodeURIComponent(slug)}`),
  getById: (id: string) => request<Article>(`/articles/${id}`),
  create: (data: ArticleInput) =>
    request<Article>('/articles', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<ArticleInput>) =>
    request<Article>(`/articles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<void>(`/articles/${id}`, { method: 'DELETE' }),
};

export const categoriesApi = {
  getAll: () => request<Category[]>('/categories'),
};

export const glossaryApi = {
  getAll: () => request<GlossaryTerm[]>('/glossary'),
};

export const decisionTreesApi = {
  getAll: () => request<DecisionTree[]>('/decision-trees'),
  getById: (id: string) => request<DecisionTree>(`/decision-trees/${id}`),
};

export const settingsApi = {
  get: () => request<KBSettings>('/settings'),
  update: (data: Partial<KBSettings>) =>
    request<KBSettings>('/settings', { method: 'PUT', body: JSON.stringify(data) }),
};
