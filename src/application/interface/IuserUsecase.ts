// usecase/IuserUsecase.ts
import { ProfileUpdatePayload } from "../../domain/entities/ProfileUpdatePayload";
import { returnUser } from "../../domain/entities/returnUser";
import { UserDocument } from "../../infrastructure/database/model/UserDb";
import { googelUserData } from "../../presentation/interface/interface";

export interface IuserUsecase {
  userExists(email: string): Promise<returnUser | null>;
  registerUser(
    username: string,
    email: string,
    password: string
  ): Promise<returnUser>;
  otpVerify(values: number): Promise<returnUser | null>;
  validateUser(
    email: string,
    password: string
  ): Promise<{
    user: returnUser | null;
    accessToken: string | null;
    refreshToken: string | null;
  }>;
  getUser(): Promise<UserDocument[] | null>;
  isBlock(userId: string): Promise<UserDocument | null>;
  getUserId(userId: string): Promise<UserDocument | null>;
  updateRole(role:string, userId: string): Promise<UserDocument | null>;
  googleUser(userData:googelUserData): Promise<returnUser>;
  getValues(email:string): Promise<returnUser | null>;
  profileUpdate(values:ProfileUpdatePayload): Promise<returnUser | null>;
}
