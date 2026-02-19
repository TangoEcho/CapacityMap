import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Chip, Box, LinearProgress,
} from '@mui/material';
import { Bank, Project, Settings } from '../../types';
import { rankBanksForProject } from '../../utils/ranking';

interface ProjectRankingProps {
  open: boolean;
  project: Project;
  banks: Bank[];
  weights: Settings['weights'];
  onClose: () => void;
}

export default function ProjectRanking({ open, project, banks, weights, onClose }: ProjectRankingProps) {
  const ranked = rankBanksForProject(banks, project, weights);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Bank Rankings for: {project.name}
        <Typography variant="body2" color="text.secondary">
          {project.country} | {project.capacityNeeded} USD M
          {project.tenorRequired ? ` | ${project.tenorRequired} years` : ''}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>#</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Bank</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Rating</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Available (USD M)</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Price (bps)</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Capacity Score</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Price Score</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Rating Score</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Total Score</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ranked.map((bank, i) => (
                <TableRow
                  key={bank.id}
                  sx={{
                    opacity: bank.eligible ? 1 : 0.5,
                    bgcolor: i === 0 && bank.eligible ? 'success.50' : undefined,
                  }}
                >
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{bank.name}</Typography>
                  </TableCell>
                  <TableCell>
                    {bank.creditRating && <Chip label={bank.creditRating} size="small" variant="outlined" />}
                  </TableCell>
                  <TableCell>{(bank.totalCapacity - bank.usedCapacity).toLocaleString()}</TableCell>
                  <TableCell>{bank.averagePrice ?? '—'}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={bank.capacityScore * 100}
                        sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                      />
                      <Typography variant="caption">{bank.capacityScore}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={bank.priceScore * 100}
                        sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                        color="secondary"
                      />
                      <Typography variant="caption">{bank.priceScore}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={bank.ratingScore * 100}
                        sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                        color="success"
                      />
                      <Typography variant="caption">{bank.ratingScore}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700} color={bank.eligible ? 'success.main' : 'text.disabled'}>
                      {bank.score.toFixed(3)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {bank.eligible ? (
                      <Chip label="Eligible" size="small" color="success" />
                    ) : (
                      <Chip label={bank.disqualifyReasons[0]} size="small" color="error" variant="outlined" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
