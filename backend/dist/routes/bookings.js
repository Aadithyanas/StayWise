"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const Booking_1 = require("../models/Booking");
const Property_1 = require("../models/Property");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const createSchema = zod_1.z.object({
    propertyId: zod_1.z.string(),
    startDate: zod_1.z.string(),
    endDate: zod_1.z.string(),
});
router.post('/', auth_1.requireAuth, async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: 'Invalid input' });
    const { propertyId, startDate, endDate } = parsed.data;
    const property = await Property_1.Property.findById(propertyId);
    if (!property)
        return res.status(404).json({ error: 'Property not found' });
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (!(start < end))
        return res.status(400).json({ error: 'Invalid dates' });
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * property.pricePerNight;
    const booking = await Booking_1.Booking.create({
        user: req.user.sub,
        property: property.id,
        startDate: start,
        endDate: end,
        totalPrice,
    });
    res.status(201).json({ booking });
});
router.get('/mine', auth_1.requireAuth, async (req, res) => {
    const bookings = await Booking_1.Booking.find({ user: req.user.sub })
        .sort({ createdAt: -1 })
        .populate('property');
    res.json({ bookings });
});
router.get('/all', auth_1.requireAuth, (0, auth_1.requireRole)('admin'), async (_req, res) => {
    const bookings = await Booking_1.Booking.find().sort({ createdAt: -1 }).populate('property').populate('user');
    res.json({ bookings });
});
exports.default = router;
