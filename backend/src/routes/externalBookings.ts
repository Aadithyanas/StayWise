import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { ExternalBooking } from '../models/ExternalBooking';

const router = Router();

const createSchema = z.object({
  provider: z.literal('google'),
  externalId: z.string(),
  name: z.string(),
  imageUrl: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  totalPrice: z.number().nonnegative(),
});

router.post('/', requireAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
  const { provider, externalId, name, imageUrl, startDate, endDate, totalPrice } = parsed.data;

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (!(start < end)) return res.status(400).json({ error: 'Invalid dates' });

  const booking = await ExternalBooking.create({
    user: req.user!.sub,
    provider,
    externalId,
    name,
    imageUrl,
    startDate: start,
    endDate: end,
    totalPrice,
  });

  res.status(201).json({ booking });
});

router.get('/mine', requireAuth, async (req, res) => {
  const bookings = await ExternalBooking.find({ user: req.user!.sub }).sort({ createdAt: -1 });
  res.json({ bookings });
});

export default router;





