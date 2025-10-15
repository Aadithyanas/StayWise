import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { connect } from 'mongoose';
import { createApp } from './server/app';

const port = '5003';
const mongoUri = 'mongodb+srv://aadithyanmerin:AdithyanMerin@cluster0.syz6u.mongodb.net/staywise';

async function bootstrap(): Promise<void> {
  console.log('🚀 Starting server...');
  console.log('🕒 Connecting to MongoDB...');

  try {
    await connect(mongoUri);
    console.log('✅ MongoDB connected successfully');

    const app = createApp();
    const server = http.createServer(app);

    server.listen(port, () => {
      console.log(`🌍 StayWise backend listening on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB', err);
    process.exit(1);
  }
}

bootstrap().catch((err) => { 
  console.error('Failed to start server', err); process.exit(1); });




