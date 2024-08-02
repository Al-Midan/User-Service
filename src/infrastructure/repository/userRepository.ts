import { Kafka } from "kafkajs";
import { googelUserData } from "../../presentation/interface/interface";
import { User, UserDocument } from "../database/model/UserDb";
import { IUserRepository } from "../interface/IuserRepository";
import { ProfileUpdatePayload } from "../../domain/entities/ProfileUpdatePayload";
import { uploadS3ProfileImage } from "../s3/s3Uploader";

export class UserRepository implements IUserRepository {
  async findUserExists(email: string) {
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

  async findUserByOtp(values: any) {
    let number = parseInt(values.join(""), 10);

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
      user.otp = 1;
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
  async UserValues(userId: string) {
    const user = await User.findById(userId);
    return user ? user : null;
  }
  async UpdateRole(role: string, userId: string) {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { roles: role },
      { new: true }
    );

    return updatedUser ? updatedUser : null;
  }
  async googleUser(userData: googelUserData) {
    try {
      let user = await User.findOne({ email: userData.email });

      if (user) {
        // Update existing user with new values
        user.username = userData.username;
        user.password = userData.password;
        user.otp = 1;
        user.roles = "student";
        (user.isVerified = true), (user.createdAt = new Date());
      } else {
        // Create a new user if not found
        user = new User({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          otp: 1,
          roles: "student",
          isVerified: true,
          createdAt: new Date(),
        });
      }

      const savedUser = await user.save();
      return savedUser;
    } catch (error) {
      console.error("Error in googleUser:", error);
      throw error;
    }
  }
  async getvaluesByEmail(email: string) {
    const userValues = await User.findOne({ email });
    return userValues ? userValues : null;
  }
  async profileUpdate(values:ProfileUpdatePayload){
    const { profilePic, userId, username } = values;

  try {
    const s3Response: any = await uploadS3ProfileImage(profilePic);
    if (s3Response.error) {
      console.error("Error uploading image to S3:", s3Response.error);
      throw new Error("Failed to upload image to S3");
    }

    console.log("URL of the image from the S3 bucket:", s3Response.Location);

    const update = {
      username,
      profilePic: s3Response.Location
    };

    const response = await User.findByIdAndUpdate(userId, update, { new: true });
    
    if (!response) {
      throw new Error("User not found");
    }
console.log("response",response);

    return response;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new Error("Failed to update user profile");
  }
  }
}
