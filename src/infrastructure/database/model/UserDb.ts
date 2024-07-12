import mongoose from "mongoose";
import { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from 'uuid';

export interface UserDocument extends Document {
  userId: string;
  username: string;
  email: string;
  password: string;
  isBlocked: boolean;
  isVerified: boolean;
  roles: string;
  otp?: number;
  createdAt?: Date;
  profilePic?: string | null;
}

const UserSchema = new Schema<UserDocument>({
  userId: { type: String, unique: true, default: () => uuidv4() },
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  isBlocked: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  roles: { type: String, default: "student"},
  otp: { type: Number },
  createdAt: { type: Date, default: Date.now },
  profilePic: { type: String, default: null }
});

export const User = mongoose.model<UserDocument>("User", UserSchema);
