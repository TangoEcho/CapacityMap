import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountBalance as BankIcon,
  Assignment as ProjectIcon,
  Public as CountryIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

const DRAWER_WIDTH = 240;

const navItems = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { label: 'Projects', path: '/projects', icon: <ProjectIcon /> },
  { label: 'Banks', path: '/banks', icon: <BankIcon /> },
  { label: 'Countries', path: '/countries', icon: <CountryIcon /> },
  { label: 'Settings', path: '/settings', icon: <SettingsIcon /> },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          bgcolor: 'primary.main',
          color: 'white',
        },
      }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
          <BankIcon sx={{ fontSize: 28 }} />
          <Box sx={{ fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.2 }}>
            Credit Capacity
            <br />
            Mapper
          </Box>
        </Box>
      </Toolbar>
      <List sx={{ px: 1 }}>
        {navItems.map(item => {
          const active =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);
          return (
            <ListItemButton
              key={item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                bgcolor: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
    </Drawer>
  );
}

export { DRAWER_WIDTH };
