import { Router, Request, Response } from 'express';
import { COUNTRIES, REGIONS } from '../utils/countries';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  res.json(COUNTRIES);
});

router.get('/regions', async (_req: Request, res: Response) => {
  res.json(REGIONS);
});

export default router;
