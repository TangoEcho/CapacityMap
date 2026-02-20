import { useState } from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Collapse,
} from '@mui/material';
import {
  MenuBook as KBIcon,
  Home as HomeIcon,
  Description as ArticleIcon,
  AccountBalance as BankIcon,
  Security as RiskIcon,
  BusinessCenter as ProcessIcon,
  Spellcheck as GlossaryIcon,
  Quiz as DecisionIcon,
  LocalShipping as SCFIcon,
  Gavel as ForfeIcon,
  AccountBalanceWallet as LoanIcon,
  ExpandLess,
  ExpandMore,
  Receipt as DocCollIcon,
  Architecture as StructuredIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { Category } from '../../types';

export const DRAWER_WIDTH = 280;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { label: 'Home', path: '/', icon: <HomeIcon /> },
  {
    label: 'TF Products',
    path: '/category/trade-finance-products',
    icon: <ArticleIcon />,
    children: [
      { label: 'Letters of Credit', path: '/category/letters-of-credit', icon: <BankIcon /> },
      { label: 'Bank Guarantees', path: '/category/bank-guarantees', icon: <RiskIcon /> },
      { label: 'Supply Chain Finance', path: '/category/supply-chain-finance', icon: <SCFIcon /> },
      { label: 'Forfaiting', path: '/category/forfaiting', icon: <ForfeIcon /> },
      { label: 'Trade Loans', path: '/category/trade-loans', icon: <LoanIcon /> },
      { label: 'Documentary Collections', path: '/category/documentary-collections', icon: <DocCollIcon /> },
      { label: 'Structured TF', path: '/category/structured-trade-finance', icon: <StructuredIcon /> },
    ],
  },
  { label: 'Risk & Compliance', path: '/category/risk-compliance', icon: <RiskIcon /> },
  { label: 'Bank Relationships', path: '/category/bank-relationships', icon: <BankIcon /> },
  { label: 'Internal Processes', path: '/category/internal-processes', icon: <ProcessIcon /> },
  { label: 'Glossary', path: '/glossary', icon: <GlossaryIcon /> },
  { label: 'Decision Tools', path: '/decision-tools', icon: <DecisionIcon /> },
];

interface SidebarProps {
  categories?: Category[];
}

export default function Sidebar({ categories: _categories }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'TF Products': true,
  });

  const toggleSection = (label: string) => {
    setOpenSections(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const renderNavItem = (item: NavItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const active = isActive(item.path);
    const open = openSections[item.label] ?? false;

    return (
      <Box key={item.path}>
        <ListItemButton
          onClick={() => {
            if (hasChildren) {
              toggleSection(item.label);
            }
            navigate(item.path);
          }}
          sx={{
            borderRadius: 1,
            mb: 0.25,
            pl: 1.5 + depth * 2,
            bgcolor: active && !hasChildren ? 'rgba(255,255,255,0.15)' : 'transparent',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={item.label}
            primaryTypographyProps={{ fontSize: depth > 0 ? '0.85rem' : '0.9rem' }}
          />
          {hasChildren && (open ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
        {hasChildren && (
          <Collapse in={open} timeout="auto" unmountOnExit>
            <List disablePadding>
              {item.children!.map(child => renderNavItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

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
          overflowX: 'hidden',
        },
      }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
          <KBIcon sx={{ fontSize: 28 }} />
          <Box sx={{ fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.2 }}>
            TF Knowledge
            <br />
            Base
          </Box>
        </Box>
      </Toolbar>
      <List sx={{ px: 1 }}>
        {navItems.map(item => renderNavItem(item))}
      </List>
    </Drawer>
  );
}
