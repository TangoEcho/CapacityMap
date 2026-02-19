import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getBanks, saveBanks } from '../utils/store';
import { Bank } from '../types';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const banks = await getBanks();
  res.json(banks);
});

router.get('/:id', async (req: Request, res: Response) => {
  const banks = await getBanks();
  const bank = banks.find(b => b.id === req.params.id);
  if (!bank) return res.status(404).json({ error: 'Bank not found' });
  res.json(bank);
});

router.post('/', async (req: Request, res: Response) => {
  const banks = await getBanks();
  const bank: Bank = {
    id: uuidv4(),
    name: req.body.name,
    logoUrl: req.body.logoUrl,
    creditRating: req.body.creditRating,
    totalCapacity: req.body.totalCapacity,
    usedCapacity: req.body.usedCapacity,
    maxTenor: req.body.maxTenor,
    averagePrice: req.body.averagePrice ?? 50,
    countries: req.body.countries || [],
    sensitiveSubjects: req.body.sensitiveSubjects || [],
    lastUpdated: new Date().toISOString(),
  };
  banks.push(bank);
  await saveBanks(banks);
  res.status(201).json(bank);
});

router.put('/:id', async (req: Request, res: Response) => {
  const banks = await getBanks();
  const idx = banks.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Bank not found' });
  banks[idx] = {
    ...banks[idx],
    ...req.body,
    id: banks[idx].id,
    lastUpdated: new Date().toISOString(),
  };
  await saveBanks(banks);
  res.json(banks[idx]);
});

router.delete('/:id', async (req: Request, res: Response) => {
  let banks = await getBanks();
  const idx = banks.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Bank not found' });
  banks = banks.filter(b => b.id !== req.params.id);
  await saveBanks(banks);
  res.status(204).send();
});

export default router;
