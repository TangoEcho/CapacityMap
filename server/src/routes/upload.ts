import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';
import { getBanks, saveBanks } from '../utils/store';
import { Bank } from '../types';

const router = Router();

// Logo upload
const logoStorage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});
const logoUpload = multer({ storage: logoStorage });

router.post('/logo', logoUpload.single('logo'), (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

// Excel import
const excelUpload = multer({ storage: multer.memoryStorage() });

router.post('/excel/import', excelUpload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

    const parsed: { bank: Partial<Bank>; errors: string[] }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const errors: string[] = [];
      const name = row['Bank Name']?.toString().trim();
      if (!name) errors.push('Bank Name is required');

      const totalCapacity = Number(row['Total Capacity (USD M)']);
      if (isNaN(totalCapacity)) errors.push('Total Capacity must be a number');

      const usedCapacity = Number(row['Used Capacity (USD M)']);
      if (isNaN(usedCapacity)) errors.push('Used Capacity must be a number');

      const countries = row['Countries']
        ? row['Countries'].toString().split(',').map((c: string) => c.trim().toUpperCase())
        : [];

      const sensitiveSubjects = row['Sensitive Subjects']
        ? row['Sensitive Subjects'].toString().split(',').map((s: string) => s.trim())
        : [];

      const maxTenor = row['Max Tenor (Years)'] ? Number(row['Max Tenor (Years)']) : undefined;
      const averagePrice = row['Average Price (bps)'] ? Number(row['Average Price (bps)']) : 50;

      parsed.push({
        bank: {
          name,
          creditRating: row['Credit Rating']?.toString().trim(),
          totalCapacity,
          usedCapacity,
          maxTenor,
          averagePrice,
          countries,
          sensitiveSubjects,
        },
        errors,
      });
    }

    // If query param preview=true, return parsed data for preview
    if (req.query.preview === 'true') {
      return res.json({ rows: parsed });
    }

    // Otherwise, merge into existing bank data
    const existingBanks = await getBanks();
    const hasErrors = parsed.some(p => p.errors.length > 0);
    if (hasErrors) {
      return res.status(400).json({
        error: 'Validation errors found',
        rows: parsed,
      });
    }

    for (const p of parsed) {
      const existing = existingBanks.find(b => b.name === p.bank.name);
      if (existing) {
        Object.assign(existing, p.bank, { lastUpdated: new Date().toISOString() });
      } else {
        existingBanks.push({
          id: uuidv4(),
          name: p.bank.name!,
          totalCapacity: p.bank.totalCapacity!,
          usedCapacity: p.bank.usedCapacity!,
          countries: p.bank.countries || [],
          lastUpdated: new Date().toISOString(),
          creditRating: p.bank.creditRating,
          maxTenor: p.bank.maxTenor,
          averagePrice: p.bank.averagePrice,
          sensitiveSubjects: p.bank.sensitiveSubjects,
        });
      }
    }

    await saveBanks(existingBanks);
    res.json({ imported: parsed.length, banks: existingBanks });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to parse Excel file', details: err.message });
  }
});

// Excel export
router.get('/excel/export', async (_req: Request, res: Response) => {
  const banks = await getBanks();
  const rows = banks.map(b => ({
    'Bank Name': b.name,
    'Credit Rating': b.creditRating || '',
    'Total Capacity (USD M)': b.totalCapacity,
    'Used Capacity (USD M)': b.usedCapacity,
    'Max Tenor (Years)': b.maxTenor || '',
    'Average Price (bps)': b.averagePrice || 50,
    'Countries': b.countries.join(', '),
    'Sensitive Subjects': (b.sensitiveSubjects || []).join(', '),
  }));

  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, sheet, 'Banks');

  // Add reference sheet
  const { COUNTRIES } = require('../utils/countries');
  const refSheet = XLSX.utils.json_to_sheet(COUNTRIES);
  XLSX.utils.book_append_sheet(workbook, refSheet, 'Reference');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=banks_export.xlsx');
  res.send(buffer);
});

// Template download
router.get('/excel/template', (_req: Request, res: Response) => {
  const headers = [
    'Bank Name',
    'Credit Rating',
    'Total Capacity (USD M)',
    'Used Capacity (USD M)',
    'Max Tenor (Years)',
    'Average Price (bps)',
    'Countries',
    'Sensitive Subjects',
  ];
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet([headers]);
  XLSX.utils.book_append_sheet(workbook, sheet, 'Banks');

  const { COUNTRIES } = require('../utils/countries');
  const refSheet = XLSX.utils.json_to_sheet(COUNTRIES);
  XLSX.utils.book_append_sheet(workbook, refSheet, 'Reference');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=bank_template.xlsx');
  res.send(buffer);
});

export default router;
