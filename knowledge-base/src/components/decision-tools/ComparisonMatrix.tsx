import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import { Check, Close, Remove } from '@mui/icons-material';

interface ProductFeature {
  feature: string;
  lc: 'yes' | 'no' | 'partial';
  guarantee: 'yes' | 'no' | 'partial';
  scf: 'yes' | 'no' | 'partial';
  forfaiting: 'yes' | 'no' | 'partial';
  tradeLoan: 'yes' | 'no' | 'partial';
  docCollection: 'yes' | 'no' | 'partial';
}

const features: ProductFeature[] = [
  { feature: 'Payment guarantee', lc: 'yes', guarantee: 'yes', scf: 'partial', forfaiting: 'yes', tradeLoan: 'no', docCollection: 'no' },
  { feature: 'Performance assurance', lc: 'partial', guarantee: 'yes', scf: 'no', forfaiting: 'no', tradeLoan: 'no', docCollection: 'no' },
  { feature: 'Working capital improvement', lc: 'partial', guarantee: 'no', scf: 'yes', forfaiting: 'yes', tradeLoan: 'yes', docCollection: 'no' },
  { feature: 'Off-balance sheet treatment', lc: 'partial', guarantee: 'partial', scf: 'yes', forfaiting: 'yes', tradeLoan: 'no', docCollection: 'no' },
  { feature: 'No recourse to seller', lc: 'yes', guarantee: 'no', scf: 'partial', forfaiting: 'yes', tradeLoan: 'no', docCollection: 'no' },
  { feature: 'Short-term (< 1 year)', lc: 'yes', guarantee: 'yes', scf: 'yes', forfaiting: 'partial', tradeLoan: 'yes', docCollection: 'yes' },
  { feature: 'Medium/long-term (1-7 years)', lc: 'partial', guarantee: 'yes', scf: 'no', forfaiting: 'yes', tradeLoan: 'partial', docCollection: 'no' },
  { feature: 'Multiple suppliers/buyers', lc: 'no', guarantee: 'no', scf: 'yes', forfaiting: 'no', tradeLoan: 'no', docCollection: 'no' },
  { feature: 'Low cost', lc: 'no', guarantee: 'partial', scf: 'yes', forfaiting: 'partial', tradeLoan: 'yes', docCollection: 'yes' },
  { feature: 'Simple documentation', lc: 'no', guarantee: 'partial', scf: 'partial', forfaiting: 'partial', tradeLoan: 'yes', docCollection: 'yes' },
  { feature: 'Country risk mitigation', lc: 'yes', guarantee: 'yes', scf: 'partial', forfaiting: 'yes', tradeLoan: 'no', docCollection: 'no' },
];

const products = [
  { key: 'lc' as const, label: 'Letters of Credit' },
  { key: 'guarantee' as const, label: 'Bank Guarantees' },
  { key: 'scf' as const, label: 'Supply Chain Finance' },
  { key: 'forfaiting' as const, label: 'Forfaiting' },
  { key: 'tradeLoan' as const, label: 'Trade Loans' },
  { key: 'docCollection' as const, label: 'Doc. Collections' },
];

function StatusIcon({ value }: { value: 'yes' | 'no' | 'partial' }) {
  switch (value) {
    case 'yes':
      return <Check sx={{ color: 'success.main' }} />;
    case 'no':
      return <Close sx={{ color: 'text.disabled' }} />;
    case 'partial':
      return <Remove sx={{ color: 'warning.main' }} />;
  }
}

export default function ComparisonMatrix() {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>Product Comparison Matrix</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Compare key features across trade finance products.
      </Typography>

      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Check sx={{ color: 'success.main', fontSize: 18 }} />
          <Typography variant="caption">Fully supported</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Remove sx={{ color: 'warning.main', fontSize: 18 }} />
          <Typography variant="caption">Partially / depends</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Close sx={{ color: 'text.disabled', fontSize: 18 }} />
          <Typography variant="caption">Not applicable</Typography>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Feature</TableCell>
              {products.map(p => (
                <TableCell key={p.key} align="center" sx={{ color: 'white', fontWeight: 600 }}>
                  {p.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {features.map(row => (
              <TableRow key={row.feature} sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
                <TableCell sx={{ fontWeight: 500 }}>{row.feature}</TableCell>
                {products.map(p => (
                  <TableCell key={p.key} align="center">
                    <StatusIcon value={row[p.key]} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
