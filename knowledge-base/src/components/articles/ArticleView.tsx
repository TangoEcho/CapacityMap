import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Chip,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Button,
  Stack,
  Divider,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { Article, GlossaryTerm } from '../../types';
import { articlesApi, glossaryApi } from '../../services/api-adapter';
import MarkdownRenderer from './MarkdownRenderer';
import ArticleEditor from './ArticleEditor';
import Breadcrumbs, { BreadcrumbItem } from '../common/Breadcrumbs';
import { extractHeadings } from '../../utils/markdown';

export default function ArticleView() {
  const { '*': slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [glossaryTerms, setGlossaryTerms] = useState<GlossaryTerm[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    articlesApi.getBySlug(slug).then(setArticle).catch(() => setError('Article not found'));
    glossaryApi.getAll().then(setGlossaryTerms);
  }, [slug]);

  useEffect(() => {
    if (!article) return;
    if (article.relatedArticles.length === 0) return;
    articlesApi.getAll().then(all => {
      const related = all.filter(a => article.relatedArticles.includes(a.id));
      setRelatedArticles(related);
    });
  }, [article]);

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Toolbar />
        <Typography variant="h5" color="error">{error}</Typography>
      </Box>
    );
  }

  if (!article) {
    return (
      <Box sx={{ p: 3 }}>
        <Toolbar />
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (editing) {
    return (
      <ArticleEditor
        article={article}
        onSave={(updated) => {
          setArticle(updated);
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  const headings = extractHeadings(article.content);
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: article.category, path: `/category/${article.category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '')}` },
  ];
  if (article.subcategory) {
    breadcrumbItems.push({
      label: article.subcategory,
      path: `/category/${article.subcategory.toLowerCase().replace(/\s+/g, '-')}`,
    });
  }
  breadcrumbItems.push({ label: article.title });

  return (
    <Box sx={{ p: 3 }}>
      <Toolbar />
      <Breadcrumbs items={breadcrumbItems} />

      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Main content */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h4">{article.title}</Typography>
            <Button
              startIcon={<EditIcon />}
              variant="outlined"
              size="small"
              onClick={() => setEditing(true)}
            >
              Edit
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip label={article.category} color="primary" size="small" />
            {article.subcategory && (
              <Chip label={article.subcategory} variant="outlined" size="small" />
            )}
            {article.tags.map(tag => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
            ))}
          </Box>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontStyle: 'italic' }}>
            {article.summary}
          </Typography>

          <MarkdownRenderer content={article.content} glossaryTerms={glossaryTerms} />

          {relatedArticles.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom>Related Articles</Typography>
              <Stack spacing={1}>
                {relatedArticles.map(ra => (
                  <Chip
                    key={ra.id}
                    label={ra.title}
                    onClick={() => navigate(`/article/${ra.slug}`)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          <Box sx={{ mt: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Last updated: {new Date(article.updatedAt).toLocaleDateString()}
              {article.author && ` by ${article.author}`}
            </Typography>
          </Box>
        </Box>

        {/* Table of contents sidebar */}
        {headings.length > 2 && (
          <Paper
            sx={{
              width: 220,
              flexShrink: 0,
              p: 2,
              position: 'sticky',
              top: 80,
              alignSelf: 'flex-start',
              maxHeight: 'calc(100vh - 100px)',
              overflow: 'auto',
              display: { xs: 'none', lg: 'block' },
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              On this page
            </Typography>
            <List dense disablePadding>
              {headings.map(h => (
                <ListItemButton
                  key={h.id}
                  component="a"
                  href={`#${h.id}`}
                  sx={{ pl: (h.level - 1) * 1.5, py: 0.25, borderRadius: 1 }}
                >
                  <ListItemText
                    primary={h.text}
                    primaryTypographyProps={{
                      fontSize: '0.75rem',
                      noWrap: true,
                    }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
