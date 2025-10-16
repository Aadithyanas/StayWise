import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { ExternalBooking } from '../models/ExternalBooking';
import { Property } from '../models/Property';

const router = Router();

const createSchema = z.object({
  provider: z.literal('google'),
  externalId: z.string(),
  name: z.string(),
  imageUrl: z.string().optional(),
  adminId: z.string().optional(), // Add admin ID (optional for backward compatibility)
  hotelName: z.string().optional(), // Add hotel name (optional for backward compatibility)
  propertyId: z.string().optional(), // Add property ID (optional for backward compatibility)
  startDate: z.string(),
  endDate: z.string(),
  totalPrice: z.number().nonnegative(),
});

router.post('/', requireAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  console.log('🔎 External booking: parsed=', parsed);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
  const { provider, externalId, name, imageUrl, adminId, hotelName, propertyId, startDate, endDate, totalPrice } = parsed.data;
  console.log('🔎 External booking: parsed=', parsed);

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (!(start < end)) return res.status(400).json({ error: 'Invalid dates' });

  // Get property details to fetch ownerId
  let ownerId: string | null = null;
  let propertyTitle = name; // Default to the provided name
  // If propertyId not provided, try using externalId (our frontend sends property id as externalId)
  const effectivePropertyId = propertyId || externalId || null;

  if (effectivePropertyId) {
    try {
      console.log('🔎 External booking: lookup propertyId=', effectivePropertyId);
      const property = await Property.findById(effectivePropertyId);
      if (property) {
        ownerId = (property as any).ownerId || null; // Get ownerId from property, set to null if not exists
        propertyTitle = (property as any).title || name; // Use property title if available
        console.log('✅ Property found. ownerId=', ownerId, ' title=', propertyTitle);
      }
    } catch (error) {
      console.log('❌ Property not found or error fetching property:', error);
      // Continue with null ownerId if property not found
    }
  }

  const resolvedAdminId = ownerId ?? (adminId ?? null);
  if (!resolvedAdminId) {
    console.log('ℹ️ No ownerId/adminId found. Setting adminId to null (N/A).');
  }

  const booking = await ExternalBooking.create({
    user: req.user!.sub,
    provider,
    externalId,
    name,
    imageUrl,
    adminId: resolvedAdminId, // Use ownerId from property (or fall back to provided adminId or null)
    hotelName: propertyTitle, // Use property title (or provided name)
    propertyId: effectivePropertyId || null, // Use effective propertyId (or null)
    status: 'active',
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

// Get external bookings for admin (bookings made on their properties)
router.get('/admin', requireAuth, async (req, res) => {
  const adminId = req.user!.sub;
  const bookings = await ExternalBooking.find({ adminId: { $exists: true, $eq: adminId } })
    .populate('user', 'email')
    .sort({ createdAt: -1 });
  res.json({ bookings });
});

// Cancel an external booking
router.patch('/:id/cancel', requireAuth, async (req, res) => {
  const booking = await ExternalBooking.findById(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Not found' });
  // Only the booking user can cancel
  if (String(booking.user) !== String(req.user!.sub)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if ((booking as any).status === 'cancelled') return res.json({ booking });
  (booking as any).status = 'cancelled';
  await booking.save();
  res.json({ booking });
});

export default router;








