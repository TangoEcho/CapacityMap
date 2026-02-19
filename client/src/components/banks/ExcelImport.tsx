import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Typography, Box, Alert, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, LinearProgress,
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { uploadApi } from '../../services/api';
import { ExcelImportRow } from '../../types';

interface ExcelImportProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function ExcelImport({ open, onClose, onComplete }: ExcelImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ExcelImportRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePreview = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const result = await uploadApi.importExcel(file, true);
      setPreview(result.rows);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      await uploadApi.importExcel(file, false);
      onComplete();
      resetState();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setPreview(null);
    setError(null);
  };

  const hasErrors = preview?.some(r => r.errors.length > 0);

  return (
    <Dialog open={open} onClose={() => { onClose(); resetState(); }} maxWidth="lg" fullWidth>
      <DialogTitle>Import Banks from Excel</DialogTitle>
      <DialogContent>
        {!preview ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CloudUpload sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" gutterBottom>
              Upload an Excel file (.xlsx) with bank data
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Use the template to ensure correct column headers
            </Typography>
            <Button variant="outlined" component="label" sx={{ mt: 2 }}>
              Choose File
              <input type="file" hidden accept=".xlsx,.xls"
                onChange={e => setFile(e.target.files?.[0] || null)} />
            </Button>
            {file && (
              <Typography variant="body2" sx={{ mt: 1 }}>{file.name}</Typography>
            )}
          </Box>
        ) : (
          <Box>
            <Typography variant="body2" gutterBottom>
              Preview: {preview.length} banks found
            </Typography>
            {hasErrors && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Some rows have errors. Fix them before importing.
              </Alert>
            )}
            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Bank Name</TableCell>
                    <TableCell>Rating</TableCell>
                    <TableCell>Total Cap.</TableCell>
                    <TableCell>Used Cap.</TableCell>
                    <TableCell>Countries</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {preview.map((row, i) => (
                    <TableRow key={i} sx={{ bgcolor: row.errors.length > 0 ? 'error.50' : undefined }}>
                      <TableCell>{row.bank.name || '—'}</TableCell>
                      <TableCell>{row.bank.creditRating || '—'}</TableCell>
                      <TableCell>{row.bank.totalCapacity ?? '—'}</TableCell>
                      <TableCell>{row.bank.usedCapacity ?? '—'}</TableCell>
                      <TableCell>
                        {(row.bank.countries || []).slice(0, 3).join(', ')}
                        {(row.bank.countries || []).length > 3 && '...'}
                      </TableCell>
                      <TableCell>
                        {row.errors.length > 0 ? (
                          <Chip label={row.errors[0]} size="small" color="error" />
                        ) : (
                          <Chip label="Valid" size="small" color="success" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
        {loading && <LinearProgress sx={{ mt: 2 }} />}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => { onClose(); resetState(); }}>Cancel</Button>
        {!preview ? (
          <Button variant="contained" onClick={handlePreview} disabled={!file || loading}>
            Preview
          </Button>
        ) : (
          <>
            <Button onClick={resetState}>Back</Button>
            <Button variant="contained" onClick={handleImport} disabled={hasErrors || loading}>
              Import {preview.length} Banks
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
