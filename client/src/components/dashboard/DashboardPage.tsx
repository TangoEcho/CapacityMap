import { useRef } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Chip } from '@mui/material';
import { AccountBalance, TrendingUp, Assessment, Assignment, PictureAsPdf, Slideshow } from '@mui/icons-material';
import Navbar from '../common/Navbar';
import WorldMap from './WorldMap';
import DashboardCharts from './DashboardCharts';
import { useApi } from '../../hooks/useApi';
import { useSettings } from '../../hooks/useSettings';
import { useExport } from '../../hooks/useExport';
import { banksApi, projectsApi, countriesApi } from '../../services/api';
import { Bank, Project, CountryInfo } from '../../types';
import { getCapacityHealth } from '../../utils/creditRating';

function SummaryCard({ title, value, icon, color, healthChip }: {
  title: string; value: string | number; icon: React.ReactNode; color: string;
  healthChip?: { label: string; bg: string; textColor: string };
}) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2.5 }}>
        <Box sx={{
          bgcolor: color, borderRadius: 2, p: 1.5,
          display: 'flex', color: 'white', flexShrink: 0,
        }}>
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
            {title}
          </Typography>
          {healthChip ? (
            <Chip
              label={healthChip.label}
              size="small"
              sx={{ fontWeight: 700, bgcolor: healthChip.bg, color: healthChip.textColor, mt: 0.3 }}
            />
          ) : (
            <Typography variant="h5" fontWeight={700} noWrap>{value}</Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: banks } = useApi<Bank[]>(() => banksApi.getAll());
  const { data: projects } = useApi<Project[]>(() => projectsApi.getAll());
  const { data: countries } = useApi<CountryInfo[]>(() => countriesApi.getAll());
  const dashboardRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<HTMLDivElement>(null);
  const { exportPdf, exportPptx } = useExport();
  const { hideCapacity } = useSettings();

  const totalBanks = banks?.length ?? 0;
  const totalCapacity = banks?.reduce((sum, b) => sum + b.totalCapacity, 0) ?? 0;
  const availableCapacity = banks?.reduce((sum, b) => sum + (b.totalCapacity - b.usedCapacity), 0) ?? 0;
  const activeProjects = projects?.filter(p => p.status === 'Planned').length ?? 0;
  const health = getCapacityHealth(availableCapacity, totalCapacity);

  const handlePdfExport = async () => {
    if (!dashboardRef.current) return;
    await exportPdf(dashboardRef.current, 'credit-capacity-dashboard');
  };

  const handlePptxExport = async () => {
    const elements: { element: HTMLElement; title: string }[] = [];
    if (chartsRef.current) elements.push({ element: chartsRef.current, title: 'Dashboard Charts' });
    if (mapRef.current) elements.push({ element: mapRef.current, title: 'Global Coverage Map' });
    if (elements.length > 0) {
      await exportPptx(elements, 'credit-capacity-dashboard');
    }
  };

  return (
    <Box>
      <Navbar
        title="Dashboard"
        actions={
          banks && banks.length > 0 ? (
            <>
              <Button variant="outlined" startIcon={<PictureAsPdf />} onClick={handlePdfExport} size="small">
                PDF
              </Button>
              <Button variant="outlined" startIcon={<Slideshow />} onClick={handlePptxExport} size="small">
                PPTX
              </Button>
            </>
          ) : undefined
        }
      />
      <Box sx={{ mt: 8, p: 3 }} ref={dashboardRef}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, md: hideCapacity ? 4 : 3 }}>
            <SummaryCard
              title="Total Banks"
              value={totalBanks}
              icon={<AccountBalance />}
              color="#00875A"
            />
          </Grid>
          {!hideCapacity && (
            <Grid size={{ xs: 6, md: 3 }}>
              <SummaryCard
                title="Total Capacity"
                value={`$${totalCapacity.toLocaleString()}M`}
                icon={<TrendingUp />}
                color="#00A3A1"
              />
            </Grid>
          )}
          <Grid size={{ xs: 6, md: hideCapacity ? 4 : 3 }}>
            <SummaryCard
              title="Available Capacity"
              value={`$${availableCapacity.toLocaleString()}M`}
              icon={<Assessment />}
              color="#7AB648"
              healthChip={hideCapacity ? { label: health.label, bg: health.bg, textColor: health.color } : undefined}
            />
          </Grid>
          <Grid size={{ xs: 6, md: hideCapacity ? 4 : 3 }}>
            <SummaryCard
              title="Active Projects"
              value={activeProjects}
              icon={<Assignment />}
              color="#00875A"
            />
          </Grid>
        </Grid>

        {banks && projects && countries && (
          <Box ref={chartsRef} sx={{ mb: 3 }}>
            <DashboardCharts
              banks={banks}
              projects={projects}
              countries={countries}
              hideCapacity={hideCapacity}
            />
          </Box>
        )}

        {banks && projects && (
          <Box ref={mapRef}>
            <WorldMap banks={banks} projects={projects} />
          </Box>
        )}

        {(!banks || banks.length === 0) && (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
            Add bank data to see dashboard visualizations.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
