import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  CardActionArea,
  Stack,
  Toolbar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import { Article } from '../../types';
import { articlesApi } from '../../services/api-adapter';
import Breadcrumbs from '../common/Breadcrumbs';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    articlesApi.getAll().then(setArticles);
  }, []);

  const fuse = useMemo(() => {
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

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return fuse.search(query);
  }, [fuse, query]);

  const categories = useMemo(() => {
    const cats = new Set(results.map(r => r.item.category));
    return Array.from(cats);
  }, [results]);

  const filteredResults = selectedCategory
    ? results.filter(r => r.item.category === selectedCategory)
    : results;

  return (
    <Box sx={{ p: 3 }}>
      <Toolbar />
      <Breadcrumbs items={[{ label: 'Search Results' }]} />
      <Typography variant="h5" gutterBottom>
        Search results for "{query}"
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} found
      </Typography>

      {categories.length > 1 && (
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          <Chip
            label="All"
            variant={selectedCategory === null ? 'filled' : 'outlined'}
            color={selectedCategory === null ? 'primary' : 'default'}
            onClick={() => setSelectedCategory(null)}
          />
          {categories.map(cat => (
            <Chip
              key={cat}
              label={cat}
              variant={selectedCategory === cat ? 'filled' : 'outlined'}
              color={selectedCategory === cat ? 'primary' : 'default'}
              onClick={() => setSelectedCategory(cat)}
            />
          ))}
        </Stack>
      )}

      <Stack spacing={2}>
        {filteredResults.map(({ item }) => (
          <Card key={item.id}>
            <CardActionArea onClick={() => navigate(`/article/${item.slug}`)}>
              <CardContent>
                <Typography variant="h6">{item.title}</Typography>
                <Box sx={{ display: 'flex', gap: 1, my: 1 }}>
                  <Chip label={item.category} size="small" color="primary" variant="outlined" />
                  {item.subcategory && (
                    <Chip label={item.subcategory} size="small" variant="outlined" />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {item.summary}
                </Typography>
                {item.tags.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                    {item.tags.map(tag => (
                      <Chip key={tag} label={tag} size="small" sx={{ fontSize: '0.7rem' }} />
                    ))}
                  </Box>
                )}
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
        {query && filteredResults.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary">
              No results found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Try different keywords or browse categories in the sidebar.
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
}
