import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Typography, Paper, IconButton, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, LinearProgress, Tabs, Tab, Grid, TextField,
  Divider, ToggleButtonGroup, ToggleButton, Table, TableHead, TableBody,
  TableRow, TableCell, TableContainer, TableSortLabel, FormControl,
  InputLabel, Select, MenuItem,
} from '@mui/material';
import {
  Add, Edit, Delete, Visibility, AccountBalance,
  CalendarMonth, TrendingUp, ViewModule, TableChart,
  FileDownload, Search,
} from '@mui/icons-material';
import Navbar from '../common/Navbar';
import ProjectForm from './ProjectForm';
import ProjectOptimizer from './ProjectOptimizer';
import { useApi } from '../../hooks/useApi';
import { useSettings } from '../../hooks/useSettings';
import { projectsApi, banksApi, settingsApi, countriesApi } from '../../services/api-adapter';
import { Project, ProjectInput, Bank, Settings, CountryInfo } from '../../types';
import { countryCodeToFlag, getRatingColor } from '../../utils/creditRating';
import * as XLSX from 'xlsx';

function ProjectCard({ project, banks, countries, onEdit, onDelete, onViewRecs, onIssue, hideCapacity }: {
  project: Project;
  banks: Bank[];
  countries: CountryInfo[];
  onEdit: () => void;
  onDelete: () => void;
  onViewRecs: () => void;
  onIssue: () => void;
  hideCapacity: boolean;
}) {
  const countryName = countries.find(c => c.code === project.country)?.name || project.country;
  const allocatedBank = project.allocatedBankId ? banks.find(b => b.id === project.allocatedBankId) : null;
  const isPlanned = project.status === 'Planned';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: '#1a1a2e', lineHeight: 1.3 }}>
            {project.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <Typography sx={{ fontSize: 16, lineHeight: 1 }}>{countryCodeToFlag(project.country)}</Typography>
              <Typography variant="body2" color="text.secondary">{countryName}</Typography>
            </Box>
            <Chip
              label={project.status}
              size="small"
              color={project.status === 'Issued' ? 'success' : 'warning'}
              sx={{ fontWeight: 600, height: 22, fontSize: 11 }}
            />
            {(project.projectType || []).map(t => (
              <Chip key={t} label={t} size="small" variant="outlined" color="warning" sx={{ height: 22, fontSize: 11 }} />
            ))}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
          <Button size="small" variant="text" startIcon={<Visibility fontSize="small" />}
            onClick={onViewRecs} sx={{ minWidth: 0, textTransform: 'none', fontSize: 12 }}>
            Banks
          </Button>
          {isPlanned && (
            <Button size="small" variant="text" startIcon={<Edit fontSize="small" />}
              onClick={onEdit} sx={{ minWidth: 0, textTransform: 'none', fontSize: 12 }}>
              Edit
            </Button>
          )}
          <IconButton size="small" color="error" onClick={onDelete} title="Delete">
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Project stats row */}
      <Grid container spacing={1.5} sx={{ mb: allocatedBank ? 1.5 : 0 }}>
        <Grid size={{ xs: 4 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TrendingUp sx={{ fontSize: 16, color: '#00A3A1' }} />
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>Instrument Amount</Typography>
              <Typography variant="body2" fontWeight={700}>${project.capacityNeeded.toLocaleString()}M</Typography>
            </Box>
          </Box>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <CalendarMonth sx={{ fontSize: 16, color: '#6b7280' }} />
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>Tenor</Typography>
              <Typography variant="body2" fontWeight={700}>{project.tenorRequired ? `${project.tenorRequired} yrs` : '—'}</Typography>
            </Box>
          </Box>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <AccountBalance sx={{ fontSize: 16, color: '#6b7280' }} />
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>Min Rating</Typography>
              <Typography variant="body2" fontWeight={700}>{project.minimumCreditRating || '—'}</Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Allocated bank details */}
      {allocatedBank && (
        <>
          <Divider sx={{ my: 1.5 }} />
          <Box sx={{ bgcolor: '#f0faf7', borderRadius: 1.5, p: 1.5 }}>
            <Typography variant="caption" fontWeight={600} sx={{ color: '#16a34a', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5, display: 'block' }}>
              Allocated Bank
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" fontWeight={700} sx={{ color: '#1a1a2e' }}>{allocatedBank.name}</Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 0.3 }}>
                  {allocatedBank.creditRating && (
                    <Typography variant="caption" color="text.secondary">
                      Rating: <strong>{allocatedBank.creditRating}</strong>
                    </Typography>
                  )}
                  {!hideCapacity && (
                    <Typography variant="caption" color="text.secondary">
                      Available: <strong>${(allocatedBank.totalCapacity - allocatedBank.usedCapacity).toLocaleString()}M</strong>
                    </Typography>
                  )}
                  {allocatedBank.averagePrice !== undefined && (
                    <Typography variant="caption" color="text.secondary">
                      Price: <strong>{allocatedBank.averagePrice} bps</strong>
                    </Typography>
                  )}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {isPlanned && (
                  <>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={onViewRecs}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      Review Banks
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={onIssue}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      Mark as Issued
                    </Button>
                  </>
                )}
              </Box>
            </Box>
            {project.issuanceDate && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Issued: {new Date(project.issuanceDate).toLocaleDateString()}
              </Typography>
            )}
          </Box>
        </>
      )}

      {/* No bank allocated yet — show CTA */}
      {!allocatedBank && isPlanned && (
        <>
          <Divider sx={{ my: 1.5 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">No bank allocated yet</Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={onViewRecs}
              sx={{ textTransform: 'none' }}
            >
              Find Best Bank
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );
}

type ProjectSortField = 'name' | 'country' | 'status' | 'capacityNeeded' | 'tenorRequired' | 'allocatedBank';
type SortDir = 'asc' | 'desc';

function ProjectTable({ projects, banks, countries, hideCapacity, onEdit, onDelete, onViewRecs, onIssue }: {
  projects: Project[];
  banks: Bank[];
  countries: CountryInfo[];
  hideCapacity: boolean;
  onEdit: (p: Project) => void;
  onDelete: (id: string) => void;
  onViewRecs: (id: string) => void;
  onIssue: (p: Project) => void;
}) {
  const [sortField, setSortField] = useState<ProjectSortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (field: ProjectSortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sorted = [...projects].sort((a, b) => {
    let cmp = 0;
    switch (sortField) {
      case 'name': cmp = a.name.localeCompare(b.name); break;
      case 'country': {
        const aName = countries.find(c => c.code === a.country)?.name || a.country;
        const bName = countries.find(c => c.code === b.country)?.name || b.country;
        cmp = aName.localeCompare(bName); break;
      }
      case 'status': cmp = a.status.localeCompare(b.status); break;
      case 'capacityNeeded': cmp = a.capacityNeeded - b.capacityNeeded; break;
      case 'tenorRequired': cmp = (a.tenorRequired || 0) - (b.tenorRequired || 0); break;
      case 'allocatedBank': {
        const aBank = a.allocatedBankId ? banks.find(bn => bn.id === a.allocatedBankId)?.name || '' : '';
        const bBank = b.allocatedBankId ? banks.find(bn => bn.id === b.allocatedBankId)?.name || '' : '';
        cmp = aBank.localeCompare(bBank); break;
      }
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const cols: { field: ProjectSortField; label: string }[] = [
    { field: 'name', label: 'Project' },
    { field: 'country', label: 'Country' },
    { field: 'status', label: 'Status' },
    { field: 'capacityNeeded', label: 'Instrument Amount' },
    { field: 'tenorRequired', label: 'Tenor' },
  ];

  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: '#f8f9fb' }}>
            {cols.map(col => (
              <TableCell key={col.field} sx={{ fontWeight: 700, fontSize: 12 }}>
                <TableSortLabel
                  active={sortField === col.field}
                  direction={sortField === col.field ? sortDir : 'asc'}
                  onClick={() => handleSort(col.field)}
                >
                  {col.label}
                </TableSortLabel>
              </TableCell>
            ))}
            <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Min Rating</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
              <TableSortLabel
                active={sortField === 'allocatedBank'}
                direction={sortField === 'allocatedBank' ? sortDir : 'asc'}
                onClick={() => handleSort('allocatedBank')}
              >
                Allocated Bank
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: 12 }} align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sorted.map(project => {
            const countryName = countries.find(c => c.code === project.country)?.name || project.country;
            const allocatedBank = project.allocatedBankId ? banks.find(b => b.id === project.allocatedBankId) : null;
            const isPlanned = project.status === 'Planned';
            return (
              <TableRow key={project.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>{project.name}</Typography>
                  {(project.projectType || []).length > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.3 }}>
                      {project.projectType!.map(t => (
                        <Chip key={t} label={t} size="small" variant="outlined" color="warning" sx={{ height: 18, fontSize: 10 }} />
                      ))}
                    </Box>
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography sx={{ fontSize: 16, lineHeight: 1 }}>{countryCodeToFlag(project.country)}</Typography>
                    <Typography variant="body2">{countryName}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={project.status}
                    size="small"
                    color={project.status === 'Issued' ? 'success' : 'warning'}
                    sx={{ fontWeight: 600, height: 22, fontSize: 11 }}
                  />
                </TableCell>
                <TableCell>${project.capacityNeeded.toLocaleString()}M</TableCell>
                <TableCell>{project.tenorRequired ? `${project.tenorRequired} yrs` : '—'}</TableCell>
                <TableCell>{project.minimumCreditRating || '—'}</TableCell>
                <TableCell>
                  {allocatedBank ? (
                    <Typography variant="body2" fontWeight={600}>{allocatedBank.name}</Typography>
                  ) : (
                    <Typography variant="caption" color="text.secondary">—</Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                    <Button
                      size="small"
                      variant="text"
                      startIcon={<Visibility fontSize="small" />}
                      onClick={() => onViewRecs(project.id)}
                      sx={{ minWidth: 0, textTransform: 'none', fontSize: 12 }}
                    >
                      Banks
                    </Button>
                    {isPlanned && (
                      <Button
                        size="small"
                        variant="text"
                        startIcon={<Edit fontSize="small" />}
                        onClick={() => onEdit(project)}
                        sx={{ minWidth: 0, textTransform: 'none', fontSize: 12 }}
                      >
                        Edit
                      </Button>
                    )}
                    <IconButton size="small" color="error" onClick={() => onDelete(project.id)} title="Delete">
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default function ProjectsPage() {
  const { data: projects, loading, refresh } = useApi<Project[]>(() => projectsApi.getAll());
  const { data: banks } = useApi<Bank[]>(() => banksApi.getAll());
  const { data: settings } = useApi<Settings>(() => settingsApi.get());
  const { data: countries } = useApi<CountryInfo[]>(() => countriesApi.getAll());
  const { hideCapacity } = useSettings();
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [issueDialog, setIssueDialog] = useState<Project | null>(null);
  const [issuanceDate, setIssuanceDate] = useState('');
  const [tab, setTab] = useState(0);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | 'Planned' | 'Issued'>('');
  const [countryFilter, setCountryFilter] = useState('');

  const handleSave = async (data: ProjectInput) => {
    if (editProject) {
      await projectsApi.update(editProject.id, data);
    } else {
      await projectsApi.create(data);
    }
    setFormOpen(false);
    setEditProject(null);
    refresh();
  };

  const handleDelete = async (id: string) => {
    await projectsApi.delete(id);
    setDeleteConfirm(null);
    refresh();
  };

  const handleIssueClick = (project: Project) => {
    if (!project.allocatedBankId) return;
    setIssueDialog(project);
    setIssuanceDate(new Date().toISOString().split('T')[0]);
  };

  const handleIssueConfirm = async () => {
    if (!issueDialog || !issuanceDate) return;
    await projectsApi.update(issueDialog.id, {
      status: 'Issued',
      issuanceDate,
    });
    setIssueDialog(null);
    refresh();
  };

  const handleExportExcel = () => {
    if (!projects || !countries) return;
    const rows = projects.map(p => {
      const countryName = countries.find(c => c.code === p.country)?.name || p.country;
      const allocatedBank = p.allocatedBankId ? banks?.find(b => b.id === p.allocatedBankId) : null;
      return {
        'Project Name': p.name,
        'Country': countryName,
        'Status': p.status,
        'Instrument Amount (USD M)': p.capacityNeeded,
        'Tenor (Years)': p.tenorRequired || '',
        'Min Credit Rating': p.minimumCreditRating || '',
        'Project Type': (p.projectType || []).join(', '),
        'Allocated Bank': allocatedBank?.name || '',
        'Issuance Date': p.issuanceDate ? new Date(p.issuanceDate).toLocaleDateString() : '',
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Projects');
    XLSX.writeFile(wb, 'projects-export.xlsx');
  };

  const filtered = (projects || []).filter(p => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || p.status === statusFilter;
    const matchesCountry = !countryFilter || p.country === countryFilter;
    return matchesSearch && matchesStatus && matchesCountry;
  });
  const planned = filtered.filter(p => p.status === 'Planned');
  const issued = filtered.filter(p => p.status === 'Issued');
  const allProjects = [...planned, ...issued];
  const allCountryCodes = Array.from(new Set((projects || []).map(p => p.country))).sort();

  return (
    <Box>
      <Navbar
        title="Projects"
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            {projects && projects.length > 0 && (
              <Button variant="outlined" startIcon={<FileDownload />} onClick={handleExportExcel} size="small">
                Export Excel
              </Button>
            )}
            <Button variant="contained" startIcon={<Add />}
              onClick={() => { setEditProject(null); setFormOpen(true); }}>
              Add Project
            </Button>
          </Box>
        }
      />
      <Box sx={{ mt: 8, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label={`All Projects (${(projects || []).length})`} />
            <Tab label="Multi-Project Optimizer" />
          </Tabs>
          {tab === 0 && (
            <ToggleButtonGroup
              size="small"
              value={viewMode}
              exclusive
              onChange={(_, v) => v && setViewMode(v)}
            >
              <ToggleButton value="cards" title="Card View">
                <ViewModule fontSize="small" />
              </ToggleButton>
              <ToggleButton value="table" title="Table View">
                <TableChart fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          )}
        </Box>

        {tab === 0 && (
          <>
            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                size="small"
                placeholder="Search projects..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                slotProps={{ input: { startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> } }}
                sx={{ minWidth: 250 }}
              />
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={e => setStatusFilter(e.target.value as '' | 'Planned' | 'Issued')}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Planned">Planned</MenuItem>
                  <MenuItem value="Issued">Issued</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Country</InputLabel>
                <Select
                  value={countryFilter}
                  label="Country"
                  onChange={e => setCountryFilter(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  {allCountryCodes.map(code => {
                    const name = countries?.find(c => c.code === code)?.name || code;
                    return <MenuItem key={code} value={code}>{countryCodeToFlag(code)} {name}</MenuItem>;
                  })}
                </Select>
              </FormControl>
            </Box>
            {loading && <LinearProgress sx={{ mb: 2 }} />}

            {viewMode === 'cards' ? (
              <>
                {/* Planned projects — card view */}
                {planned.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#6b7280', mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Planned ({planned.length})
                    </Typography>
                    <Grid container spacing={2}>
                      {planned.map(project => (
                        <Grid key={project.id} size={{ xs: 12, md: 6 }}>
                          <ProjectCard
                            project={project}
                            banks={banks || []}
                            countries={countries || []}
                            onEdit={() => { setEditProject(project); setFormOpen(true); }}
                            onDelete={() => setDeleteConfirm(project.id)}
                            onViewRecs={() => navigate(`/projects/${project.id}/recommendations`)}
                            onIssue={() => handleIssueClick(project)}
                            hideCapacity={hideCapacity}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {/* Issued projects — card view */}
                {issued.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#6b7280', mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Issued ({issued.length})
                    </Typography>
                    <Grid container spacing={2}>
                      {issued.map(project => (
                        <Grid key={project.id} size={{ xs: 12, md: 6 }}>
                          <ProjectCard
                            project={project}
                            banks={banks || []}
                            countries={countries || []}
                            onEdit={() => {}}
                            onDelete={() => setDeleteConfirm(project.id)}
                            onViewRecs={() => navigate(`/projects/${project.id}/recommendations`)}
                            onIssue={() => {}}
                            hideCapacity={hideCapacity}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </>
            ) : (
              /* Table view */
              <ProjectTable
                projects={allProjects}
                banks={banks || []}
                countries={countries || []}
                hideCapacity={hideCapacity}
                onEdit={(p) => { setEditProject(p); setFormOpen(true); }}
                onDelete={(id) => setDeleteConfirm(id)}
                onViewRecs={(id) => navigate(`/projects/${id}/recommendations`)}
                onIssue={handleIssueClick}
              />
            )}

            {(projects || []).length === 0 && !loading && (
              <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography color="text.secondary">
                  No projects yet. Add a project to get started.
                </Typography>
              </Paper>
            )}
          </>
        )}

        {tab === 1 && banks && projects && settings && countries && (
          <ProjectOptimizer
            banks={banks}
            projects={projects}
            settings={settings}
            countries={countries}
            onRefresh={refresh}
          />
        )}
      </Box>

      {/* Project Form */}
      <ProjectForm
        open={formOpen}
        project={editProject}
        onClose={() => { setFormOpen(false); setEditProject(null); }}
        onSave={handleSave}
      />

      {/* Issue Confirmation Dialog */}
      <Dialog open={!!issueDialog} onClose={() => setIssueDialog(null)}>
        <DialogTitle>Mark Project as Issued</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Confirm issuance for <strong>{issueDialog?.name}</strong> with allocated bank{' '}
            <strong>{banks?.find(b => b.id === issueDialog?.allocatedBankId)?.name}</strong>.
          </Typography>
          <TextField
            fullWidth
            label="Issuance Date"
            type="date"
            value={issuanceDate}
            onChange={e => setIssuanceDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIssueDialog(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleIssueConfirm}
            disabled={!issuanceDate}
          >
            Confirm Issuance
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this project?</Typography>
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
