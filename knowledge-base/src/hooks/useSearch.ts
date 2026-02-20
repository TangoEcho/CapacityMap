import { useState, useMemo, useCallback } from 'react';
import Fuse, { FuseResultMatch } from 'fuse.js';
import { Article } from '../types';

interface SearchResult {
  item: Article;
  score: number;
  matches: readonly FuseResultMatch[];
}

export function useSearch(articles: Article[] | null) {
  const [query, setQuery] = useState('');

  const fuse = useMemo(() => {
    if (!articles) return null;
    return new Fuse(articles, {
      keys: [
        { name: 'title', weight: 3 },
        { name: 'summary', weight: 2 },
        { name: 'tags', weight: 2 },
        { name: 'content', weight: 1 },
      ],
      includeScore: true,
      includeMatches: true,
      threshold: 0.4,
      minMatchCharLength: 2,
    });
  }, [articles]);

  const results: SearchResult[] = useMemo(() => {
    if (!fuse || !query.trim()) return [];
    return fuse.search(query).map(r => ({
      item: r.item,
      score: r.score ?? 1,
      matches: r.matches ?? [],
    }));
  }, [fuse, query]);

  const search = useCallback((q: string) => {
    setQuery(q);
  }, []);

  return { query, search, results };
}
