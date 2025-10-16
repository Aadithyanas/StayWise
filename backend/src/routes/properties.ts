import { Router, Request, Response } from 'express';
import { Property } from '../models/Property';
import { requireAuth, requireRole } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

// Public: list all properties (for customers)
router.get('/all', async (_req: Request, res: Response) => {
  const properties = await Property.find({}).sort({ createdAt: -1 });
  res.json({ properties });
});

router.get('/', requireAuth, async (req: Request, res: Response) => {
  const properties = await Property.find({ ownerId: req.user!.sub }).sort({ createdAt: -1 });
  res.json({ properties });
});

router.get('/:id', async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return res.status(404).json({ error: 'Not found' });
  res.json({ property });
});

// Create property (business/admin)
const createSchema = z.object({
  title: z.string(),
  description: z.string(),
  location: z.string(),
  pricePerNight: z.number().nonnegative(),
  images: z.array(z.string()).optional(),
});

router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
  const prop = await Property.create({
    ...parsed.data,
    ownerId: req.user!.sub,
  });
  res.status(201).json({ property: prop });
});

export default router;


