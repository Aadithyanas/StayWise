"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const Property_1 = require("../models/Property");
async function run() {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/staywise';
    await (0, mongoose_1.connect)(mongoUri);
    await User_1.User.deleteMany({});
    await Property_1.Property.deleteMany({});
    const admin = await User_1.User.create({
        email: 'admin@staywise.dev',
        passwordHash: await bcryptjs_1.default.hash('Admin123!', 10),
        role: 'admin',
    });
    const properties = await Property_1.Property.insertMany([
        {
            title: 'Seaside Villa',
            description: 'Beautiful villa with ocean views',
            location: 'Santorini, Greece',
            pricePerNight: 320,
            images: [],
        },
        {
            title: 'Mountain Cabin',
            description: 'Cozy cabin surrounded by nature',
            location: 'Aspen, USA',
            pricePerNight: 180,
            images: [],
        },
    ]);
    // eslint-disable-next-line no-console
    console.log('Seeded:', { admin: admin.email, properties: properties.length });
    await (0, mongoose_1.disconnect)();
}
run().catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
});
