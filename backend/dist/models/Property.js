"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Property = void 0;
const mongoose_1 = require("mongoose");
const propertySchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    pricePerNight: { type: Number, required: true, min: 0 },
    images: { type: [String], default: [] },
}, { timestamps: true });
exports.Property = mongoose_1.models.Property || (0, mongoose_1.model)('Property', propertySchema);
