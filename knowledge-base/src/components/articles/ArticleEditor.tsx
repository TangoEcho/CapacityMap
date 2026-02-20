import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Toolbar,
  Stack,
  Divider,
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { Article } from '../../types';
import { articlesApi } from '../../services/api-adapter';
import MarkdownRenderer from './MarkdownRenderer';

interface ArticleEditorProps {
  article?: Article;
  onSave: (article: Article) => void;
  onCancel: () => void;
}

export default function ArticleEditor({ article, onSave, onCancel }: ArticleEditorProps) {
  const [title, setTitle] = useState(article?.title || '');
  const [content, setContent] = useState(article?.content || '');
  const [summary, setSummary] = useState(article?.summary || '');
  const [tags, setTags] = useState(article?.tags.join(', ') || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        title,
        content,
        summary,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        slug: article?.slug || title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
        category: article?.category || 'Uncategorized',
        relatedArticles: article?.relatedArticles || [],
        order: article?.order || 0,
      };

      let saved: Article;
      if (article) {
        saved = await articlesApi.update(article.id, data);
      } else {
        saved = await articlesApi.create(data);
      }
      onSave(saved);
    } catch {
      // Error is captured by the API layer
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Toolbar />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">
          {article ? 'Edit Article' : 'New Article'}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button startIcon={<Cancel />} onClick={onCancel} variant="outlined">
            Cancel
          </Button>
          <Button
            startIcon={<Save />}
            onClick={handleSave}
            variant="contained"
            disabled={saving || !title.trim() || !content.trim()}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </Stack>
      </Box>

      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Editor side */}
        <Box sx={{ flex: 1 }}>
          <Stack spacing={2}>
            <TextField
              label="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              fullWidth
            />
            <TextField
              label="Summary"
              value={summary}
              onChange={e => setSummary(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Tags (comma-separated)"
              value={tags}
              onChange={e => setTags(e.target.value)}
              fullWidth
            />
            <TextField
              label="Content (Markdown)"
              value={content}
              onChange={e => setContent(e.target.value)}
              fullWidth
              multiline
              minRows={20}
              sx={{
                '& .MuiInputBase-input': {
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                },
              }}
            />
          </Stack>
        </Box>

        {/* Preview side */}
        <Paper sx={{ flex: 1, p: 3, overflow: 'auto', maxHeight: 'calc(100vh - 160px)' }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Preview
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {content ? (
            <MarkdownRenderer content={content} />
          ) : (
            <Typography variant="body2" color="text.secondary">
              Start writing to see a preview...
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
