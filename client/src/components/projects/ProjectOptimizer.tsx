import { useState, useMemo } from 'react';
import {
  Box, Button, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, IconButton, Alert, Card, CardContent,
  Select, MenuItem, FormControl, Collapse, Grid, TableSortLabel, TextField,
} from '@mui/material';
import { AutoFixHigh, Check, Close, Lock, Refresh, ExpandMore, ExpandLess, Search } from '@mui/icons-material';
import { Bank, Project, Settings, OptimizationResult, CountryInfo } from '../../types';
import { optimizeProjects, rankBanksForProject } from '../../utils/ranking';
import { projectsApi } from '../../services/api-adapter';
import { useSettings } from '../../hooks/useSettings';
import { getRatingColor, countryCodeToFlag, getCapacityHealth } from '../../utils/creditRating';

interface OptimizerProps {
  banks: Bank[];
  projects: Project[];
  settings: Settings;
  countries: CountryInfo[];
  onRefresh: () => void;
}

function EligibleBankList({ banks, selectedBankId, onSelect, hideCapacity }: {
  banks: Bank[];
  selectedBankId?: string;
  onSelect: (bankId: string) => void;
  hideCapacity: boolean;
}) {
  return (
    <Box sx={{ p: 2, bgcolor: '#f8f9fb' }}>
      <Typography variant="caption" fontWeight={700} sx={{ mb: 1.5, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5, color: '#374151' }}>
        Eligible Banks ({banks.length})
      </Typography>
      <Grid container spacing={1}>
        {banks.map(bank => {
          const rc = getRatingColor(bank.creditRating);
          const available = bank.totalCapacity - bank.usedCapacity;
          const health = getCapacityHealth(available, bank.totalCapacity);
          const isSelected = bank.id === selectedBankId;
          return (
            <Grid key={bank.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper
                elevation={0}
                onClick={() => onSelect(bank.id)}
                sx={{
                  p: 1.5, cursor: 'pointer', borderRadius: 1.5,
                  border: '2px solid',
                  borderColor: isSelected ? '#16a34a' : 'divider',
                  bgcolor: isSelected ? '#f0fdf4' : 'white',
                  transition: 'all 0.15s',
                  '&:hover': { borderColor: isSelected ? '#16a34a' : '#9ca3af', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="body2" fontWeight={600}>{bank.name}</Typography>
                  {isSelected && <Check sx={{ fontSize: 16, color: '#16a34a' }} />}
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {bank.creditRating && (
                    <Chip label={bank.creditRating} size="small"
                      sx={{ fontSize: 10, height: 18, bgcolor: rc.bg, color: rc.text, fontWeight: 600 }} />
                  )}
                  <Chip label={`${bank.averagePrice ?? '—'} bps`} size="small" variant="outlined"
                    sx={{ fontSize: 10, height: 18 }} />
                  {hideCapacity ? (
                    <Chip label={health.label} size="small"
                      sx={{ fontSize: 10, height: 18, bgcolor: health.bg, color: health.color, fontWeight: 600 }} />
                  ) : (
                    <Chip label={`$${available.toLocaleString()}M avail`} size="small" variant="outlined"
                      sx={{ fontSize: 10, height: 18 }} />
                  )}
                </Box>
              </Paper>
            </Grid>
          );
        })}
        {banks.length === 0 && (
          <Grid size={12}>
            <Typography variant="body2" color="text.secondary">No eligible banks for this project.</Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

export default function ProjectOptimizer({ banks, projects, settings, countries, onRefresh }: OptimizerProps) {
  const [results, setResults] = useState<OptimizationResult[] | null>(null);
  const [committed, setCommitted] = useState(false);
  const [forcedAssignments, setForcedAssignments] = useState<Record<string, string>>({});
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'name' | 'country' | 'capacity' | 'eligible'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const { hideCapacity } = useSettings();

  const handleOptSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir(field === 'name' || field === 'country' ? 'asc' : 'desc');
    }
  };

  const allPlanned = projects.filter(p => p.status === 'Planned');
  const planned = allPlanned.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  const eligibleBanksByProject = useMemo(() => {
    const map: Record<string, Bank[]> = {};
    for (const p of allPlanned) {
      const ranked = rankBanksForProject(banks, p, settings.weights);
      map[p.id] = ranked.filter(r => r.eligible);
    }
    return map;
  }, [banks, allPlanned, settings.weights]);

  const handleOptimize = () => {
    const r = optimizeProjects(banks, projects, settings.weights, forcedAssignments);
    setResults(r.map(item => ({ ...item, accepted: true })));
    setCommitted(false);
  };

  const toggleAccept = (projectId: string) => {
    setResults(prev =>
      prev?.map(r =>
        r.projectId === projectId ? { ...r, accepted: !r.accepted } : r
      ) || null
    );
  };

  const handleSelectBank = (projectId: string, bankId: string) => {
    if (forcedAssignments[projectId] === bankId) {
      // Deselect
      setForcedAssignments(prev => {
        const next = { ...prev };
        delete next[projectId];
        return next;
      });
    } else {
      setForcedAssignments(prev => ({ ...prev, [projectId]: bankId }));
    }
  };

  const toggleExpand = (projectId: string) => {
    setExpandedRows(prev => ({ ...prev, [projectId]: !prev[projectId] }));
  };

  const handleCommit = async () => {
    if (!results) return;
    const accepted = results.filter(r => r.accepted && r.recommendedBankId);
    for (const r of accepted) {
      await projectsApi.update(r.projectId, { allocatedBankId: r.recommendedBankId });
    }
    setCommitted(true);
    onRefresh();
  };

  const getProjectCountryCode = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.country || '';
  };

  const getProjectCountryName = (projectId: string) => {
    const code = getProjectCountryCode(projectId);
    return countries.find(c => c.code === code)?.name || code;
  };

  const getProjectCapacity = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.capacityNeeded || 0;
  };

  const getBankDetails = (bankId: string) => {
    return banks.find(b => b.id === bankId);
  };

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6">Multi-Project Optimizer</Typography>
            <Typography variant="body2" color="text.secondary">
              Optimally assign banks to {allPlanned.length} planned projects.
              Select banks manually or let the optimizer assign them automatically.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {results && Object.keys(forcedAssignments).length > 0 && (
              <Button variant="outlined" startIcon={<Refresh />} onClick={handleOptimize}>
                Re-optimize
              </Button>
            )}
            <Button
              variant="contained"
              startIcon={<AutoFixHigh />}
              onClick={handleOptimize}
              disabled={allPlanned.length === 0}
              size="large"
            >
              {results ? 'Optimize Again' : 'Optimize All'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {allPlanned.length > 0 && Object.keys(forcedAssignments).length > 0 && !results && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {Object.keys(forcedAssignments).length} project(s) have selected bank assignments.
          Click "Optimize All" to optimize around these selections.
        </Alert>
      )}

      {allPlanned.length === 0 && (
        <Alert severity="info">No planned projects to optimize. Add projects with "Planned" status first.</Alert>
      )}

      {/* Pre-optimization: show planned projects with bank selection */}
      {!results && allPlanned.length > 0 && (
        <>
          <Box sx={{ mb: 2 }}>
            <TextField
              size="small"
              placeholder="Search projects..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              slotProps={{ input: { startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> } }}
              sx={{ minWidth: 250 }}
            />
          </Box>
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f9fb' }}>
                <TableCell sx={{ fontWeight: 700, fontSize: 12, width: 40 }}></TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                  <TableSortLabel active={sortField === 'name'} direction={sortField === 'name' ? sortDir : 'asc'} onClick={() => handleOptSort('name')}>
                    Project
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                  <TableSortLabel active={sortField === 'country'} direction={sortField === 'country' ? sortDir : 'asc'} onClick={() => handleOptSort('country')}>
                    Country
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                  <TableSortLabel active={sortField === 'capacity'} direction={sortField === 'capacity' ? sortDir : 'desc'} onClick={() => handleOptSort('capacity')}>
                    Instrument Amount
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                  <TableSortLabel active={sortField === 'eligible'} direction={sortField === 'eligible' ? sortDir : 'desc'} onClick={() => handleOptSort('eligible')}>
                    Eligible Banks
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Selected Bank</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...planned].sort((a, b) => {
                let cmp = 0;
                switch (sortField) {
                  case 'name': cmp = a.name.localeCompare(b.name); break;
                  case 'country': {
                    const aName = countries.find(c => c.code === a.country)?.name || a.country;
                    const bName = countries.find(c => c.code === b.country)?.name || b.country;
                    cmp = aName.localeCompare(bName); break;
                  }
                  case 'capacity': cmp = a.capacityNeeded - b.capacityNeeded; break;
                  case 'eligible': cmp = (eligibleBanksByProject[a.id]?.length || 0) - (eligibleBanksByProject[b.id]?.length || 0); break;
                }
                return sortDir === 'asc' ? cmp : -cmp;
              }).map(p => {
                const eligible = eligibleBanksByProject[p.id] || [];
                const countryCode = p.country;
                const countryName = countries.find(c => c.code === countryCode)?.name || countryCode;
                const isExpanded = expandedRows[p.id] || false;
                const selectedBank = forcedAssignments[p.id] ? getBankDetails(forcedAssignments[p.id]) : null;
                return (
                  <>
                    <TableRow key={p.id} sx={{ '& > td': { borderBottom: isExpanded ? 'none' : undefined } }}>
                      <TableCell sx={{ py: 0.5 }}>
                        <IconButton size="small" onClick={() => toggleExpand(p.id)}>
                          {isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{p.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography sx={{ fontSize: 16, lineHeight: 1 }}>{countryCodeToFlag(countryCode)}</Typography>
                          <Typography variant="body2">{countryName}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>${p.capacityNeeded.toLocaleString()}M</TableCell>
                      <TableCell>
                        <Chip label={`${eligible.length} banks`} size="small"
                          color={eligible.length === 0 ? 'error' : eligible.length <= 2 ? 'warning' : 'default'} />
                      </TableCell>
                      <TableCell>
                        {selectedBank ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Lock sx={{ fontSize: 14, color: '#6366f1' }} />
                            <Typography variant="body2" fontWeight={600}>{selectedBank.name}</Typography>
                            <IconButton size="small" onClick={() => handleSelectBank(p.id, forcedAssignments[p.id])}>
                              <Close sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">Auto-assign</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow key={`${p.id}-expand`} sx={{ '& > td': { py: 0 } }}>
                      <TableCell colSpan={6} sx={{ p: 0 }}>
                        <Collapse in={isExpanded}>
                          <EligibleBankList
                            banks={eligible}
                            selectedBankId={forcedAssignments[p.id]}
                            onSelect={(bankId) => handleSelectBank(p.id, bankId)}
                            hideCapacity={hideCapacity}
                          />
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        </>
      )}

      {/* Optimization results */}
      {results && (
        <>
          {committed && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Allocations committed successfully!
            </Alert>
          )}
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8f9fb' }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, width: 40 }}></TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Project</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Country</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Instrument Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Recommended Bank</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Bank Rating</TableCell>
                  {!hideCapacity && <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Bank Available</TableCell>}
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Score</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }} align="center">Accept</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map(r => {
                  const bank = getBankDetails(r.recommendedBankId);
                  const countryCode = getProjectCountryCode(r.projectId);
                  const countryName = getProjectCountryName(r.projectId);
                  const capacity = getProjectCapacity(r.projectId);
                  const eligible = eligibleBanksByProject[r.projectId] || [];
                  const isExpanded = expandedRows[r.projectId] || false;
                  return (
                    <>
                      <TableRow key={r.projectId} sx={{
                        ...(r.forced ? { bgcolor: '#f0f7ff' } : {}),
                        '& > td': { borderBottom: isExpanded ? 'none' : undefined },
                      }}>
                        <TableCell sx={{ py: 0.5 }}>
                          {!committed && (
                            <IconButton size="small" onClick={() => toggleExpand(r.projectId)}>
                              {isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                            </IconButton>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>{r.projectName}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography sx={{ fontSize: 16, lineHeight: 1 }}>{countryCodeToFlag(countryCode)}</Typography>
                            <Typography variant="body2">{countryName}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>${capacity.toLocaleString()}M</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {r.forced && <Lock sx={{ fontSize: 14, color: '#6366f1' }} />}
                            <Typography variant="body2" fontWeight={r.forced ? 700 : 400}>
                              {r.recommendedBankName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {bank?.creditRating ? (() => {
                            const rc = getRatingColor(bank.creditRating);
                            return <Chip label={bank.creditRating} size="small" sx={{ fontSize: 11, height: 20, bgcolor: rc.bg, color: rc.text, fontWeight: 600 }} />;
                          })() : '—'}
                        </TableCell>
                        {!hideCapacity && (
                          <TableCell>
                            {bank ? `$${(bank.totalCapacity - bank.usedCapacity).toLocaleString()}M` : '—'}
                          </TableCell>
                        )}
                        <TableCell>
                          {r.forced ? (
                            <Chip label="Selected" size="small" color="primary" variant="outlined" sx={{ fontSize: 11 }} />
                          ) : r.score > 0 ? (
                            <Typography fontWeight={600} color="success.main">
                              {(r.score * 100).toFixed(0)}
                            </Typography>
                          ) : (
                            <Typography color="error.main">—</Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {r.recommendedBankId && !committed && (
                            <IconButton
                              size="small"
                              onClick={() => toggleAccept(r.projectId)}
                              color={r.accepted ? 'success' : 'default'}
                            >
                              {r.accepted ? <Check /> : <Close />}
                            </IconButton>
                          )}
                          {!r.recommendedBankId && (
                            <Chip label="No Match" size="small" color="error" sx={{ fontSize: 10 }} />
                          )}
                        </TableCell>
                      </TableRow>
                      {!committed && (
                        <TableRow key={`${r.projectId}-expand`} sx={{ '& > td': { py: 0 } }}>
                          <TableCell colSpan={hideCapacity ? 8 : 9} sx={{ p: 0 }}>
                            <Collapse in={isExpanded}>
                              <EligibleBankList
                                banks={eligible}
                                selectedBankId={forcedAssignments[r.projectId]}
                                onSelect={(bankId) => handleSelectBank(r.projectId, bankId)}
                                hideCapacity={hideCapacity}
                              />
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {!committed && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" onClick={() => { setResults(null); setForcedAssignments({}); setExpandedRows({}); }}>
                  Reset
                </Button>
                {Object.keys(forcedAssignments).length > 0 && (
                  <Button variant="outlined" startIcon={<Refresh />} onClick={handleOptimize}>
                    Re-optimize with Selections
                  </Button>
                )}
              </Box>
              <Button
                variant="contained"
                onClick={handleCommit}
                disabled={!results.some(r => r.accepted && r.recommendedBankId)}
              >
                Commit Accepted Allocations
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
