import { Schema, model, models, Document, Types } from 'mongoose';

export interface BookingDocument extends Document {
  user: Types.ObjectId;
  property: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<BookingDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export const Booking = models.Booking || model<BookingDocument>('Booking', bookingSchema);


