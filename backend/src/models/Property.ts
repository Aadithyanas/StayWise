import { Schema, model, models, Document } from 'mongoose';

export interface PropertyDocument extends Document {
  title: string;
  description: string;
  location: string;
  pricePerNight: number;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const propertySchema = new Schema<PropertyDocument>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    pricePerNight: { type: Number, required: true, min: 0 },
    images: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Property = models.Property || model<PropertyDocument>('Property', propertySchema);


