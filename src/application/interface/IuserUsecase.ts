// usecase/IuserUsecase.ts
import { returnUser } from "../../domain/entities/returnUser";
import { UserDocument } from "../../infrastructure/database/model/UserDb";

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
}
