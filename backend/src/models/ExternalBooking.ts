import { Schema, model, models, Document, Types } from 'mongoose';

export interface ExternalBookingDocument extends Document {
  user: Types.ObjectId;
  provider: 'google';
  externalId: string; // provider-specific hotel id/token
  name: string;
  imageUrl?: string;
  adminId?: string; // Add admin ID (optional for backward compatibility)
  hotelName?: string; // Add hotel name (optional for backward compatibility)
  propertyId?: string; // Add property ID (optional for backward compatibility)
  status: 'active' | 'cancelled';
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
    adminId: { type: String, index: true }, // Add admin ID (optional for backward compatibility)
    hotelName: { type: String }, // Add hotel name (optional for backward compatibility)
    propertyId: { type: String, index: true }, // Add property ID (optional for backward compatibility)
    status: { type: String, enum: ['active', 'cancelled'], default: 'active', index: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

externalBookingSchema.index({ user: 1, provider: 1, externalId: 1 });

export const ExternalBooking =
  models.ExternalBooking || model<ExternalBookingDocument>('ExternalBooking', externalBookingSchema);








