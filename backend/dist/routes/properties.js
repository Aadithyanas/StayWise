"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Property_1 = require("../models/Property");
const router = (0, express_1.Router)();
router.get('/', async (_req, res) => {
    const properties = await Property_1.Property.find().sort({ createdAt: -1 });
    res.json({ properties });
});
router.get('/:id', async (req, res) => {
    const property = await Property_1.Property.findById(req.params.id);
    if (!property)
        return res.status(404).json({ error: 'Not found' });
    res.json({ property });
});
exports.default = router;
