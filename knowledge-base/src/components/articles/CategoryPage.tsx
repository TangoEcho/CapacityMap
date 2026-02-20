import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Toolbar,
  Card,
  CardContent,
  CardActionArea,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Article, Category } from '../../types';
import { articlesApi, categoriesApi } from '../../services/api-adapter';
import ArticleCard from './ArticleCard';
import Breadcrumbs from '../common/Breadcrumbs';

export default function CategoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    articlesApi.getAll().then(setArticles);
    categoriesApi.getAll().then(setCategories);
  }, []);

  const category = useMemo(
    () => categories.find(c => c.slug === slug),
    [categories, slug]
  );

  const subcategories = useMemo(
    () => category ? categories.filter(c => c.parentId === category.id).sort((a, b) => a.order - b.order) : [],
    [categories, category]
  );

  const categoryArticles = useMemo(() => {
    if (!category) return [];
    return articles
      .filter(a =>
        a.category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '') === slug ||
        a.subcategory?.toLowerCase().replace(/\s+/g, '-') === slug
      )
      .sort((a, b) => a.order - b.order);
  }, [articles, category, slug]);

  const breadcrumbItems = [];
  if (category?.parentId) {
    const parent = categories.find(c => c.id === category.parentId);
    if (parent) {
      breadcrumbItems.push({ label: parent.name, path: `/category/${parent.slug}` });
    }
  }
  breadcrumbItems.push({ label: category?.name || slug || '' });

  return (
    <Box sx={{ p: 3 }}>
      <Toolbar />
      <Breadcrumbs items={breadcrumbItems} />

      <Typography variant="h4" gutterBottom>
        {category?.name || slug}
      </Typography>
      {category?.description && (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {category.description}
        </Typography>
      )}

      {/* Subcategories */}
      {subcategories.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Subcategories</Typography>
          <Grid container spacing={2}>
            {subcategories.map(sub => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={sub.id}>
                <Card>
                  <CardActionArea onClick={() => navigate(`/category/${sub.slug}`)}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontSize: '1rem' }}>{sub.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {sub.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Articles */}
      {categoryArticles.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Articles</Typography>
          <Grid container spacing={2}>
            {categoryArticles.map(article => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={article.id}>
                <ArticleCard article={article} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {subcategories.length === 0 && categoryArticles.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" color="text.secondary">
            No content yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Articles for this category are coming soon.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
