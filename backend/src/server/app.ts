import express, { Request, Response } from 'express';
import cors from 'cors';
import authRoutes from '../routes/auth';
import propertiesRoutes from '../routes/properties';
import bookingsRoutes from '../routes/bookings';
import hotelsRoutes from '../routes/hotels'
import externalBookingsRoutes from '../routes/externalBookings'

export function createApp() {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, service: 'staywise-api' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/properties', propertiesRoutes);
  app.use('/api/bookings', bookingsRoutes);
  app.use('/api/hotels',hotelsRoutes)
  app.use('/api/external-bookings', externalBookingsRoutes);

  return app;
}


