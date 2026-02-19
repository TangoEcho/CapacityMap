import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { Box, ToggleButtonGroup, ToggleButton, Typography, Paper } from '@mui/material';
import * as topojson from 'topojson-client';
import { Bank, Project } from '../../types';
import { numericToAlpha2 } from '../../utils/countryCodeMap';
import 'leaflet/dist/leaflet.css';

type MapMode = 'banks' | 'projects' | 'capacity';

interface WorldMapProps {
  banks: Bank[];
  projects: Project[];
}

export default function WorldMap({ banks, projects }: WorldMapProps) {
  const [geoData, setGeoData] = useState<any>(null);
  const [mode, setMode] = useState<MapMode>('capacity');
  const [tooltip, setTooltip] = useState<{ country: string; value: string } | null>(null);

  useEffect(() => {
    fetch('/geo/world-50m.json')
      .then(r => r.json())
      .then(topo => {
        const geo = topojson.feature(topo, topo.objects.countries);
        setGeoData(geo);
      });
  }, []);

  const countryData = useMemo(() => {
    const data: Record<string, { banks: number; projects: number; capacity: number }> = {};

    for (const bank of banks) {
      const countries = bank.countries.includes('GLOBAL')
        ? Object.values(numericToAlpha2)
        : bank.countries;
      for (const c of countries) {
        if (!data[c]) data[c] = { banks: 0, projects: 0, capacity: 0 };
        data[c].banks++;
        data[c].capacity += bank.totalCapacity - bank.usedCapacity;
      }
    }

    for (const project of projects) {
      if (!data[project.country]) data[project.country] = { banks: 0, projects: 0, capacity: 0 };
      data[project.country].projects++;
    }

    return data;
  }, [banks, projects]);

  const maxValues = useMemo(() => ({
    banks: Math.max(1, ...Object.values(countryData).map(v => v.banks)),
    projects: Math.max(1, ...Object.values(countryData).map(v => v.projects)),
    capacity: Math.max(1, ...Object.values(countryData).map(v => v.capacity)),
  }), [countryData]);

  const getColor = (alpha2: string) => {
    const d = countryData[alpha2];
    if (!d) return '#eef0f4';

    const value = d[mode];
    const maxVal = maxValues[mode];
    if (value === 0) return '#eef0f4';

    const intensity = value / maxVal;

    // All modes: light teal → green (more = better/greener)
    const stops = mode === 'capacity' ? [
      { t: 0.0, r: 220, g: 240, b: 220 },   // very light green
      { t: 0.25, r: 160, g: 215, b: 170 },  // light green
      { t: 0.5, r: 100, g: 190, b: 130 },   // medium green
      { t: 0.75, r: 50, g: 160, b: 100 },   // rich green
      { t: 1.0, r: 0, g: 120, b: 70 },      // deep green
    ] : [
      { t: 0.0, r: 220, g: 237, b: 240 },   // very light teal
      { t: 0.25, r: 160, g: 215, b: 220 },  // light teal
      { t: 0.5, r: 80, g: 185, b: 190 },    // medium teal
      { t: 0.75, r: 20, g: 150, b: 155 },   // rich teal
      { t: 1.0, r: 0, g: 115, b: 120 },     // deep teal
    ];

    let low = stops[0], high = stops[stops.length - 1];
    for (let i = 0; i < stops.length - 1; i++) {
      if (intensity >= stops[i].t && intensity <= stops[i + 1].t) {
        low = stops[i];
        high = stops[i + 1];
        break;
      }
    }

    const pct = (intensity - low.t) / (high.t - low.t || 1);
    const r = Math.round(low.r + (high.r - low.r) * pct);
    const g = Math.round(low.g + (high.g - low.g) * pct);
    const b = Math.round(low.b + (high.b - low.b) * pct);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const style = (feature: any) => {
    const numId = feature.id?.toString().padStart(3, '0');
    const alpha2 = numericToAlpha2[numId] || '';
    return {
      fillColor: getColor(alpha2),
      weight: 0.8,
      color: '#c0c4cc',
      fillOpacity: 0.85,
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    const numId = feature.id?.toString().padStart(3, '0');
    const alpha2 = numericToAlpha2[numId] || '';
    const d = countryData[alpha2];

    layer.on({
      mouseover: (e: any) => {
        e.target.setStyle({ weight: 2.5, color: '#1a1a2e', fillOpacity: 0.95 });
        const name = feature.properties?.name || alpha2;
        let value = '';
        if (d) {
          switch (mode) {
            case 'banks': value = `${d.banks} banks`; break;
            case 'projects': value = `${d.projects} projects`; break;
            case 'capacity': value = `$${d.capacity.toLocaleString()}M available`; break;
          }
        } else {
          value = 'No data';
        }
        setTooltip({ country: name, value });
      },
      mouseout: (e: any) => {
        e.target.setStyle(style(feature));
        setTooltip(null);
      },
    });
  };

  const legendLabel = mode === 'banks' ? 'Banks' : mode === 'projects' ? 'Projects' : 'Capacity (USD M)';

  return (
    <Paper sx={{ p: 2.5, position: 'relative', borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Box>
          <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#1a1a2e' }}>Global Coverage</Typography>
          <Typography variant="caption" color="text.secondary">Click a country for details</Typography>
        </Box>
        <ToggleButtonGroup
          size="small"
          value={mode}
          exclusive
          onChange={(_, v) => v && setMode(v)}
          sx={{ '& .MuiToggleButton-root': { textTransform: 'none', px: 2, fontSize: 13 } }}
        >
          <ToggleButton value="banks">Banks</ToggleButton>
          <ToggleButton value="projects">Projects</ToggleButton>
          <ToggleButton value="capacity">Capacity</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {tooltip && (
        <Paper
          sx={{
            position: 'absolute', top: 70, right: 20, zIndex: 1000,
            px: 2, py: 1.5, pointerEvents: 'none', borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          }}
          elevation={0}
        >
          <Typography variant="body2" fontWeight={700} sx={{ color: '#1a1a2e' }}>{tooltip.country}</Typography>
          <Typography variant="body2" color="text.secondary">{tooltip.value}</Typography>
        </Paper>
      )}

      <Box sx={{ height: 420, borderRadius: 1.5, overflow: 'hidden', position: 'relative' }}>
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: '100%', width: '100%', background: '#f8f9fb' }}
          scrollWheelZoom={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
          />
          {geoData && (
            <GeoJSON
              key={mode}
              data={geoData}
              style={style}
              onEachFeature={onEachFeature}
            />
          )}
        </MapContainer>

        {/* Heat map legend */}
        <Box sx={{
          position: 'absolute', bottom: 16, left: 16, zIndex: 1000,
          bgcolor: 'rgba(255,255,255,0.92)', borderRadius: 1.5, px: 2, py: 1.5,
          backdropFilter: 'blur(8px)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          <Typography variant="caption" fontWeight={600} sx={{ color: '#374151', mb: 0.5, display: 'block' }}>
            {legendLabel}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#6b7280', fontSize: 10 }}>Low</Typography>
            <Box sx={{
              width: 120, height: 10, borderRadius: 5,
              background: mode === 'capacity'
                ? 'linear-gradient(to right, #dcf0dc, #a0d7aa, #64be82, #32a064, #007846)'
                : 'linear-gradient(to right, #dcedf0, #a0d7dc, #50b9be, #14969b, #007378)',
            }} />
            <Typography variant="caption" sx={{ color: '#6b7280', fontSize: 10 }}>High</Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}
