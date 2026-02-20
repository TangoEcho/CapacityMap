import { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Toolbar,
  TextField,
  InputAdornment,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GlossaryTerm, Article } from '../../types';
import { glossaryApi, articlesApi } from '../../services/api-adapter';
import Breadcrumbs from '../common/Breadcrumbs';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function GlossaryPage() {
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [filter, setFilter] = useState('');
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    glossaryApi.getAll().then(setTerms);
    articlesApi.getAll().then(setArticles);
  }, []);

  const filteredTerms = useMemo(() => {
    let result = [...terms].sort((a, b) => a.term.localeCompare(b.term));
    if (activeLetter) {
      result = result.filter(t => t.term[0].toUpperCase() === activeLetter);
    }
    if (filter) {
      const lower = filter.toLowerCase();
      result = result.filter(
        t => t.term.toLowerCase().includes(lower) || t.definition.toLowerCase().includes(lower)
      );
    }
    return result;
  }, [terms, activeLetter, filter]);

  const availableLetters = useMemo(() => {
    const letters = new Set(terms.map(t => t.term[0].toUpperCase()));
    return letters;
  }, [terms]);

  const articleMap = useMemo(() => {
    const map = new Map<string, Article>();
    articles.forEach(a => map.set(a.id, a));
    return map;
  }, [articles]);

  return (
    <Box sx={{ p: 3 }}>
      <Toolbar />
      <Breadcrumbs items={[{ label: 'Glossary' }]} />

      <Typography variant="h4" gutterBottom>Trade Finance Glossary</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        A comprehensive glossary of trade finance terms and definitions.
      </Typography>

      {/* Search */}
      <TextField
        placeholder="Filter terms..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
        size="small"
        sx={{ mb: 2, maxWidth: 400, width: '100%' }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />

      {/* Alphabet index */}
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 3 }}>
        <Chip
          label="All"
          size="small"
          variant={activeLetter === null ? 'filled' : 'outlined'}
          color={activeLetter === null ? 'primary' : 'default'}
          onClick={() => setActiveLetter(null)}
        />
        {ALPHABET.map(letter => (
          <Chip
            key={letter}
            label={letter}
            size="small"
            variant={activeLetter === letter ? 'filled' : 'outlined'}
            color={activeLetter === letter ? 'primary' : 'default'}
            disabled={!availableLetters.has(letter)}
            onClick={() => setActiveLetter(letter)}
          />
        ))}
      </Box>

      {/* Terms list */}
      <Paper>
        <List>
          {filteredTerms.map((term, i) => (
            <Box key={term.id}>
              {i > 0 && <Divider />}
              <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 2 }}>
                <ListItemText
                  primary={
                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                      {term.term}
                    </Typography>
                  }
                  secondary={term.definition}
                />
                {(term.relatedTerms.length > 0 || term.relatedArticles.length > 0) && (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                    {term.relatedTerms.map(rt => (
                      <Chip key={rt} label={rt} size="small" variant="outlined" />
                    ))}
                    {term.relatedArticles.map(articleId => {
                      const article = articleMap.get(articleId);
                      if (!article) return null;
                      return (
                        <Chip
                          key={articleId}
                          label={article.title}
                          size="small"
                          color="primary"
                          variant="outlined"
                          onClick={() => navigate(`/article/${article.slug}`)}
                          sx={{ cursor: 'pointer' }}
                        />
                      );
                    })}
                  </Box>
                )}
              </ListItem>
            </Box>
          ))}
          {filteredTerms.length === 0 && (
            <ListItem>
              <ListItemText
                primary="No terms found"
                secondary="Try a different search or letter filter."
              />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
}
