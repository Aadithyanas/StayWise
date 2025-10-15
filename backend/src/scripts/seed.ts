import dotenv from 'dotenv';
dotenv.config();

import { connect, disconnect } from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Property } from '../models/Property';

async function run() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/staywise';
  await connect(mongoUri);

  await User.deleteMany({});
  await Property.deleteMany({});

  const admin = await User.create({
    email: 'admin@staywise.dev',
    passwordHash: await bcrypt.hash('Admin123!', 10),
    role: 'admin',
  });

  const properties = await Property.insertMany([
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
  await disconnect();
}

run().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});


