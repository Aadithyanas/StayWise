import { Schema, model, models, Document } from 'mongoose';

export type UserRole = 'user' | 'admin';

export interface UserDocument extends Document {
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user', required: true },
  },
  { timestamps: true }
);

export const User = models.User || model<UserDocument>('User', userSchema);


