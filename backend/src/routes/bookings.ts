import { Router } from 'express';
import { z } from 'zod';
import { Booking } from '../models/Booking';
import { Property } from '../models/Property';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

const createSchema = z.object({
  propertyId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
});

router.post('/', requireAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
  const { propertyId, startDate, endDate } = parsed.data;

  const property = await Property.findById(propertyId);
  if (!property) return res.status(404).json({ error: 'Property not found' });

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (!(start < end)) return res.status(400).json({ error: 'Invalid dates' });

  const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const totalPrice = nights * property.pricePerNight;

  const booking = await Booking.create({
    user: req.user!.sub,
    property: property.id,
    startDate: start,
    endDate: end,
    totalPrice,
  });

  res.status(201).json({ booking });
});

router.get('/mine', requireAuth, async (req, res) => {
  const bookings = await Booking.find({ user: req.user!.sub })
    .sort({ createdAt: -1 })
    .populate('property');
  res.json({ bookings });
});

router.get('/all', requireAuth, requireRole('admin'), async (_req, res) => {
  const bookings = await Booking.find().sort({ createdAt: -1 }).populate('property').populate('user');
  res.json({ bookings });
});

export default router;


