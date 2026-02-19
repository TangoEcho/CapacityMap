import { Router, Request, Response } from 'express';
import { getSettings, saveSettings } from '../utils/store';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const settings = await getSettings();
  res.json(settings);
});

router.put('/', async (req: Request, res: Response) => {
  const current = await getSettings();
  const updated = { ...current, ...req.body };
  await saveSettings(updated);
  res.json(updated);
});

export default router;
