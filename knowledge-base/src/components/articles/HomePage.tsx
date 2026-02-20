import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Toolbar,
  Paper,
  TextField,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Description as ArticleIcon,
  Quiz as DecisionIcon,
  Spellcheck as GlossaryIcon,
  TrendingUp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Article } from '../../types';
import { articlesApi } from '../../services/api-adapter';
import ArticleCard from './ArticleCard';

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    articlesApi.getAll().then(setArticles);
  }, []);

  const featuredArticles = articles
    .filter(a => a.order <= 3)
    .sort((a, b) => a.order - b.order)
    .slice(0, 6);

  const recentArticles = [...articles]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const quickLinks = [
    { label: 'Letters of Credit', path: '/category/letters-of-credit', color: '#00875A' },
    { label: 'Bank Guarantees', path: '/category/bank-guarantees', color: '#00A3A1' },
    { label: 'Supply Chain Finance', path: '/category/supply-chain-finance', color: '#7AB648' },
    { label: 'Risk & Compliance', path: '/category/risk-compliance', color: '#E65100' },
    { label: 'Glossary', path: '/glossary', color: '#5C6BC0' },
    { label: 'Decision Tools', path: '/decision-tools', color: '#AB47BC' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Toolbar />

      {/* Hero section */}
      <Paper
        sx={{
          p: 5,
          mb: 4,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #00875A 0%, #00A3A1 100%)',
          color: 'white',
          borderRadius: 3,
        }}
      >
        <Typography variant="h4" gutterBottom fontWeight={700}>
          Trade Finance Knowledge Base
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, maxWidth: 600, mx: 'auto', opacity: 0.9 }}>
          Your comprehensive guide to trade finance products, processes, and terminology.
          Search our library or browse by category.
        </Typography>
        <TextField
          placeholder="Search articles, terms, topics..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
          sx={{
            maxWidth: 500,
            width: '100%',
            '& .MuiOutlinedInput-root': {
              bgcolor: 'rgba(255,255,255,0.95)',
              borderRadius: 3,
              '& fieldset': { border: 'none' },
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
      </Paper>

      {/* Quick links */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
          {quickLinks.map(link => (
            <Chip
              key={link.path}
              label={link.label}
              onClick={() => navigate(link.path)}
              sx={{
                fontWeight: 500,
                px: 1,
                bgcolor: link.color,
                color: 'white',
                '&:hover': { bgcolor: link.color, opacity: 0.9 },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Feature cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardActionArea onClick={() => navigate('/category/trade-finance-products')}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <ArticleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6" gutterBottom>Product Library</Typography>
                <Typography variant="body2" color="text.secondary">
                  Comprehensive guides to LCs, guarantees, SCF, forfaiting, and more.
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardActionArea onClick={() => navigate('/decision-tools')}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <DecisionIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                <Typography variant="h6" gutterBottom>Decision Tools</Typography>
                <Typography variant="body2" color="text.secondary">
                  Interactive guides to help you choose the right TF product.
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardActionArea onClick={() => navigate('/glossary')}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <GlossaryIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h6" gutterBottom>Glossary</Typography>
                <Typography variant="body2" color="text.secondary">
                  A-Z of trade finance terminology with linked articles.
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>

      {/* Featured articles */}
      {featuredArticles.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ArticleIcon color="primary" /> Featured Articles
          </Typography>
          <Grid container spacing={2}>
            {featuredArticles.map(article => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={article.id}>
                <ArticleCard article={article} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Recently updated */}
      {recentArticles.length > 0 && (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp color="secondary" /> Recently Updated
          </Typography>
          <Grid container spacing={2}>
            {recentArticles.map(article => (
              <Grid size={{ xs: 12, sm: 6 }} key={article.id}>
                <ArticleCard article={article} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}
