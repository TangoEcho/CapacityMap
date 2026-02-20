import { Breadcrumbs as MuiBreadcrumbs, Link, Typography } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const navigate = useNavigate();

  return (
    <MuiBreadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 2 }}>
      <Link
        underline="hover"
        color="inherit"
        sx={{ cursor: 'pointer' }}
        onClick={() => navigate('/')}
      >
        Home
      </Link>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return isLast ? (
          <Typography key={item.label} color="text.primary" fontWeight={500}>
            {item.label}
          </Typography>
        ) : (
          <Link
            key={item.label}
            underline="hover"
            color="inherit"
            sx={{ cursor: 'pointer' }}
            onClick={() => item.path && navigate(item.path)}
          >
            {item.label}
          </Link>
        );
      })}
    </MuiBreadcrumbs>
  );
}
