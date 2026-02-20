import { useState, useRef, useEffect } from 'react';
import {
  TextField,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  InputAdornment,
  ClickAwayListener,
  Chip,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Fuse, { FuseResult } from 'fuse.js';
import { Article } from '../../types';
import { articlesApi } from '../../services/api-adapter';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FuseResult<Article>[]>([]);
  const [open, setOpen] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const fuseRef = useRef<Fuse<Article> | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    articlesApi.getAll().then(data => {
      setArticles(data);
      fuseRef.current = new Fuse(data, {
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
    });
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.trim() && fuseRef.current) {
      const searchResults = fuseRef.current.search(value, { limit: 8 });
      setResults(searchResults);
      setOpen(true);
    } else {
      setResults([]);
      setOpen(false);
    }
  };

  const handleSelect = (article: Article) => {
    setQuery('');
    setOpen(false);
    navigate(`/article/${article.slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      setOpen(false);
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box sx={{ position: 'relative', width: '100%' }}>
        <TextField
          size="small"
          placeholder="Search articles, terms, topics..."
          value={query}
          onChange={e => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && results.length > 0 && setOpen(true)}
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'background.default',
              borderRadius: 2,
            },
          }}
        />
        {open && results.length > 0 && (
          <Paper
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              mt: 0.5,
              zIndex: 1300,
              maxHeight: 400,
              overflow: 'auto',
              boxShadow: 3,
            }}
          >
            <List disablePadding>
              {results.map(({ item }) => (
                <ListItemButton key={item.id} onClick={() => handleSelect(item)}>
                  <ListItemText
                    primary={item.title}
                    secondary={
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <Chip label={item.category} size="small" variant="outlined" />
                        <Typography variant="caption" color="text.secondary" component="span" noWrap>
                          {item.summary.slice(0, 80)}...
                        </Typography>
                      </Box>
                    }
                  />
                </ListItemButton>
              ))}
            </List>
            <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
              <Typography
                variant="caption"
                color="primary"
                sx={{ cursor: 'pointer' }}
                onClick={() => {
                  setOpen(false);
                  navigate(`/search?q=${encodeURIComponent(query)}`);
                }}
              >
                View all results for "{query}"
              </Typography>
            </Box>
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
}
