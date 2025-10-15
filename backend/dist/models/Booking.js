"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Booking = void 0;
const mongoose_1 = require("mongoose");
const bookingSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    property: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalPrice: { type: Number, required: true, min: 0 },
}, { timestamps: true });
exports.Booking = mongoose_1.models.Booking || (0, mongoose_1.model)('Booking', bookingSchema);
