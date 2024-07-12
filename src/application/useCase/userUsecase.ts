import { IUserRepository } from "../../infrastructure/interface/IuserRepository";
import { returnUser } from "../../domain/entities/returnUser";
import { IuserUsecase } from "../interface/IuserUsecase";
import { hashedPassword, comparePassword } from "../../utils/HashingPassword";
import { sendOtpEmail } from "../../utils/mailUtils";
import { UserDocument } from "../../infrastructure/database/model/UserDb";
import { generateToken } from "../../utils/generateJwtToken";
import { generateRefreshToken } from "../../utils/generateJwtToken";
import { Response } from "express";
import { generateOtpWithTime } from "../../utils/generateOtp";
import { googelUserData } from "../../presentation/interface/interface";
import { ProfileUpdatePayload } from "../../domain/entities/ProfileUpdatePayload";
export class UserUseCase implements IuserUsecase {
  static userExists(email: any) {
    throw new Error("Method not implemented.");
  }
  private repository: IUserRepository;

  constructor(repository: IUserRepository) {
    this.repository = repository;
  }

  async userExists(email: string){
    const user = await this.repository.findUserExists(email);
    return user ? this.mapToReturnUser(user) : null;
  }

  async registerUser(
    username: string,
    email: string,
    password: string
  ){
    const hashedPassword1 = hashedPassword(password);
    const { otp, creationTime } = generateOtpWithTime();
    const createdAt = creationTime;
    const newUser = await this.repository.addNewUser(
      username,
      email,
      hashedPassword1,
      otp,
      createdAt
    );
    await sendOtpEmail(newUser, otp);

    return this.mapToReturnUser(newUser);
  }

  async otpVerify(values: number){
    const user = await this.repository.findUserByOtp(values);
    console.log("UserUSecas", user);

    return user ? this.mapToReturnUser(user) : null;
  }

  private mapToReturnUser(user: UserDocument): returnUser {
    return {
      _id: user._id,
      username: user.username,
      email: user.email,
      isBlocked: user.isBlocked,
      isVerified: user.isVerified,
      roles: user.roles,
      profilePic:user.profilePic
    };
  }
  async validateUser(
    email: string,
    password: string
  ){
    const userDb = await this.repository.findUserExists(email);
    console.log("User Found inside userUsecase", userDb);
    if (!userDb) {
      console.log("User Not Found inside userUsecase");
      return { user: null, accessToken: null, refreshToken: null };
    } else {
      const userPassword = userDb.password;
      const isPasswordValid = await comparePassword(password, userPassword);
      if (!isPasswordValid) {
        console.log("Password is incorrect inside userUsecase");
        return { user: null, accessToken: null, refreshToken: null };
      }
      if (userDb.email) {
        const token = generateToken(userDb.email);
        const refreshToken = generateRefreshToken(userDb.email);
        return { user: userDb, accessToken: token, refreshToken: refreshToken };
      }
    }
    return { user: null, accessToken: null, refreshToken: null };
  }
  async getUser() {
    const responseuser = await this.repository.getUserFromDb();
    return responseuser ? responseuser : null;
  }

  async isBlock(userId: string) {
    const isBlockedValue = await this.repository.isBlockValues(userId);
    return isBlockedValue ? isBlockedValue : null;
  }

  async getUserId(userId: string) {
    const UserValues = await this.repository.UserValues(userId);
    return UserValues ? UserValues : null;
  }
  async updateRole(role:string, userId:string){
    const updatedValues = await this.repository.UpdateRole(role,userId);
    return updatedValues ? updatedValues : null;
  }
  async googleUser(userData:googelUserData){
    const updatedValues = await this.repository.googleUser(userData)
    return this.mapToReturnUser(updatedValues);
  }
  async getValues(email: string){
    try {
      const dbgetValues = await this.repository.getvaluesByEmail(email);
      if (dbgetValues) {
        return this.mapToReturnUser(dbgetValues);
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error in getValues:', error);
      throw error;
    }
  }
  async profileUpdate(values:ProfileUpdatePayload){
    const response = await this.repository.profileUpdate(values)
    return response ? this.mapToReturnUser(response) : null;
  }
}
