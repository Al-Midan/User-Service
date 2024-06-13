// interface/IuserRepository.ts
import { UserDocument } from "../database/model/UserDb";
import { returnUser } from "../../domain/entities/returnUser";

export interface IUserRepository {
  findUserExists(email: string): Promise<UserDocument | null>;
  addNewUser(username: string, email: string, hashedPassword: string,otp:number,createdAt:Date): Promise<UserDocument>;
  findUserByOtp(values: any): Promise<UserDocument | null>;
  getUserFromDb(): Promise<UserDocument[] | null>;
  isBlockValues(userId: string): Promise<UserDocument | null>;
}
