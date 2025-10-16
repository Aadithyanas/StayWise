import { Schema, model, models, Document, Types } from 'mongoose';

export interface BookingDocument extends Document {
  user: Types.ObjectId;
  userId: string; // user email/id for easy lookup
  userName: string; // user name for display
  property: Types.ObjectId;
  propertyId: string; // property id for easy lookup
  hotelName: string; // property/hotel name for display
  adminId: string; // admin who owns the property
  status: 'active' | 'cancelled';
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<BookingDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    propertyId: { type: String, required: true, index: true },
    hotelName: { type: String, required: true },
    adminId: { type: String, required: true, index: true },
    status: { type: String, enum: ['active', 'cancelled'], default: 'active', index: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export const Booking = models.Booking || model<BookingDocument>('Booking', bookingSchema);


