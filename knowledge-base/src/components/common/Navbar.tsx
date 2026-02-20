import { AppBar, Toolbar, Typography, Box, IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { DRAWER_WIDTH } from './Sidebar';
import SearchBar from '../search/SearchBar';

interface NavbarProps {
  title: string;
  themeMode: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function Navbar({ title, themeMode, onToggleTheme }: NavbarProps) {
  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${DRAWER_WIDTH}px)`,
        ml: `${DRAWER_WIDTH}px`,
        bgcolor: 'background.paper',
        color: 'text.primary',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap sx={{ flexGrow: 0, mr: 3 }}>
          {title}
        </Typography>
        <Box sx={{ flexGrow: 1, maxWidth: 500 }}>
          <SearchBar />
        </Box>
        <Box sx={{ ml: 2 }}>
          <Tooltip title={themeMode === 'light' ? 'Dark mode' : 'Light mode'}>
            <IconButton onClick={onToggleTheme} color="inherit">
              {themeMode === 'light' ? <Brightness4 /> : <Brightness7 />}
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
