import mongoose from "mongoose";
import { Schema, Document } from "mongoose";

export interface UserDocument extends Document {
  username: string;
  email: string;
  password: string;
  isBlocked: boolean;
  isVerified: boolean;
  roles: string[];
  otp?: number; 
  createdAt?: Date;
}

const UserSchema = new Schema<UserDocument>({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  isBlocked: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  roles: { type: [String], enum: ["user", "admin"], default: ['user'] }, 
  otp: { type: Number },  
  createdAt: {type:Date}
});

export const User = mongoose.model<UserDocument>("User", UserSchema);
