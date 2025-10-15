import { Schema, model, models, Document, Types } from 'mongoose';

export interface ExternalBookingDocument extends Document {
  user: Types.ObjectId;
  provider: 'google';
  externalId: string; // provider-specific hotel id/token
  name: string;
  imageUrl?: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

const externalBookingSchema = new Schema<ExternalBookingDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    provider: { type: String, enum: ['google'], required: true },
    externalId: { type: String, required: true },
    name: { type: String, required: true },
    imageUrl: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

externalBookingSchema.index({ user: 1, provider: 1, externalId: 1 });

export const ExternalBooking =
  models.ExternalBooking || model<ExternalBookingDocument>('ExternalBooking', externalBookingSchema);





