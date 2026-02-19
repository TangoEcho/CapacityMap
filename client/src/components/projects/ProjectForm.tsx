import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Grid, Autocomplete, FormControlLabel, Checkbox,
  InputAdornment, Typography, Box,
} from '@mui/material';
import { Project, ProjectInput } from '../../types';
import { countriesApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { CREDIT_RATINGS } from '../../utils/creditRating';

interface ProjectFormProps {
  open: boolean;
  project: Project | null;
  onClose: () => void;
  onSave: (data: ProjectInput) => Promise<void>;
}

const SENSITIVE_OPTIONS = ['Nuclear', 'Coal'];

function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value;
  if (isNaN(num) || num === 0) return '';
  return num.toLocaleString('en-US');
}

function parseCurrency(value: string): number {
  const num = parseFloat(value.replace(/[^0-9.]/g, ''));
  return isNaN(num) ? 0 : num;
}

export default function ProjectForm({ open, project, onClose, onSave }: ProjectFormProps) {
  const { data: countries } = useApi(() => countriesApi.getAll());
  const [form, setForm] = useState<ProjectInput>({
    name: '', country: '', capacityNeeded: 0, status: 'Planned',
  });
  const [capacityDisplay, setCapacityDisplay] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (project) {
      setForm({
        name: project.name,
        country: project.country,
        capacityNeeded: project.capacityNeeded,
        tenorRequired: project.tenorRequired,
        projectType: project.projectType || [],
        minimumCreditRating: project.minimumCreditRating,
        status: project.status,
        plannedIssuanceDate: project.plannedIssuanceDate,
      });
      setCapacityDisplay(project.capacityNeeded > 0 ? formatCurrency(project.capacityNeeded) : '');
    } else {
      setForm({ name: '', country: '', capacityNeeded: 0, status: 'Planned' });
      setCapacityDisplay('');
    }
  }, [project, open]);

  const handleCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '');
    setCapacityDisplay(raw);
    setForm(f => ({ ...f, capacityNeeded: parseCurrency(raw) }));
  };

  const handleCapacityBlur = () => {
    if (form.capacityNeeded > 0) {
      setCapacityDisplay(formatCurrency(form.capacityNeeded));
    }
  };

  const handleSensitiveToggle = (subject: string) => {
    setForm(f => {
      const current = f.projectType || [];
      const next = current.includes(subject)
        ? current.filter(s => s !== subject)
        : [...current, subject];
      return { ...f, projectType: next };
    });
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const selectedCountry = (countries || []).find(c => c.code === form.country) || null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{project ? 'Edit Project' : 'Add Project'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={12}>
            <TextField
              fullWidth label="Project Name" required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </Grid>
          <Grid size={12}>
            <Autocomplete
              options={countries || []}
              getOptionLabel={o => `${o.name} (${o.code})`}
              value={selectedCountry}
              onChange={(_, v) => setForm(f => ({ ...f, country: v?.code || '' }))}
              groupBy={o => o.region}
              renderInput={params => <TextField {...params} label="Country" required />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth label="Instrument Amount (USD M)" required
              value={capacityDisplay}
              onChange={handleCapacityChange}
              onBlur={handleCapacityBlur}
              placeholder="e.g. 500"
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  endAdornment: <InputAdornment position="end">M</InputAdornment>,
                },
                htmlInput: { inputMode: 'numeric' },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth label="Tenor Required (Years)" type="number"
              value={form.tenorRequired ?? ''}
              onChange={e => setForm(f => ({
                ...f,
                tenorRequired: e.target.value ? Number(e.target.value) : undefined,
              }))}
            />
          </Grid>
          <Grid size={12}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Sensitive Subjects
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {SENSITIVE_OPTIONS.map(subject => (
                <FormControlLabel
                  key={subject}
                  control={
                    <Checkbox
                      checked={(form.projectType || []).includes(subject)}
                      onChange={() => handleSensitiveToggle(subject)}
                    />
                  }
                  label={subject}
                />
              ))}
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete
              options={CREDIT_RATINGS}
              value={form.minimumCreditRating || null}
              onChange={(_, v) => setForm(f => ({ ...f, minimumCreditRating: v || undefined }))}
              renderInput={params => <TextField {...params} label="Minimum Credit Rating" />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth label="Planned Issuance Date" type="date"
              value={form.plannedIssuanceDate?.split('T')[0] || ''}
              onChange={e => setForm(f => ({ ...f, plannedIssuanceDate: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}
          disabled={!form.name || !form.country || !form.capacityNeeded || saving}>
          {saving ? 'Saving...' : project ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
