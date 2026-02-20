import { useState, useEffect } from 'react';
import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { lightTheme, darkTheme } from './theme/theme';
import { SettingsProvider } from './hooks/useSettings';
import Sidebar from './components/common/Sidebar';
import Navbar from './components/common/Navbar';
import HomePage from './components/articles/HomePage';
import CategoryPage from './components/articles/CategoryPage';
import ArticleView from './components/articles/ArticleView';
import SearchResults from './components/search/SearchResults';
import GlossaryPage from './components/glossary/GlossaryPage';
import DecisionToolsPage from './components/decision-tools/DecisionToolsPage';

const Router = import.meta.env.VITE_STORAGE === 'local' ? HashRouter : BrowserRouter;

export default function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = localStorage.getItem('kb_theme');
    if (saved === 'dark') setMode('dark');
  }, []);

  const handleThemeToggle = () => {
    const next = mode === 'light' ? 'dark' : 'light';
    setMode(next);
    localStorage.setItem('kb_theme', next);
  };

  return (
    <ThemeProvider theme={mode === 'light' ? lightTheme : darkTheme}>
      <CssBaseline />
      <SettingsProvider>
        <Router>
          <Box sx={{ display: 'flex' }}>
            <Sidebar />
            <Navbar title="Knowledge Base" themeMode={mode} onToggleTheme={handleThemeToggle} />
            <Box component="main" sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/article/*" element={<ArticleView />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/glossary" element={<GlossaryPage />} />
                <Route path="/decision-tools" element={<DecisionToolsPage />} />
              </Routes>
            </Box>
          </Box>
        </Router>
      </SettingsProvider>
    </ThemeProvider>
  );
}
