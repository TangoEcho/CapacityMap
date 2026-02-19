import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Grid, Autocomplete, Chip, Box, Typography, IconButton,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { Bank, BankInput } from '../../types';
import { uploadApi, countriesApi } from '../../services/api-adapter';
import { useApi } from '../../hooks/useApi';
import { CREDIT_RATINGS } from '../../utils/creditRating';

interface BankFormProps {
  open: boolean;
  bank: Bank | null;
  onClose: () => void;
  onSave: (data: BankInput) => Promise<void>;
}

const DEFAULT_SENSITIVE = ['Nuclear', 'Coal'];

export default function BankForm({ open, bank, onClose, onSave }: BankFormProps) {
  const { data: countries } = useApi(() => countriesApi.getAll());
  const [form, setForm] = useState<BankInput>({
    name: '', totalCapacity: 0, usedCapacity: 0, countries: [],
    averagePrice: 50, sensitiveSubjects: [],
  });
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    if (bank) {
      setForm({
        name: bank.name,
        logoUrl: bank.logoUrl,
        creditRating: bank.creditRating,
        totalCapacity: bank.totalCapacity,
        usedCapacity: bank.usedCapacity,
        maxTenor: bank.maxTenor,
        averagePrice: bank.averagePrice,
        countries: bank.countries,
        sensitiveSubjects: bank.sensitiveSubjects || [],
      });
    } else {
      setForm({
        name: '', totalCapacity: 0, usedCapacity: 0, countries: [],
        averagePrice: 50, sensitiveSubjects: [],
      });
    }
  }, [bank, open]);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      let logoUrl = form.logoUrl;
      if (logoFile) {
        const result = await uploadApi.uploadLogo(logoFile);
        logoUrl = result.url;
      }
      await onSave({ ...form, logoUrl });
    } finally {
      setSaving(false);
      setLogoFile(null);
    }
  };

  const countryOptions = [
    { code: 'GLOBAL', name: 'Global (All Countries)', region: 'Special' },
    ...(countries || []),
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{bank ? 'Edit Bank' : 'Add Bank'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField
              fullWidth label="Bank Name" required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {(form.logoUrl || logoFile) && (
                <Box
                  component="img"
                  src={logoFile ? URL.createObjectURL(logoFile) : form.logoUrl?.startsWith('data:') ? form.logoUrl : `http://localhost:3001${form.logoUrl}`}
                  sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'contain' }}
                />
              )}
              <Button variant="outlined" component="label" startIcon={<PhotoCamera />}>
                Logo
                <input type="file" hidden accept="image/*"
                  onChange={e => e.target.files?.[0] && setLogoFile(e.target.files[0])} />
              </Button>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Autocomplete
              options={CREDIT_RATINGS}
              value={form.creditRating || null}
              onChange={(_, v) => setForm(f => ({ ...f, creditRating: v || undefined }))}
              renderInput={params => <TextField {...params} label="Credit Rating" />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth label="Total Capacity (USD M)" type="number" required
              value={form.totalCapacity}
              onChange={e => setForm(f => ({ ...f, totalCapacity: Number(e.target.value) }))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth label="Used Capacity (USD M)" type="number" required
              value={form.usedCapacity}
              onChange={e => setForm(f => ({ ...f, usedCapacity: Number(e.target.value) }))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth label="Max Tenor (Years)" type="number"
              value={form.maxTenor ?? ''}
              onChange={e => setForm(f => ({
                ...f,
                maxTenor: e.target.value ? Number(e.target.value) : undefined,
              }))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth label="Average Price (bps)" type="number"
              value={form.averagePrice ?? 50}
              onChange={e => setForm(f => ({ ...f, averagePrice: Number(e.target.value) }))}
            />
          </Grid>
          <Grid size={12}>
            <Autocomplete
              multiple
              options={countryOptions}
              getOptionLabel={o => `${o.code} - ${o.name}`}
              value={countryOptions.filter(c => form.countries.includes(c.code))}
              onChange={(_, v) => setForm(f => ({ ...f, countries: v.map(c => c.code) }))}
              groupBy={o => o.region}
              renderInput={params => <TextField {...params} label="Countries" />}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip label={option.code} size="small" {...getTagProps({ index })} key={option.code} />
                ))
              }
            />
          </Grid>
          <Grid size={12}>
            <Autocomplete
              multiple
              freeSolo
              options={DEFAULT_SENSITIVE}
              value={form.sensitiveSubjects || []}
              onChange={(_, v) => setForm(f => ({ ...f, sensitiveSubjects: v as string[] }))}
              renderInput={params => <TextField {...params} label="Sensitive Subjects" />}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip label={option} size="small" color="warning" variant="outlined"
                    {...getTagProps({ index })} key={option} />
                ))
              }
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!form.name || saving}>
          {saving ? 'Saving...' : bank ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
