import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Slider, Grid, Chip, TextField,
  IconButton, Switch, FormControlLabel, Alert,
} from '@mui/material';
import { Add, VisibilityOff } from '@mui/icons-material';
import Navbar from '../common/Navbar';
import { useApi } from '../../hooks/useApi';
import { useSettings } from '../../hooks/useSettings';
import { settingsApi } from '../../services/api-adapter';
import { Settings } from '../../types';

interface SettingsPageProps {
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export default function SettingsPage({ onThemeChange }: SettingsPageProps) {
  const { data: settings, refresh } = useApi<Settings>(() => settingsApi.get());
  const { refresh: refreshGlobal } = useSettings();
  const [weights, setWeights] = useState({ capacityHeadroom: 0.5, priceCompetitiveness: 0.25, creditRating: 0.25 });
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [saved, setSaved] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [hideCapacity, setHideCapacity] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (settings) {
      setWeights(settings.weights);
      setSubjects(settings.sensitiveSubjects);
      setTheme(settings.theme);
      setHideCapacity(settings.hideCapacity ?? false);
      initialized.current = true;
    }
  }, [settings]);

  const saveSettings = useCallback(async (overrides?: Partial<{ weights: typeof weights; sensitiveSubjects: string[]; theme: 'light' | 'dark'; hideCapacity: boolean }>) => {
    const payload = {
      weights: overrides?.weights ?? weights,
      sensitiveSubjects: overrides?.sensitiveSubjects ?? subjects,
      theme: overrides?.theme ?? theme,
      hideCapacity: overrides?.hideCapacity ?? hideCapacity,
    };
    await settingsApi.update(payload);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    refresh();
    refreshGlobal();
  }, [weights, subjects, theme, hideCapacity, refresh, refreshGlobal]);

  const addSubject = () => {
    if (newSubject && !subjects.includes(newSubject)) {
      const next = [...subjects, newSubject];
      setSubjects(next);
      setNewSubject('');
      saveSettings({ sensitiveSubjects: next });
    }
  };

  const removeSubject = (s: string) => {
    const next = subjects.filter(x => x !== s);
    setSubjects(next);
    saveSettings({ sensitiveSubjects: next });
  };

  const handleThemeToggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    onThemeChange(next);
    saveSettings({ theme: next });
  };

  const handleHideCapacityToggle = () => {
    const next = !hideCapacity;
    setHideCapacity(next);
    saveSettings({ hideCapacity: next });
  };

  // Normalize weights so they sum to 1
  const setWeight = (key: keyof typeof weights, value: number) => {
    setWeights(prev => {
      const updated = { ...prev, [key]: value };
      const total = Object.values(updated).reduce((s, v) => s + v, 0);
      if (total > 0) {
        return {
          capacityHeadroom: updated.capacityHeadroom / total,
          priceCompetitiveness: updated.priceCompetitiveness / total,
          creditRating: updated.creditRating / total,
        };
      }
      return updated;
    });
  };

  // Save weights when slider is released
  const handleWeightCommit = () => {
    saveSettings({ weights });
  };

  return (
    <Box>
      <Navbar title="Settings" />
      <Box sx={{ mt: 8, p: 3, maxWidth: 800 }}>
        {saved && <Alert severity="success" sx={{ mb: 2 }}>Settings saved</Alert>}

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Ranking Weights</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Adjust how banks are scored. Weights are automatically normalized to sum to 100%.
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid size={12}>
                <Typography gutterBottom>
                  Capacity Headroom: {(weights.capacityHeadroom * 100).toFixed(0)}%
                </Typography>
                <Slider
                  value={weights.capacityHeadroom}
                  onChange={(_, v) => setWeight('capacityHeadroom', v as number)}
                  onChangeCommitted={handleWeightCommit}
                  min={0} max={1} step={0.05}
                  sx={{ color: '#00875A' }}
                />
              </Grid>
              <Grid size={12}>
                <Typography gutterBottom>
                  Price Competitiveness: {(weights.priceCompetitiveness * 100).toFixed(0)}%
                </Typography>
                <Slider
                  value={weights.priceCompetitiveness}
                  onChange={(_, v) => setWeight('priceCompetitiveness', v as number)}
                  onChangeCommitted={handleWeightCommit}
                  min={0} max={1} step={0.05}
                  sx={{ color: '#00A3A1' }}
                />
              </Grid>
              <Grid size={12}>
                <Typography gutterBottom>
                  Credit Rating: {(weights.creditRating * 100).toFixed(0)}%
                </Typography>
                <Slider
                  value={weights.creditRating}
                  onChange={(_, v) => setWeight('creditRating', v as number)}
                  onChangeCommitted={handleWeightCommit}
                  min={0} max={1} step={0.05}
                  sx={{ color: '#7AB648' }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Sensitive Subjects</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
              {subjects.map(s => (
                <Chip
                  key={s}
                  label={s}
                  onDelete={() => removeSubject(s)}
                  color="warning"
                  variant="outlined"
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Add subject..."
                value={newSubject}
                onChange={e => setNewSubject(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSubject()}
              />
              <IconButton onClick={addSubject} color="primary"><Add /></IconButton>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <VisibilityOff sx={{ fontSize: 20, mr: 1, verticalAlign: 'text-bottom' }} />
              Confidential Mode
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Hide capacity dollar amounts from the interface. Capacity health is shown as color indicators (green/orange/red) to support decision-making without exposing sensitive figures. Pricing data remains visible.
            </Typography>
            <FormControlLabel
              control={<Switch checked={hideCapacity} onChange={handleHideCapacityToggle} />}
              label="Hide Capacity Amounts"
            />
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Appearance</Typography>
            <FormControlLabel
              control={<Switch checked={theme === 'dark'} onChange={handleThemeToggle} />}
              label="Dark Mode"
            />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
