// interface/IuserRepository.ts
import { UserDocument } from "../database/model/UserDb";
import { googelUserData } from "../../presentation/interface/interface";
import { ProfileUpdatePayload } from "../../domain/entities/ProfileUpdatePayload";

export interface IUserRepository {
  findUserExists(email: string): Promise<UserDocument | null>;
  addNewUser(username: string, email: string, hashedPassword: string,otp:number,createdAt:Date): Promise<UserDocument>;
  findUserByOtp(values: any): Promise<UserDocument | null>;
  getUserFromDb(): Promise<UserDocument[] | null>;
  isBlockValues(userId: string): Promise<UserDocument | null>;
  UserValues(userId: string): Promise<UserDocument | null>;
  UpdateRole(role:string, userId: string): Promise<UserDocument| null>;
  googleUser(userData:googelUserData): Promise<UserDocument>;
  getvaluesByEmail(email:string): Promise<UserDocument| null>;
  profileUpdate(values:ProfileUpdatePayload): Promise<UserDocument| null>;
}
