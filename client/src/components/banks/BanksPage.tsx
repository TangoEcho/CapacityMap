import { useState } from 'react';
import {
  Box, Button, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Chip, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions, Tooltip, TableSortLabel,
  LinearProgress, MenuItem, Select, FormControl, InputLabel,
} from '@mui/material';
import {
  Add, Edit, Delete, Upload, Download, Description,
  Search,
} from '@mui/icons-material';
import Navbar from '../common/Navbar';
import BankForm from './BankForm';
import ExcelImport from './ExcelImport';
import { useApi } from '../../hooks/useApi';
import { useSettings } from '../../hooks/useSettings';
import { banksApi, uploadApi } from '../../services/api-adapter';
import { Bank, BankInput } from '../../types';
import { getRatingColor, formatCountryDisplay, getCapacityHealth } from '../../utils/creditRating';

type SortField = 'name' | 'creditRating' | 'totalCapacity' | 'usedCapacity' | 'availableCapacity' | 'lastUpdated';
type SortDir = 'asc' | 'desc';

export default function BanksPage() {
  const { data: banks, loading, refresh } = useApi<Bank[]>(() => banksApi.getAll());
  const { hideCapacity } = useSettings();
  const [formOpen, setFormOpen] = useState(false);
  const [editBank, setEditBank] = useState<Bank | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [countryFilter, setCountryFilter] = useState('');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleSave = async (data: BankInput) => {
    if (editBank) {
      await banksApi.update(editBank.id, data);
    } else {
      await banksApi.create(data);
    }
    setFormOpen(false);
    setEditBank(null);
    refresh();
  };

  const handleDelete = async (id: string) => {
    await banksApi.delete(id);
    setDeleteConfirm(null);
    refresh();
  };

  const filtered = (banks || [])
    .filter(b => {
      const matchesSearch = !search || b.name.toLowerCase().includes(search.toLowerCase());
      const matchesCountry = !countryFilter ||
        b.countries.includes(countryFilter) || b.countries.includes('GLOBAL');
      return matchesSearch && matchesCountry;
    })
    .sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name': cmp = a.name.localeCompare(b.name); break;
        case 'creditRating': cmp = (a.creditRating || '').localeCompare(b.creditRating || ''); break;
        case 'totalCapacity': cmp = a.totalCapacity - b.totalCapacity; break;
        case 'usedCapacity': cmp = a.usedCapacity - b.usedCapacity; break;
        case 'availableCapacity': cmp = (a.totalCapacity - a.usedCapacity) - (b.totalCapacity - b.usedCapacity); break;
        case 'lastUpdated': cmp = a.lastUpdated.localeCompare(b.lastUpdated); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const allCountries = Array.from(new Set((banks || []).flatMap(b => b.countries))).sort();

  const columns: { field: SortField; label: string }[] = [
    { field: 'name', label: 'Bank Name' },
    { field: 'creditRating', label: 'Rating' },
    { field: 'availableCapacity', label: hideCapacity ? 'Capacity' : 'Available (USD M)' },
  ];

  return (
    <Box>
      <Navbar
        title="Banks"
        actions={
          <>
            <Tooltip title="Download Template">
              <IconButton href={uploadApi.templateUrl} component="a">
                <Description />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export Excel">
              <IconButton href={uploadApi.exportExcelUrl} component="a">
                <Download />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<Upload />}
              onClick={() => setImportOpen(true)}
            >
              Import Excel
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => { setEditBank(null); setFormOpen(true); }}
            >
              Add Bank
            </Button>
          </>
        }
      />
      <Box sx={{ mt: 8, p: 3 }}>
        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            size="small"
            placeholder="Search banks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            slotProps={{ input: { startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> } }}
            sx={{ minWidth: 250 }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Country Filter</InputLabel>
            <Select
              value={countryFilter}
              label="Country Filter"
              onChange={e => setCountryFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {allCountries.map(c => (
                <MenuItem key={c} value={c}>{formatCountryDisplay(c)}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                {columns.map(col => (
                  <TableCell key={col.field} sx={{ color: 'white', fontWeight: 600 }}>
                    <TableSortLabel
                      active={sortField === col.field}
                      direction={sortField === col.field ? sortDir : 'asc'}
                      onClick={() => handleSort(col.field)}
                      sx={{
                        color: 'white !important',
                        '& .MuiTableSortLabel-icon': { color: 'white !important' },
                      }}
                    >
                      {col.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Price (bps)</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Max Tenor</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Countries</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Sensitive</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(bank => {
                const available = bank.totalCapacity - bank.usedCapacity;
                const health = getCapacityHealth(available, bank.totalCapacity);
                const rc = getRatingColor(bank.creditRating);
                return (
                  <TableRow key={bank.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {bank.logoUrl && (
                          <Box
                            component="img"
                            src={bank.logoUrl?.startsWith('data:') ? bank.logoUrl : `http://localhost:3001${bank.logoUrl}`}
                            sx={{ width: 24, height: 24, borderRadius: 1, objectFit: 'contain' }}
                          />
                        )}
                        <Typography variant="body2" fontWeight={600}>{bank.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {bank.creditRating && (
                        <Chip label={bank.creditRating} size="small"
                          sx={{ bgcolor: rc.bg, color: rc.text, fontWeight: 600, border: '1px solid', borderColor: rc.text + '30' }} />
                      )}
                    </TableCell>
                    <TableCell>
                      {hideCapacity ? (
                        <Chip
                          label={health.label}
                          size="small"
                          sx={{ bgcolor: health.bg, color: health.color, fontWeight: 600 }}
                        />
                      ) : (
                        <Typography variant="body2" component="span" sx={{ fontWeight: 600, color: available > 0 ? 'success.main' : 'error.main' }}>
                          {available.toLocaleString()}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{bank.averagePrice ?? '—'}</TableCell>
                    <TableCell>{bank.maxTenor ? `${bank.maxTenor} yrs` : '—'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {bank.countries.slice(0, 3).map(c => (
                          <Chip key={c} label={formatCountryDisplay(c)} size="small" />
                        ))}
                        {bank.countries.length > 3 && (
                          <Chip label={`+${bank.countries.length - 3}`} size="small" variant="outlined" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {(bank.sensitiveSubjects || []).map(s => (
                          <Chip key={s} label={s} size="small" color="warning" variant="outlined" />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<Edit fontSize="small" />}
                          onClick={() => { setEditBank(bank); setFormOpen(true); }}
                          sx={{ minWidth: 0, textTransform: 'none', fontSize: 12 }}
                        >
                          Edit
                        </Button>
                        <IconButton size="small" onClick={() => setDeleteConfirm(bank.id)} color="error" title="Delete">
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                      No banks found. Add banks or import from Excel to get started.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Bank Form Dialog */}
      <BankForm
        open={formOpen}
        bank={editBank}
        onClose={() => { setFormOpen(false); setEditBank(null); }}
        onSave={handleSave}
      />

      {/* Excel Import Dialog */}
      <ExcelImport
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onComplete={() => { setImportOpen(false); refresh(); }}
      />

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Delete Bank</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this bank? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
