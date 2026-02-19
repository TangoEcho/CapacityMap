import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import { DRAWER_WIDTH } from './Sidebar';

interface NavbarProps {
  title: string;
  actions?: React.ReactNode;
}

export default function Navbar({ title, actions }: NavbarProps) {
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
        <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        {actions && <Box sx={{ display: 'flex', gap: 1 }}>{actions}</Box>}
      </Toolbar>
    </AppBar>
  );
}
