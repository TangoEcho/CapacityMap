import { useState } from 'react';
import {
  Box, Typography, Accordion, AccordionSummary, AccordionDetails,
  Chip, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, TextField, Card, CardContent, Grid, TableSortLabel,
  FormControlLabel, Switch,
} from '@mui/material';
import { ExpandMore, Search, Public } from '@mui/icons-material';
import Navbar from '../common/Navbar';
import { useApi } from '../../hooks/useApi';
import { useSettings } from '../../hooks/useSettings';
import { banksApi, projectsApi, countriesApi } from '../../services/api';
import { Bank, Project, CountryInfo } from '../../types';
import { countryCodeToFlag, getRatingColor } from '../../utils/creditRating';

type CountrySortField = 'name' | 'banks' | 'projects' | 'capacity';
type CountrySortDir = 'asc' | 'desc';

export default function CountriesPage() {
  const { data: countries } = useApi(() => countriesApi.getAll());
  const { data: regions } = useApi(() => countriesApi.getRegions());
  const { data: banks } = useApi<Bank[]>(() => banksApi.getAll());
  const { data: projects } = useApi<Project[]>(() => projectsApi.getAll());
  const { hideCapacity } = useSettings();
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [sortField, setSortField] = useState<CountrySortField>('name');
  const [sortDir, setSortDir] = useState<CountrySortDir>('asc');
  const [onlyWithProjects, setOnlyWithProjects] = useState(false);

  const handleSort = (field: CountrySortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir(field === 'name' ? 'asc' : 'desc');
    }
  };

  const getBanksForCountry = (code: string) =>
    (banks || []).filter(b => b.countries.includes(code) || b.countries.includes('GLOBAL'));

  const getProjectsForCountry = (code: string) =>
    (projects || []).filter(p => p.country === code);

  const getCapacityForCountry = (code: string) => {
    const countryBanks = getBanksForCountry(code);
    return countryBanks.reduce((sum, b) => sum + (b.totalCapacity - b.usedCapacity), 0);
  };

  const filteredCountries = (countries || []).filter(c => {
    const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.code.includes(search.toUpperCase());
    const matchesProjects = !onlyWithProjects || getProjectsForCountry(c.code).length > 0;
    return matchesSearch && matchesProjects;
  });

  const regionNames = Object.keys(regions || {});

  const selectedCountryInfo = selectedCountry
    ? (countries || []).find(c => c.code === selectedCountry)
    : null;

  const selectedBanks = selectedCountry ? getBanksForCountry(selectedCountry) : [];
  const selectedProjects = selectedCountry ? getProjectsForCountry(selectedCountry) : [];

  return (
    <Box>
      <Navbar title="Countries & Regions" />
      <Box sx={{ mt: 8, p: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search countries..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            slotProps={{ input: { startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> } }}
            sx={{ minWidth: 300 }}
          />
          <FormControlLabel
            control={<Switch checked={onlyWithProjects} onChange={() => setOnlyWithProjects(v => !v)} size="small" />}
            label="With projects only"
            sx={{ '& .MuiFormControlLabel-label': { fontSize: 13 } }}
          />
        </Box>

        <Grid container spacing={3}>
          {/* Country list — left side */}
          <Grid size={{ xs: 12, md: 7 }}>
            {regionNames.map(region => {
              const regionCountries = filteredCountries.filter(c => c.region === region);
              if (regionCountries.length === 0) return null;
              const sortedRegionCountries = [...regionCountries].sort((a, b) => {
                let cmp = 0;
                switch (sortField) {
                  case 'name': cmp = a.name.localeCompare(b.name); break;
                  case 'banks': cmp = getBanksForCountry(a.code).length - getBanksForCountry(b.code).length; break;
                  case 'projects': cmp = getProjectsForCountry(a.code).length - getProjectsForCountry(b.code).length; break;
                  case 'capacity': cmp = getCapacityForCountry(a.code) - getCapacityForCountry(b.code); break;
                }
                return sortDir === 'asc' ? cmp : -cmp;
              });
              return (
                <Accordion key={region} defaultExpanded={regionCountries.length < 10}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography fontWeight={600}>{region}</Typography>
                    <Chip label={regionCountries.length} size="small" sx={{ ml: 1 }} />
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0 }}>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#f8f9fb' }}>
                            <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                              <TableSortLabel active={sortField === 'name'} direction={sortField === 'name' ? sortDir : 'asc'} onClick={() => handleSort('name')}>
                                Country
                              </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                              <TableSortLabel active={sortField === 'banks'} direction={sortField === 'banks' ? sortDir : 'desc'} onClick={() => handleSort('banks')}>
                                Banks
                              </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                              <TableSortLabel active={sortField === 'projects'} direction={sortField === 'projects' ? sortDir : 'desc'} onClick={() => handleSort('projects')}>
                                Projects
                              </TableSortLabel>
                            </TableCell>
                            {!hideCapacity && (
                              <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                                <TableSortLabel active={sortField === 'capacity'} direction={sortField === 'capacity' ? sortDir : 'desc'} onClick={() => handleSort('capacity')}>
                                  Available Capacity
                                </TableSortLabel>
                              </TableCell>
                            )}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {sortedRegionCountries.map(c => (
                            <TableRow
                              key={c.code}
                              hover
                              onClick={() => setSelectedCountry(c.code)}
                              sx={{
                                cursor: 'pointer',
                                bgcolor: selectedCountry === c.code ? 'action.selected' : undefined,
                              }}
                            >
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography sx={{ fontSize: 18 }}>{countryCodeToFlag(c.code)}</Typography>
                                  <Box>
                                    <Typography variant="body2" fontWeight={600}>{c.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">{c.code}</Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={getBanksForCountry(c.code).length}
                                  size="small"
                                  color={getBanksForCountry(c.code).length > 0 ? 'default' : 'default'}
                                  variant="outlined"
                                  sx={{ fontSize: 12, minWidth: 32 }}
                                />
                              </TableCell>
                              <TableCell>
                                {getProjectsForCountry(c.code).length > 0 ? (
                                  <Chip
                                    label={getProjectsForCountry(c.code).length}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    sx={{ fontSize: 12, minWidth: 32 }}
                                  />
                                ) : (
                                  <Typography variant="caption" color="text.secondary">—</Typography>
                                )}
                              </TableCell>
                              {!hideCapacity && (
                                <TableCell>
                                  <Typography variant="body2" fontWeight={500}>
                                    ${getCapacityForCountry(c.code).toLocaleString()}M
                                  </Typography>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Grid>

          {/* Detail pane — always visible on right */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ position: 'sticky', top: 80, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                {selectedCountryInfo ? (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <Typography sx={{ fontSize: 36 }}>{countryCodeToFlag(selectedCountryInfo.code)}</Typography>
                      <Box>
                        <Typography variant="h5" fontWeight={700} sx={{ color: '#1a1a2e' }}>
                          {selectedCountryInfo.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.3 }}>
                          <Chip label={selectedCountryInfo.code} size="small" />
                          <Chip label={selectedCountryInfo.region} size="small" variant="outlined" />
                        </Box>
                      </Box>
                    </Box>

                    {!hideCapacity && (
                      <Paper elevation={0} sx={{ bgcolor: '#f0faf7', borderRadius: 1.5, p: 2, mb: 2 }}>
                        <Typography variant="caption" fontWeight={600} sx={{ color: '#16a34a', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          Total Available Capacity
                        </Typography>
                        <Typography variant="h4" fontWeight={800} sx={{ color: '#1a1a2e' }}>
                          ${getCapacityForCountry(selectedCountry!).toLocaleString()}M
                        </Typography>
                      </Paper>
                    )}

                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#374151', mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Banks ({selectedBanks.length})
                    </Typography>
                    {selectedBanks.length > 0 ? (
                      <Box sx={{ mb: 2.5 }}>
                        {selectedBanks.map(b => (
                          <Box key={b.id} sx={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            py: 1, borderBottom: '1px solid', borderColor: 'divider',
                          }}>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>{b.name}</Typography>
                              {b.creditRating && (() => {
                                const rc = getRatingColor(b.creditRating);
                                return (
                                  <Chip label={b.creditRating} size="small"
                                    sx={{ fontSize: 10, height: 18, bgcolor: rc.bg, color: rc.text, fontWeight: 600 }} />
                                );
                              })()}
                            </Box>
                            {!hideCapacity && (
                              <Typography variant="body2" fontWeight={600} sx={{ color: '#16a34a' }}>
                                ${(b.totalCapacity - b.usedCapacity).toLocaleString()}M
                              </Typography>
                            )}
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                        No banks operate in this country.
                      </Typography>
                    )}

                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#374151', mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Projects ({selectedProjects.length})
                    </Typography>
                    {selectedProjects.length > 0 ? (
                      <Box>
                        {selectedProjects.map(p => (
                          <Box key={p.id} sx={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            py: 1, borderBottom: '1px solid', borderColor: 'divider',
                          }}>
                            <Typography variant="body2" fontWeight={600}>{p.name}</Typography>
                            <Chip label={p.status} size="small"
                              color={p.status === 'Issued' ? 'success' : 'warning'}
                              sx={{ fontWeight: 600, fontSize: 11 }} />
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No projects in this country.
                      </Typography>
                    )}
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Public sx={{ fontSize: 48, color: '#d1d5db', mb: 1 }} />
                    <Typography variant="h6" color="text.secondary" fontWeight={600}>
                      Select a Country
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Click on a country from the list to see its banks, projects, and capacity details.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
