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
  try {
    console.log('📝 Creating booking:', req.body);
    console.log('👤 User:', req.user);
    
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      console.log('❌ Invalid input:', parsed.error);
      return res.status(400).json({ error: 'Invalid input' });
    }
    const { propertyId, startDate, endDate } = parsed.data;

    const property = await Property.findById(propertyId);
    if (!property) {
      console.log('❌ Property not found:', propertyId);
      return res.status(404).json({ error: 'Property not found' });
    }
    console.log('🏠 Property found:', { id: property._id, title: property.title, ownerId: property.ownerId });

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (!(start < end)) {
      console.log('❌ Invalid dates:', { start, end });
      return res.status(400).json({ error: 'Invalid dates' });
    }

    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * property.pricePerNight;

    const bookingData = {
      user: req.user!.sub,
      userId: req.user!.sub,
      userName: req.user!.email || 'Unknown User',
      property: property.id,
      propertyId: property.id,
      hotelName: property.title,
      adminId: property.ownerId,
      status: 'active',
      startDate: start,
      endDate: end,
      totalPrice,
    };
    
    console.log('💾 Creating booking with data:', bookingData);
    const booking = await Booking.create(bookingData);
    console.log('✅ Booking created:', booking._id);

    res.status(201).json({ booking });
  } catch (error) {
    console.error('❌ Booking creation error:', error);
    res.status(500).json({ error: 'Failed to create booking', details: (error as Error).message });
  }
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

// Admin: bookings for properties owned by this admin
router.get('/owner', requireAuth, requireRole('admin'), async (req, res) => {
  const adminId = req.user!.sub;
  const bookings = await Booking.find({ adminId })
    .sort({ createdAt: -1 });
  res.json({ bookings });
});

// Debug endpoint to check all bookings
router.get('/debug/all', requireAuth, requireRole('admin'), async (req, res) => {
  const allBookings = await Booking.find().sort({ createdAt: -1 });
  const allProperties = await Property.find().sort({ createdAt: -1 });
  
  res.json({
    totalBookings: allBookings.length,
    totalProperties: allProperties.length,
    allBookings: allBookings.map(b => ({
      id: b._id,
      userId: (b as any).userId,
      userName: (b as any).userName,
      propertyId: (b as any).propertyId,
      hotelName: (b as any).hotelName,
      adminId: (b as any).adminId,
      status: (b as any).status,
      startDate: b.startDate,
      endDate: b.endDate,
      totalPrice: b.totalPrice,
      createdAt: b.createdAt
    })),
    allProperties: allProperties.map(p => ({
      id: p._id,
      title: p.title,
      ownerId: p.ownerId,
      createdAt: p.createdAt
    }))
  });
});

// Debug endpoint to check admin data
router.get('/debug/admin', requireAuth, requireRole('admin'), async (req, res) => {
  const adminId = req.user!.sub;
  const allBookings = await Booking.find().sort({ createdAt: -1 });
  const adminBookings = await Booking.find({ adminId });
  const properties = await Property.find({ ownerId: adminId });
  
  res.json({
    adminId,
    totalBookings: allBookings.length,
    adminBookings: adminBookings.length,
    adminProperties: properties.length,
    sampleBookings: allBookings.slice(0, 3).map(b => ({
      id: b._id,
      adminId: (b as any).adminId,
      hotelName: (b as any).hotelName,
      status: (b as any).status
    })),
    adminPropertiesList: properties.map(p => ({
      id: p._id,
      title: p.title,
      ownerId: p.ownerId
    }))
  });
});

// Cancel a booking (user)
router.patch('/:id/cancel', requireAuth, async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('property');
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

// Migration endpoint to fix existing bookings
router.post('/migrate', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    // Find all bookings without adminId
    const bookingsToFix = await Booking.find({ 
      $or: [
        { adminId: { $exists: false } },
        { adminId: null },
        { adminId: '' }
      ]
    }).populate('property');

    let fixed = 0;
    for (const booking of bookingsToFix) {
      if (booking.property && (booking.property as any).ownerId) {
        (booking as any).adminId = (booking.property as any).ownerId;
        (booking as any).hotelName = (booking.property as any).title;
        (booking as any).propertyId = booking.property._id.toString();
        (booking as any).userId = booking.user.toString();
        (booking as any).userName = 'Migrated User'; // We don't have user email in old bookings
        await booking.save();
        fixed++;
      }
    }

    res.json({ 
      message: `Fixed ${fixed} bookings`,
      totalFound: bookingsToFix.length,
      fixed 
    });
  } catch (error) {
    res.status(500).json({ error: 'Migration failed', details: error });
  }
});

export default router;


