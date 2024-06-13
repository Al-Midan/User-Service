// repository/UserRepository.ts
import { returnUser } from "../../domain/entities/returnUser";
import { User, UserDocument } from "../database/model/UserDb";
import { IUserRepository } from "../interface/IuserRepository";

export class UserRepository implements IUserRepository {
  async findUserExists(email: string): Promise<UserDocument | null> {
    const user = await User.findOne({ email });
    return user ? user : null;
  }

  async addNewUser(
    username: string,
    email: string,
    hashedPassword: string,
    otp: number,
    createdAt: Date
  ): Promise<UserDocument> {
    let existingUser = await User.findOne({ email });

    if (existingUser) {
      // Update existing user with new values
      existingUser.username = username;
      existingUser.password = hashedPassword;
      existingUser.otp = otp;
      existingUser.createdAt = createdAt;
    } else {
      // Create a new user if not found
      existingUser = new User({
        username,
        email,
        password: hashedPassword,
        otp,
        createdAt,
      });
    }

    const newUser = await existingUser.save();
    return newUser;
  }

  async findUserByOtp(values: any): Promise<UserDocument | null> {
    let number = parseInt(values.join(''), 10);

    const user = await User.findOne({ otp: number });

    if (user && user.createdAt) {
      const createdAt = new Date(user.createdAt);
      const currentDate = new Date();
      const diffInMilliseconds = currentDate.getTime() - createdAt.getTime();
      const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));

      if (diffInMinutes > 1) {
        return null;
      }
      user.isVerified = true;
      user.otp = 1
      await user.save();
    }
    return user ? user : null;
  }

  async getUserFromDb() {
    const allUsers = await User.find();
    return allUsers ? allUsers : null;
  }
  async isBlockValues(userId: string) {
    try {
      const user = await User.findById(userId);
      if (user) {
        user.isBlocked = !user.isBlocked;
        await user.save();
        console.log(
          `User ${userId} isBlocked status changed to ${user.isBlocked}`
        );
        return user;
      } else {
        console.log(`User with ID ${userId} not found`);
        return null;
      }
    } catch (error) {
      console.error(
        `Error updating isBlocked status for user ${userId}:`,
        error
      );
      throw error;
    }
  }
}
