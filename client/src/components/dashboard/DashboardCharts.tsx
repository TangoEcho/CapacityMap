import { useMemo, useRef } from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Bank, Project, CountryInfo } from '../../types';
import ExportButton from '../common/ExportButton';

interface ChartsProps {
  banks: Bank[];
  projects: Project[];
  countries: CountryInfo[];
  hideCapacity?: boolean;
}

const tooltipStyle = {
  contentStyle: {
    background: 'rgba(255,255,255,0.96)',
    border: 'none',
    borderRadius: 8,
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
    fontSize: 13,
    padding: '10px 14px',
  },
};

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <Paper sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }} ref={ref}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#1a1a2e' }}>{title}</Typography>
          {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
        </Box>
        <ExportButton targetRef={ref} filename={title.toLowerCase().replace(/\s+/g, '-')} />
      </Box>
      {children}
    </Paper>
  );
}

export default function DashboardCharts({ banks, projects, countries, hideCapacity }: ChartsProps) {
  const regionData = useMemo(() => {
    const regionMap: Record<string, { used: number; available: number }> = {};

    for (const bank of banks) {
      const bankRegions = new Set<string>();
      for (const code of bank.countries) {
        if (code === 'GLOBAL') {
          bankRegions.add('Global');
        } else {
          const country = countries.find(c => c.code === code);
          if (country) bankRegions.add(country.region);
        }
      }
      for (const region of bankRegions) {
        if (!regionMap[region]) regionMap[region] = { used: 0, available: 0 };
        regionMap[region].used += bank.usedCapacity;
        regionMap[region].available += bank.totalCapacity - bank.usedCapacity;
      }
    }

    return Object.entries(regionMap)
      .map(([name, data]) => ({
        name,
        ...data,
        total: data.used + data.available,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [banks, countries]);

  const utilizationData = useMemo(() => {
    const totalUsed = banks.reduce((s, b) => s + b.usedCapacity, 0);
    const totalAvailable = banks.reduce((s, b) => s + (b.totalCapacity - b.usedCapacity), 0);
    const total = totalUsed + totalAvailable;
    return {
      data: [
        { name: 'Used Capacity', value: totalUsed },
        { name: 'Available', value: totalAvailable },
      ],
      pct: total > 0 ? Math.round((totalUsed / total) * 100) : 0,
      totalUsed,
      totalAvailable,
    };
  }, [banks]);

  const topBanks = useMemo(() => {
    return [...banks]
      .sort((a, b) => (b.totalCapacity - b.usedCapacity) - (a.totalCapacity - a.usedCapacity))
      .slice(0, 8)
      .map(b => ({
        name: b.name,
        used: b.usedCapacity,
        available: b.totalCapacity - b.usedCapacity,
      }));
  }, [banks]);

  if (banks.length === 0) return null;

  const BRAND_DARK = '#005c3d';
  const BRAND_ACCENT = '#3ec9a7';

  return (
    <Grid container spacing={2.5}>
      {/* Capacity by Region — show as utilization bars in confidential mode */}
      <Grid size={{ xs: 12, md: 7 }}>
        <ChartCard title="Capacity by Region" subtitle={hideCapacity ? 'Relative utilization by region' : 'Used vs. available capacity (USD M)'}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={regionData} barCategoryGap="20%">
              <defs>
                <linearGradient id="usedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BRAND_DARK} stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#1a6b4a" stopOpacity={0.85} />
                </linearGradient>
                <linearGradient id="availGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BRAND_ACCENT} stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#2aaa8a" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef0f4" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={hideCapacity ? () => '' : (v: number) => `${(v/1000).toFixed(0)}k`}
              />
              <Tooltip
                {...tooltipStyle}
                formatter={hideCapacity
                  ? (v: number, name: string) => [name === 'used' ? 'Used' : 'Available', '']
                  : (v: number, name: string) => [`$${v.toLocaleString()}M`, name === 'used' ? 'Used' : 'Available']}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => <span style={{ color: '#6b7280', fontSize: 12 }}>{value === 'used' ? 'Used' : 'Available'}</span>}
              />
              <Bar dataKey="used" stackId="a" fill="url(#usedGrad)" name="used" radius={[0, 0, 0, 0]} />
              <Bar dataKey="available" stackId="a" fill="url(#availGrad)" name="available" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </Grid>

      {/* Utilization Donut — always shown */}
      <Grid size={{ xs: 12, md: 5 }}>
        <ChartCard title="Capacity Utilization" subtitle={`${utilizationData.pct}% of total capacity in use`}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <defs>
                <linearGradient id="pieUsed" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={BRAND_DARK} />
                  <stop offset="100%" stopColor="#1a6b4a" />
                </linearGradient>
                <linearGradient id="pieAvail" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={BRAND_ACCENT} />
                  <stop offset="100%" stopColor="#5dd9b8" />
                </linearGradient>
              </defs>
              <Pie
                data={utilizationData.data}
                innerRadius={70}
                outerRadius={105}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
                label={hideCapacity
                  ? ({ name }: { name: string }) => name
                  : ({ name, value }: { name: string; value: number }) => `${name}: $${(value/1000).toFixed(1)}B`}
                labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
              >
                <Cell fill="url(#pieUsed)" />
                <Cell fill="url(#pieAvail)" />
              </Pie>
              {!hideCapacity && <Tooltip {...tooltipStyle} formatter={(v: number) => `$${v.toLocaleString()}M`} />}
              <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 28, fontWeight: 700, fill: BRAND_DARK }}>
                {utilizationData.pct}%
              </text>
              <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 11, fill: '#9ca3af' }}>
                utilized
              </text>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </Grid>

      {/* Top Banks by Capacity — always shown */}
      <Grid size={{ xs: 12, md: 7 }}>
        <ChartCard title="Top Banks by Capacity" subtitle={hideCapacity ? 'Relative capacity across institutions' : 'Largest available capacity across institutions'}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topBanks} layout="vertical" barCategoryGap="18%">
              <defs>
                <linearGradient id="bankUsed" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={BRAND_DARK} stopOpacity={0.85} />
                  <stop offset="100%" stopColor="#1a6b4a" stopOpacity={0.75} />
                </linearGradient>
                <linearGradient id="bankAvail" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={BRAND_ACCENT} stopOpacity={0.85} />
                  <stop offset="100%" stopColor="#5dd9b8" stopOpacity={0.75} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef0f4" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={hideCapacity ? () => '' : (v: number) => `${(v/1000).toFixed(0)}k`}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 11, fill: '#374151', fontWeight: 500 }}
                width={130}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                {...tooltipStyle}
                formatter={hideCapacity
                  ? (v: number, name: string) => [name === 'used' ? 'Used' : 'Available', '']
                  : (v: number, name: string) => [`$${v.toLocaleString()}M`, name === 'used' ? 'Used' : 'Available']}
              />
              <Bar dataKey="used" stackId="a" fill="url(#bankUsed)" name="used" />
              <Bar dataKey="available" stackId="a" fill="url(#bankAvail)" name="available" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </Grid>

      {/* Project Status — always shown */}
      {projects.length > 0 && (
        <Grid size={{ xs: 12, md: 5 }}>
          <ChartCard title="Project Pipeline" subtitle={`${projects.length} total projects`}>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <defs>
                  <linearGradient id="piePlanned" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                  <linearGradient id="pieIssued" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#3ec9a7" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                <Pie
                  data={[
                    { name: 'Planned', value: projects.filter(p => p.status === 'Planned').length },
                    { name: 'Issued', value: projects.filter(p => p.status === 'Issued').length },
                  ]}
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                  label={({ name, value }: { name: string; value: number }) => `${name}: ${value}`}
                  labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                >
                  <Cell fill="url(#piePlanned)" />
                  <Cell fill="url(#pieIssued)" />
                </Pie>
                <Tooltip {...tooltipStyle} />
                <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 28, fontWeight: 700, fill: BRAND_DARK }}>
                  {projects.length}
                </text>
                <text x="50%" y="56%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 11, fill: '#9ca3af' }}>
                  projects
                </text>
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      )}
    </Grid>
  );
}
