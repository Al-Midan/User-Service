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
export class UserUseCase implements IuserUsecase {
  static userExists(email: any) {
      throw new Error("Method not implemented.");
  }
  private repository: IUserRepository;

  constructor(repository: IUserRepository) {
    this.repository = repository;
  }

  async userExists(email: string): Promise<returnUser | null> {
    const user = await this.repository.findUserExists(email);
    return user ? this.mapToReturnUser(user) : null;
  }

  async registerUser(
    username: string,
    email: string,
    password: string
  ): Promise<returnUser> {
    const hashedPassword1 = hashedPassword(password);
    const {otp, creationTime } = generateOtpWithTime();
  const createdAt = creationTime
    const newUser = await this.repository.addNewUser(
      username,
      email,
      hashedPassword1,
      otp,
      createdAt,
    );
    await sendOtpEmail(newUser,otp);

    return this.mapToReturnUser(newUser);
  }

  async otpVerify(values: number): Promise<returnUser | null> {
    const user = await this.repository.findUserByOtp(values);
    console.log("UserUSecas", user);
    
    return user ? this.mapToReturnUser(user) : null;
  }

  private mapToReturnUser(user: UserDocument): returnUser {
    return {
      _id: user._id,
      username: user.username,
      email: user.email,
      password: user.password,
      isBlocked: user.isBlocked,
      isVerified: user.isVerified,
      roles:user.roles,
    };
  }
  async validateUser(
    email: string,
    password: string
  ): Promise<{
    user: returnUser | null;
    accessToken: string | null;
    refreshToken: string | null;
  }> {
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
        const token = generateToken(userDb.email)
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
}
