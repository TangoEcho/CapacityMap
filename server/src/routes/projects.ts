import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getProjects, saveProjects } from '../utils/store';
import { Project } from '../types';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const projects = await getProjects();
  res.json(projects);
});

router.get('/:id', async (req: Request, res: Response) => {
  const projects = await getProjects();
  const project = projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

router.post('/', async (req: Request, res: Response) => {
  const projects = await getProjects();
  const project: Project = {
    id: uuidv4(),
    name: req.body.name,
    country: req.body.country,
    capacityNeeded: req.body.capacityNeeded,
    tenorRequired: req.body.tenorRequired,
    projectType: req.body.projectType || [],
    minimumCreditRating: req.body.minimumCreditRating,
    status: req.body.status || 'Planned',
    plannedIssuanceDate: req.body.plannedIssuanceDate,
    issuanceDate: req.body.issuanceDate,
    allocatedBankId: req.body.allocatedBankId,
  };
  projects.push(project);
  await saveProjects(projects);
  res.status(201).json(project);
});

router.put('/:id', async (req: Request, res: Response) => {
  const projects = await getProjects();
  const idx = projects.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Project not found' });
  projects[idx] = {
    ...projects[idx],
    ...req.body,
    id: projects[idx].id,
  };
  await saveProjects(projects);
  res.json(projects[idx]);
});

router.delete('/:id', async (req: Request, res: Response) => {
  let projects = await getProjects();
  const idx = projects.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Project not found' });
  projects = projects.filter(p => p.id !== req.params.id);
  await saveProjects(projects);
  res.status(204).send();
});

// Mark project as issued
router.post('/:id/issue', async (req: Request, res: Response) => {
  const projects = await getProjects();
  const idx = projects.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Project not found' });
  if (!projects[idx].allocatedBankId && !req.body.allocatedBankId) {
    return res.status(400).json({ error: 'A bank must be allocated before marking as issued' });
  }
  projects[idx].status = 'Issued';
  projects[idx].issuanceDate = req.body.issuanceDate || new Date().toISOString();
  if (req.body.allocatedBankId) {
    projects[idx].allocatedBankId = req.body.allocatedBankId;
  }
  await saveProjects(projects);
  res.json(projects[idx]);
});

export default router;
