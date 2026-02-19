import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Chip, Button, LinearProgress,
  Divider, Avatar, Snackbar, Alert, Collapse, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TableSortLabel,
  ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import {
  ArrowBack, CheckCircle, Cancel, TrendingUp, AccountBalance,
  Speed, Star, Check, ExpandMore, ExpandLess, ViewModule, ViewList,
} from '@mui/icons-material';
import Navbar from '../common/Navbar';
import { useApi } from '../../hooks/useApi';
import { useSettings } from '../../hooks/useSettings';
import { banksApi, projectsApi, settingsApi, countriesApi } from '../../services/api';
import { Bank, Project, Settings, CountryInfo, RankedBank } from '../../types';
import { rankBanksForProject } from '../../utils/ranking';
import { getRatingColor, countryCodeToFlag, getCapacityHealth } from '../../utils/creditRating';

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Box sx={{ mb: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={500}>{label}</Typography>
        <Typography variant="caption" fontWeight={700} sx={{ color }}>{(value * 100).toFixed(0)}%</Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={Math.min(value * 100, 100)}
        sx={{
          height: 6, borderRadius: 3, bgcolor: '#f0f0f0',
          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 },
        }}
      />
    </Box>
  );
}

function getStrengths(bank: RankedBank, project: Project): string[] {
  const strengths: string[] = [];
  const available = bank.totalCapacity - bank.usedCapacity;
  const headroom = available - project.capacityNeeded;

  if (headroom > project.capacityNeeded * 2) {
    strengths.push('Large capacity headroom');
  } else if (headroom > 0) {
    strengths.push('Sufficient capacity');
  }

  if (bank.averagePrice !== undefined) {
    if (bank.averagePrice <= 30) strengths.push(`Very competitive pricing (${bank.averagePrice} bps)`);
    else if (bank.averagePrice <= 60) strengths.push(`Reasonable pricing (${bank.averagePrice} bps)`);
  }

  if (bank.creditRating) {
    const topRatings = ['AAA', 'AA+', 'AA', 'Aa1', 'Aa2'];
    const goodRatings = ['AA-', 'A+', 'A', 'Aa3', 'A1', 'A2'];
    if (topRatings.includes(bank.creditRating)) strengths.push(`Top-tier credit rating (${bank.creditRating})`);
    else if (goodRatings.includes(bank.creditRating)) strengths.push(`Strong credit rating (${bank.creditRating})`);
  }

  if (bank.isLocalBank) {
    strengths.push('Local bank — dedicated presence in project country');
  }

  const utilization = bank.totalCapacity > 0 ? bank.usedCapacity / bank.totalCapacity : 0;
  if (utilization < 0.3) strengths.push('Low utilization — plenty of room');

  return strengths;
}

function BankCard({ bank, project, rank, isBest, isSelected, onSelect, hideCapacity }: {
  bank: RankedBank; project: Project; rank: number; isBest: boolean;
  isSelected: boolean; onSelect: (bankId: string) => void; hideCapacity?: boolean;
}) {
  const strengths = getStrengths(bank, project);
  const available = bank.totalCapacity - bank.usedCapacity;
  const health = getCapacityHealth(available, bank.totalCapacity);
  const BRAND = '#00875A';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3, borderRadius: 2.5, position: 'relative', overflow: 'hidden',
        border: '2px solid',
        borderColor: isSelected ? '#16a34a' : isBest ? '#3ec9a7' : 'divider',
        boxShadow: isSelected ? '0 4px 20px rgba(22,163,74,0.2)' : isBest ? '0 4px 20px rgba(62,201,167,0.15)' : '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.2s, transform 0.2s',
        '&:hover': { boxShadow: '0 6px 24px rgba(0,0,0,0.08)', transform: 'translateY(-1px)' },
      }}
    >
      {(isBest || isSelected) && (
        <Box sx={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: isSelected ? 'linear-gradient(90deg, #16a34a, #15803d)' : 'linear-gradient(90deg, #3ec9a7, #2aaa8a)',
        }} />
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Avatar sx={{
            bgcolor: isSelected ? '#16a34a' : isBest ? '#3ec9a7' : BRAND, width: 44, height: 44,
            fontSize: 18, fontWeight: 700,
          }}>
            {isSelected ? <Check /> : `#${rank}`}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: '#1a1a2e', lineHeight: 1.2 }}>
              {bank.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
              {bank.creditRating && (() => {
                const rc = getRatingColor(bank.creditRating);
                return <Chip label={bank.creditRating} size="small" sx={{ fontWeight: 600, fontSize: 11, height: 22, bgcolor: rc.bg, color: rc.text }} />;
              })()}
              {isSelected && (
                <Chip label="Selected" size="small" color="success" sx={{ fontWeight: 600, fontSize: 11, height: 22 }} />
              )}
              {isBest && !isSelected && (
                <Chip label="Best Match" size="small" color="success" sx={{ fontWeight: 600, fontSize: 11, height: 22 }} />
              )}
            </Box>
          </Box>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>Overall Score</Typography>
          <Typography variant="h5" fontWeight={800} sx={{ color: isSelected ? '#16a34a' : isBest ? '#2aaa8a' : '#374151' }}>
            {(bank.score * 100).toFixed(0)}
          </Typography>
        </Box>
      </Box>

      {/* Key stats */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 4 }}>
          <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#f8f9fb', borderRadius: 1.5 }}>
            <AccountBalance sx={{ fontSize: 18, color: '#6b7280', mb: 0.3 }} />
            <Typography variant="caption" display="block" color="text.secondary">Available</Typography>
            {hideCapacity ? (
              <Chip label={health.label} size="small" sx={{ bgcolor: health.bg, color: health.color, fontWeight: 700, fontSize: 11 }} />
            ) : (
              <Typography variant="body2" fontWeight={700}>${available.toLocaleString()}M</Typography>
            )}
          </Box>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#f8f9fb', borderRadius: 1.5 }}>
            <Speed sx={{ fontSize: 18, color: '#6b7280', mb: 0.3 }} />
            <Typography variant="caption" display="block" color="text.secondary">Price</Typography>
            <Typography variant="body2" fontWeight={700}>{bank.averagePrice ?? '—'} bps</Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#f8f9fb', borderRadius: 1.5 }}>
            <TrendingUp sx={{ fontSize: 18, color: '#6b7280', mb: 0.3 }} />
            <Typography variant="caption" display="block" color="text.secondary">Max Tenor</Typography>
            <Typography variant="body2" fontWeight={700}>{bank.maxTenor ?? '—'} yrs</Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Score breakdown — hidden in confidential mode */}
      {!hideCapacity && (
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="caption" fontWeight={700} sx={{ color: '#374151', mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Score Breakdown
          </Typography>
          <ScoreBar label="Capacity Headroom" value={bank.capacityScore} color={BRAND} />
          <ScoreBar label="Price Competitiveness" value={bank.priceScore} color="#00A3A1" />
          <ScoreBar label="Credit Rating" value={bank.ratingScore} color="#7AB648" />
        </Box>
      )}

      <Divider sx={{ mb: 2 }} />

      {/* Strengths only */}
      <Box>
        <Typography variant="caption" fontWeight={700} sx={{ color: '#16a34a', mb: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Strengths
        </Typography>
        {strengths.length > 0 ? strengths.map((s, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 0.8, mb: 0.6, alignItems: 'flex-start' }}>
            <CheckCircle sx={{ fontSize: 14, color: '#16a34a', mt: 0.3, flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: '#374151', lineHeight: 1.4 }}>{s}</Typography>
          </Box>
        )) : (
          <Typography variant="caption" color="text.secondary">No notable strengths</Typography>
        )}
      </Box>

      {/* Select button */}
      {project.status === 'Planned' && (
        <>
          <Divider sx={{ my: 2 }} />
          <Button
            fullWidth
            variant={isSelected ? 'contained' : 'outlined'}
            color={isSelected ? 'success' : 'primary'}
            startIcon={isSelected ? <Check /> : undefined}
            onClick={() => onSelect(bank.id)}
            sx={{ textTransform: 'none', fontWeight: 600, py: 1 }}
          >
            {isSelected ? 'Selected' : 'Select This Bank'}
          </Button>
        </>
      )}
    </Paper>
  );
}

function IneligibleBank({ bank }: { bank: RankedBank }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider',
        opacity: 0.6, bgcolor: '#fafafa',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Cancel sx={{ color: '#dc2626', fontSize: 20 }} />
          <Typography variant="body2" fontWeight={600} sx={{ color: '#374151' }}>{bank.name}</Typography>
          {bank.creditRating && (() => {
            const rc = getRatingColor(bank.creditRating);
            return <Chip label={bank.creditRating} size="small" sx={{ fontSize: 11, height: 20, bgcolor: rc.bg, color: rc.text }} />;
          })()}
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {bank.disqualifyReasons.map((reason, i) => (
            <Chip key={i} label={reason} size="small" color="error" variant="outlined" sx={{ fontSize: 10, height: 20 }} />
          ))}
        </Box>
      </Box>
    </Paper>
  );
}

type EligibleSortField = 'rank' | 'name' | 'score' | 'price' | 'tenor' | 'rating';
type SortDir = 'asc' | 'desc';

function EligibleListView({ eligible, project, onSelect, hideCapacity, sortField, sortDir, onSort }: {
  eligible: RankedBank[]; project: Project; onSelect: (bankId: string) => void;
  hideCapacity?: boolean; sortField: EligibleSortField; sortDir: SortDir;
  onSort: (field: EligibleSortField) => void;
}) {
  const sorted = [...eligible].sort((a, b) => {
    let cmp = 0;
    const aAvail = a.totalCapacity - a.usedCapacity;
    const bAvail = b.totalCapacity - b.usedCapacity;
    switch (sortField) {
      case 'rank': cmp = a.score - b.score; break; // higher score = lower rank number
      case 'name': cmp = a.name.localeCompare(b.name); break;
      case 'score': cmp = a.score - b.score; break;
      case 'price': cmp = (a.averagePrice ?? 999) - (b.averagePrice ?? 999); break;
      case 'tenor': cmp = (a.maxTenor ?? 0) - (b.maxTenor ?? 0); break;
      case 'rating': cmp = a.ratingScore - b.ratingScore; break;
    }
    // For rank and score, default descending (highest first)
    if (sortField === 'rank' || sortField === 'score') {
      return sortDir === 'asc' ? cmp : -cmp;
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: '#f8f9fb' }}>
            <TableCell sx={{ fontWeight: 600, width: 50 }}>
              <TableSortLabel active={sortField === 'rank'} direction={sortField === 'rank' ? sortDir : 'desc'} onClick={() => onSort('rank')}>
                #
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ fontWeight: 600 }}>
              <TableSortLabel active={sortField === 'name'} direction={sortField === 'name' ? sortDir : 'asc'} onClick={() => onSort('name')}>
                Bank
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ fontWeight: 600 }}>
              <TableSortLabel active={sortField === 'rating'} direction={sortField === 'rating' ? sortDir : 'desc'} onClick={() => onSort('rating')}>
                Rating
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ fontWeight: 600 }}>
              <TableSortLabel active={sortField === 'score'} direction={sortField === 'score' ? sortDir : 'desc'} onClick={() => onSort('score')}>
                Score
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ fontWeight: 600 }}>
              <TableSortLabel active={sortField === 'price'} direction={sortField === 'price' ? sortDir : 'asc'} onClick={() => onSort('price')}>
                Price (bps)
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ fontWeight: 600 }}>
              <TableSortLabel active={sortField === 'tenor'} direction={sortField === 'tenor' ? sortDir : 'desc'} onClick={() => onSort('tenor')}>
                Max Tenor
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Available</TableCell>
            {project.status === 'Planned' && <TableCell sx={{ fontWeight: 600 }} align="right">Action</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {sorted.map((bank, i) => {
            const available = bank.totalCapacity - bank.usedCapacity;
            const health = getCapacityHealth(available, bank.totalCapacity);
            const rc = getRatingColor(bank.creditRating);
            const isSelected = project.allocatedBankId === bank.id;
            const originalRank = eligible.indexOf(bank) + 1;
            return (
              <TableRow
                key={bank.id}
                hover
                sx={{
                  bgcolor: isSelected ? 'rgba(22,163,74,0.06)' : undefined,
                  '&:hover': { bgcolor: isSelected ? 'rgba(22,163,74,0.1)' : undefined },
                }}
              >
                <TableCell>
                  <Avatar sx={{
                    width: 28, height: 28, fontSize: 13, fontWeight: 700,
                    bgcolor: isSelected ? '#16a34a' : originalRank === 1 ? '#3ec9a7' : '#e5e7eb',
                    color: isSelected || originalRank === 1 ? 'white' : '#374151',
                  }}>
                    {isSelected ? <Check sx={{ fontSize: 16 }} /> : originalRank}
                  </Avatar>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" fontWeight={600}>{bank.name}</Typography>
                    {isSelected && <Chip label="Selected" size="small" color="success" sx={{ fontWeight: 600, fontSize: 10, height: 20 }} />}
                    {originalRank === 1 && !isSelected && <Chip label="Best" size="small" color="success" variant="outlined" sx={{ fontWeight: 600, fontSize: 10, height: 20 }} />}
                  </Box>
                </TableCell>
                <TableCell>
                  {bank.creditRating && (
                    <Chip label={bank.creditRating} size="small" sx={{ fontWeight: 600, fontSize: 11, height: 22, bgcolor: rc.bg, color: rc.text }} />
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={700} sx={{ color: originalRank === 1 ? '#2aaa8a' : '#374151' }}>
                    {(bank.score * 100).toFixed(0)}
                  </Typography>
                </TableCell>
                <TableCell>{bank.averagePrice ?? '—'}</TableCell>
                <TableCell>{bank.maxTenor ? `${bank.maxTenor} yrs` : '—'}</TableCell>
                <TableCell>
                  {hideCapacity ? (
                    <Chip label={health.label} size="small" sx={{ bgcolor: health.bg, color: health.color, fontWeight: 600, fontSize: 11 }} />
                  ) : (
                    <Typography variant="body2" fontWeight={600} sx={{ color: available > 0 ? 'success.main' : 'error.main' }}>
                      ${available.toLocaleString()}M
                    </Typography>
                  )}
                </TableCell>
                {project.status === 'Planned' && (
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant={isSelected ? 'contained' : 'outlined'}
                      color={isSelected ? 'success' : 'primary'}
                      startIcon={isSelected ? <Check /> : undefined}
                      onClick={() => onSelect(bank.id)}
                      sx={{ textTransform: 'none', fontWeight: 600, fontSize: 12 }}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default function ProjectRecommendations() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: projects, refresh } = useApi<Project[]>(() => projectsApi.getAll());
  const { data: banks } = useApi<Bank[]>(() => banksApi.getAll());
  const { data: settings } = useApi<Settings>(() => settingsApi.get());
  const { data: countries } = useApi<CountryInfo[]>(() => countriesApi.getAll());
  const { hideCapacity } = useSettings();
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [listSortField, setListSortField] = useState<EligibleSortField>('rank');
  const [listSortDir, setListSortDir] = useState<SortDir>('desc');
  const [ineligibleOpen, setIneligibleOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  const project = projects?.find(p => p.id === id);
  const countryName = countries?.find(c => c.code === project?.country)?.name || project?.country || '';

  const ranked = useMemo(() => {
    if (!banks || !project || !settings) return [];
    return rankBanksForProject(banks, project, settings.weights);
  }, [banks, project, settings]);

  const eligible = ranked.filter(b => b.eligible);
  const ineligible = ranked.filter(b => !b.eligible);

  const handleListSort = (field: EligibleSortField) => {
    if (listSortField === field) {
      setListSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setListSortField(field);
      setListSortDir(field === 'name' || field === 'price' ? 'asc' : 'desc');
    }
  };

  const handleSelectBank = async (bankId: string) => {
    if (!project) return;
    setSaving(true);
    try {
      await projectsApi.update(project.id, { allocatedBankId: bankId });
      const bankName = banks?.find(b => b.id === bankId)?.name || 'Bank';
      setSnackbar({ open: true, message: `${bankName} allocated to ${project.name}`, severity: 'success' });
      refresh();
    } catch {
      setSnackbar({ open: true, message: 'Failed to allocate bank', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (!project || !banks || !settings) {
    return (
      <Box>
        <Navbar title="Recommendations" />
        <Box sx={{ mt: 8, p: 3, textAlign: 'center' }}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography color="text.secondary">Loading project data...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Navbar
        title="Bank Recommendations"
        actions={
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/projects')} size="small">
            Back to Projects
          </Button>
        }
      />
      <Box sx={{ mt: 8, p: 3 }}>
        {/* Project summary header */}
        <Paper
          elevation={0}
          sx={{
            p: 3, mb: 3, borderRadius: 2.5, border: '1px solid', borderColor: 'divider',
            background: 'linear-gradient(135deg, #f8f9fb 0%, #eef1f6 100%)',
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption" fontWeight={600} sx={{ color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Project
              </Typography>
              <Typography variant="h4" fontWeight={800} sx={{ color: '#1a1a2e', mt: 0.5 }}>
                {project.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <span>{project.country ? countryCodeToFlag(project.country) : ''}</span>
                      <span>{countryName}</span>
                    </Box>
                  }
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
                <Chip
                  label={project.status}
                  size="small"
                  color={project.status === 'Issued' ? 'success' : 'warning'}
                  sx={{ fontWeight: 600 }}
                />
                {(project.projectType || []).map(t => (
                  <Chip key={t} label={t} size="small" variant="outlined" />
                ))}
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 4 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>Instrument Amount</Typography>
                    <Typography variant="h5" fontWeight={700} sx={{ color: '#1a1a2e' }}>
                      {hideCapacity ? '—' : `$${project.capacityNeeded.toLocaleString()}M`}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>Tenor Required</Typography>
                    <Typography variant="h5" fontWeight={700} sx={{ color: '#1a1a2e' }}>
                      {project.tenorRequired ? `${project.tenorRequired} yrs` : '—'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>Min Rating</Typography>
                    <Typography variant="h5" fontWeight={700} sx={{ color: '#1a1a2e' }}>
                      {project.minimumCreditRating || '—'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>

        {/* Results summary with view toggle */}
        <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Star sx={{ color: '#f59e0b' }} />
            <Typography variant="h6" fontWeight={700} sx={{ color: '#1a1a2e' }}>
              {eligible.length} Eligible Bank{eligible.length !== 1 ? 's' : ''}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              out of {ranked.length} total
            </Typography>
          </Box>
          {eligible.length > 0 && (
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, v) => v && setViewMode(v)}
              size="small"
            >
              <ToggleButton value="cards" sx={{ textTransform: 'none', px: 1.5 }}>
                <ViewModule sx={{ fontSize: 18, mr: 0.5 }} /> Cards
              </ToggleButton>
              <ToggleButton value="list" sx={{ textTransform: 'none', px: 1.5 }}>
                <ViewList sx={{ fontSize: 18, mr: 0.5 }} /> List
              </ToggleButton>
            </ToggleButtonGroup>
          )}
        </Box>

        {/* Eligible banks */}
        {eligible.length === 0 ? (
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Cancel sx={{ fontSize: 48, color: '#dc2626', mb: 1 }} />
            <Typography variant="h6" color="text.secondary">No eligible banks found</Typography>
            <Typography variant="body2" color="text.secondary">
              No banks meet all the hard requirements for this project. Consider adjusting project constraints.
            </Typography>
          </Paper>
        ) : viewMode === 'list' ? (
          <Box sx={{ mb: 4 }}>
            <EligibleListView
              eligible={eligible}
              project={project}
              onSelect={handleSelectBank}
              hideCapacity={hideCapacity}
              sortField={listSortField}
              sortDir={listSortDir}
              onSort={handleListSort}
            />
          </Box>
        ) : (
          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            {eligible.map((bank, i) => (
              <Grid key={bank.id} size={{ xs: 12, md: 6 }}>
                <BankCard
                  bank={bank}
                  project={project}
                  rank={i + 1}
                  isBest={i === 0}
                  isSelected={project.allocatedBankId === bank.id}
                  onSelect={handleSelectBank}
                  hideCapacity={hideCapacity}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Ineligible banks — collapsible */}
        {ineligible.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Button
              onClick={() => setIneligibleOpen(o => !o)}
              endIcon={ineligibleOpen ? <ExpandLess /> : <ExpandMore />}
              sx={{
                textTransform: 'none', fontWeight: 700, color: '#6b7280', mb: 1,
                '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
              }}
            >
              Ineligible Banks ({ineligible.length})
            </Button>
            <Collapse in={ineligibleOpen}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {ineligible.map(bank => (
                  <IneligibleBank key={bank.id} bank={bank} />
                ))}
              </Box>
            </Collapse>
          </Box>
        )}
      </Box>

      {saving && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2000 }}>
          <LinearProgress />
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
