export interface Article {
  id: string;
  slug: string;
  title: string;
  category: string;
  subcategory?: string;
  content: string;
  summary: string;
  tags: string[];
  relatedArticles: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
  author?: string;
}

export interface ArticleInput {
  slug: string;
  title: string;
  category: string;
  subcategory?: string;
  content: string;
  summary: string;
  tags: string[];
  relatedArticles: string[];
  order: number;
  author?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description: string;
  order: number;
  parentId?: string;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  relatedTerms: string[];
  relatedArticles: string[];
}

export interface DecisionTree {
  id: string;
  title: string;
  description: string;
  nodes: DecisionNode[];
}

export interface DecisionNode {
  id: string;
  question?: string;
  options?: { label: string; nextNodeId: string }[];
  recommendation?: string;
  articleId?: string;
}

export interface KBSettings {
  theme: 'light' | 'dark';
}
