import { useState, useEffect } from 'react';
import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { lightTheme, darkTheme } from './theme/theme';
import { SettingsProvider } from './hooks/useSettings';
import Sidebar from './components/common/Sidebar';
import DashboardPage from './components/dashboard/DashboardPage';
import ProjectsPage from './components/projects/ProjectsPage';
import BanksPage from './components/banks/BanksPage';
import CountriesPage from './components/countries/CountriesPage';
import ProjectRecommendations from './components/projects/ProjectRecommendations';
import SettingsPage from './components/settings/SettingsPage';

const Router = import.meta.env.VITE_STORAGE === 'local' ? HashRouter : BrowserRouter;

export default function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') setMode('dark');
  }, []);

  const handleThemeChange = (theme: 'light' | 'dark') => {
    setMode(theme);
    localStorage.setItem('theme', theme);
  };

  return (
    <ThemeProvider theme={mode === 'light' ? lightTheme : darkTheme}>
      <CssBaseline />
      <SettingsProvider>
      <Router>
        <Box sx={{ display: 'flex' }}>
          <Sidebar />
          <Box component="main" sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:id/recommendations" element={<ProjectRecommendations />} />
              <Route path="/banks" element={<BanksPage />} />
              <Route path="/countries" element={<CountriesPage />} />
              <Route path="/settings" element={<SettingsPage onThemeChange={handleThemeChange} />} />
            </Routes>
          </Box>
        </Box>
      </Router>
      </SettingsProvider>
    </ThemeProvider>
  );
}
