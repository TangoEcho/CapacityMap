import { Article, ArticleInput, Category, GlossaryTerm, DecisionTree, KBSettings } from '../types';
import { SEED_ARTICLES } from '../data/seedArticles';
import { SEED_CATEGORIES } from '../data/seedCategories';
import { SEED_GLOSSARY } from '../data/seedGlossary';
import { SEED_DECISION_TREES } from '../data/seedDecisionTrees';

const KEYS = {
  articles: 'kb_articles',
  categories: 'kb_categories',
  glossary: 'kb_glossary',
  decisionTrees: 'kb_decision_trees',
  settings: 'kb_settings',
} as const;

const DEFAULT_SETTINGS: KBSettings = {
  theme: 'light',
};

function readStore<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (raw) return JSON.parse(raw);
  return fallback;
}

function writeStore<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function seed(): void {
  if (!localStorage.getItem(KEYS.articles)) {
    writeStore(KEYS.articles, SEED_ARTICLES);
  }
  if (!localStorage.getItem(KEYS.categories)) {
    writeStore(KEYS.categories, SEED_CATEGORIES);
  }
  if (!localStorage.getItem(KEYS.glossary)) {
    writeStore(KEYS.glossary, SEED_GLOSSARY);
  }
  if (!localStorage.getItem(KEYS.decisionTrees)) {
    writeStore(KEYS.decisionTrees, SEED_DECISION_TREES);
  }
  if (!localStorage.getItem(KEYS.settings)) {
    writeStore(KEYS.settings, DEFAULT_SETTINGS);
  }
}

seed();

// --- Articles API ---

export const articlesApi = {
  getAll: async (): Promise<Article[]> => {
    return readStore<Article[]>(KEYS.articles, []);
  },

  getBySlug: async (slug: string): Promise<Article> => {
    const articles = readStore<Article[]>(KEYS.articles, []);
    const article = articles.find(a => a.slug === slug);
    if (!article) throw new Error('Article not found');
    return article;
  },

  getById: async (id: string): Promise<Article> => {
    const articles = readStore<Article[]>(KEYS.articles, []);
    const article = articles.find(a => a.id === id);
    if (!article) throw new Error('Article not found');
    return article;
  },

  create: async (data: ArticleInput): Promise<Article> => {
    const articles = readStore<Article[]>(KEYS.articles, []);
    const now = new Date().toISOString();
    const article: Article = {
      id: crypto.randomUUID(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    articles.push(article);
    writeStore(KEYS.articles, articles);
    return article;
  },

  update: async (id: string, data: Partial<ArticleInput>): Promise<Article> => {
    const articles = readStore<Article[]>(KEYS.articles, []);
    const idx = articles.findIndex(a => a.id === id);
    if (idx === -1) throw new Error('Article not found');
    articles[idx] = {
      ...articles[idx],
      ...data,
      id: articles[idx].id,
      createdAt: articles[idx].createdAt,
      updatedAt: new Date().toISOString(),
    };
    writeStore(KEYS.articles, articles);
    return articles[idx];
  },

  delete: async (id: string): Promise<void> => {
    const articles = readStore<Article[]>(KEYS.articles, []).filter(a => a.id !== id);
    writeStore(KEYS.articles, articles);
  },
};

// --- Categories API ---

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    return readStore<Category[]>(KEYS.categories, []);
  },
};

// --- Glossary API ---

export const glossaryApi = {
  getAll: async (): Promise<GlossaryTerm[]> => {
    return readStore<GlossaryTerm[]>(KEYS.glossary, []);
  },
};

// --- Decision Trees API ---

export const decisionTreesApi = {
  getAll: async (): Promise<DecisionTree[]> => {
    return readStore<DecisionTree[]>(KEYS.decisionTrees, []);
  },

  getById: async (id: string): Promise<DecisionTree> => {
    const trees = readStore<DecisionTree[]>(KEYS.decisionTrees, []);
    const tree = trees.find(t => t.id === id);
    if (!tree) throw new Error('Decision tree not found');
    return tree;
  },
};

// --- Settings API ---

export const settingsApi = {
  get: async (): Promise<KBSettings> => {
    return readStore<KBSettings>(KEYS.settings, DEFAULT_SETTINGS);
  },

  update: async (data: Partial<KBSettings>): Promise<KBSettings> => {
    const settings = readStore<KBSettings>(KEYS.settings, DEFAULT_SETTINGS);
    const updated = { ...settings, ...data };
    writeStore(KEYS.settings, updated);
    return updated;
  },
};
