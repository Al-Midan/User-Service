// userController.ts
import { NextFunction, Request, Response } from "express";
import { IuserUsecase } from "../../application/interface/IuserUsecase";
import { GoogleUser, googelUserData } from "../interface/interface";
import jwt, { Secret } from "jsonwebtoken";
import { kafkaProducer } from "../../infrastructure/broker/kafkaBroker/kafkaProducer";

const JWT_SECRET: Secret = process.env.JWT_KEY as Secret;
const JWT_REFRESH_SECRET: Secret = process.env.JWT_REFRESHKEY as Secret;

export class userController {
  private userUsecase: IuserUsecase;
  constructor(userUsecase: IuserUsecase) {
    this.userUsecase = userUsecase;
  }

  async registerUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, email, password } = req.body;
      const existingUser = await this.userUsecase.userExists(email);
      if (existingUser?.isVerified) {
        console.log("User is already in use", existingUser);
        return res.status(401).json({ message: "User already Existed" });
      } else {
        await this.userUsecase.registerUser(username, email, password);
        return res.status(200).json({
          message:
            "Verification OTP sent to your email. Please check your inbox.",
        });
      }
    } catch (error) {
      console.log("Error IN User Service Controller: ", error);
      return res
        .status(500)
        .json({ error: "An error occurred while registering the user" });
    }
  }
  async otpverification(req: Request, res: Response, next: NextFunction) {
    try {
      const values = req.body;

      const user = await this.userUsecase.otpVerify(values);
      console.log("UserController", user);

      if (!user) {
        return res.status(400).json({ message: "Invalid or expired Otp " });
      }
      return res
        .status(200)
        .json({ message: "Otp Verification Successfull", user });
    } catch (error) {
      console.log("Error in otp verification:", error);
      return res
        .status(500)
        .json({ error: "An error occurred during otp verification" });
    }
  }
  async loginUser(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      // Proceed with the normal user login flow
      const checkUser = await this.userUsecase.userExists(email);
      if (!checkUser) {
        return res
          .status(404)
          .json({ message: "User doesn't exist. Create a new one." });
      } else {
        if (checkUser?.isVerified == false) {
          return res
            .status(403)
            .json({ message: "Access denied. User not verified." });
        }
        const { user, accessToken, refreshToken } =
          await this.userUsecase.validateUser(email, password);
        if (user) {
          if (accessToken && refreshToken) {
            res.cookie("access_token", accessToken, {
              httpOnly: false,
              sameSite: "none",
              secure: true,
              maxAge: 3600, // 1 hour
            });
            res.cookie("refresh_token", refreshToken, {
              httpOnly: false,
              sameSite: "none",
              secure: true,
              maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days
            });
          }
          let userData = {
            _id: user._id,
            username: user.username,
            email: user.email,
            isBlocked: user.isBlocked,
            isVerified: user.isVerified,
            roles: user.roles,
            accessToken,
            refreshToken,
            profilePic: "",
          };
          if (user.profilePic) {
            userData.profilePic = user.profilePic;
          }

          console.log("userData", userData);
          return res
            .status(200)
            .json({ message: "User logged in successfully", user: userData });
        } else {
          return res.status(401).json({ message: "Invalid credentials" });
        }
      }
    } catch (error) {
      console.log("Error in login verification:", error);
      return res
        .status(500)
        .json({ error: "An error occurred during login verification" });
    }
  }

  //       Admin---------------------------------------Admin Get ALL Users --------------------------------
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await this.userUsecase.getUser();
      if (users) {
        return res.status(200).json({
          message: "User Information Successfully Fetched",
          users: users,
        });
      } else {
        return res.status(400).json({ message: "NO USERS IN DB" });
      }
    } catch (error) {
      console.log("error IN Get all Users Controller", error);
    }
  }
  // User isBlock Controller
  async isBlocked(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      console.log("values", req.params);
      const response = await this.userUsecase.isBlock(userId);
      if (response) {
        let userData = {
          _id: response._id,
          username: response.username,
          email: response.email,
          isBlocked: response.isBlocked,
          isVerified: response.isVerified,
        };
        return res
          .status(200)
          .json({ message: "Block Condition Changed Successfully", userData });
      } else {
        return res
          .status(400)
          .json({ message: "Block Condition Something Wrong Happend" });
      }
    } catch (error) {
      console.log("error in IsBlocked Controller", error);
    }
  }
  async getUserwithId(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      console.log("values", req.params);
      const response = await this.userUsecase.getUserId(userId);
      if (response) {
        let userData = {
          _id: response._id,
          userId: response.userId,
          username: response.username,
          email: response.email,
          isBlocked: response.isBlocked,
          isVerified: response.isVerified,
        };
        return res
          .status(200)
          .json({ message: "Block Condition Changed Successfully", userData });
      } else {
        return res
          .status(400)
          .json({ message: "Block Condition Something Wrong Happend" });
      }
    } catch (error) {
      console.log("error in IsBlocked Controller", error);
    }
  }
  async handleGooglePassport(req: Request, res: Response) {
    try {
      const user = req.user as GoogleUser | undefined;

      if (!user) {
        res.status(400).json({ message: "User information not found" });
        return;
      }

      console.log("req.user:", user);

      const username = user.name.givenName;
      const email = user.emails[0].value;
      const verified = user.emails[0].verified;
      const password = user.id;

      if (!verified) {
        res.status(400).json({ message: "Please provide a verified email" });
        return;
      }

      const userData: googelUserData = {
        username,
        email,
        password,
      };

      const response = await this.userUsecase.googleUser(userData);

      if (response) {
        res.redirect("http://localhost:3000/home");
      } else {
        res.status(500).json({ message: "Failed to process user data" });
      }
    } catch (error) {
      console.error("Error in handleGooglePassport:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async roleUpdate(req: Request, res: Response) {
    try {
      const newRole = req.body.role;
      const userId = req.body._id;
      const updateRole = await this.userUsecase.updateRole(newRole, userId);
      res
        .status(200)
        .json({ message: "newRole updated Successfully", updateRole });
    } catch (error) {
      console.error("Error in Role Update Section", error);
      res.status(400).json({ message: "Role update Error", error });
    }
  }
  async  refreshTokens(req: Request, res: Response, next: NextFunction) {
    const { refreshToken } = req.body;
  
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }
  
    try {
      const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
      const JWT_SECRET = process.env.JWT_SECRET;
  
      if (!JWT_REFRESH_SECRET || !JWT_SECRET) {
        throw new Error("JWT secrets are not defined");
      }
      console.log("JWT_REFRESH_SECRET cked Controller", JWT_REFRESH_SECRET);
      console.log("JWT_SECRET cked JWT_SECRET", JWT_SECRET);

      const user = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
  
      // Generate a new access token
      const newAccessToken = jwt.sign({ email: user.email }, JWT_SECRET, {
        expiresIn: "1h",
      });
  
      res.status(200).json({ accessToken: newAccessToken });
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Refresh token expired" });
      }
      return res.status(403).json({ message: "Refresh token is not valid" });
    }
  }
  
  async userValues(req: Request, res: Response) {
    try {
      const { email } = req.query;

      if (!email || typeof email !== "string") {
        return res.status(400).json({ message: "Valid email is required" });
      }

      const response = await this.userUsecase.getValues(email);

      if (response) {
        res.status(200).json({
          message: "User values are valid",
          data: response,
        });
      } else {
        res
          .status(404)
          .json({ message: "User not found or values are invalid" });
      }
    } catch (error) {
      console.error("Error in userValues:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  async updateProfile(req: Request, res: Response) {
    try {
      console.log("Updating profile", req.body);
      console.log("Updating profile", req.file);

      const { username: userName, userID: userId } = req.body;
      const profilePic = req.file;

      const payload = {
        username: userName,
        userId: userId,
        profilePic,
      };

      const response = await this.userUsecase.profileUpdate(payload);
      res
        .status(200)
        .json({ message: "Profile Updated successfully", response });
    } catch (error) {
      console.error("Error in updating profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  async logOut(req: Request, res: Response) {
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    res.status(200).json({ message: "Logged out successfully" });
  }
  async handleGetuserDetails(userId: string) {
    try {
      const response = await this.userUsecase.getUserId(userId);
      if (response) {
        let userData = {
          _id: response._id,
          userId: response.userId,
          username: response.username,
          email: response.email,
          isBlocked: response.isBlocked,
          isVerified: response.isVerified,
        };
        console.log("Sending user details response:", userData);
        await kafkaProducer.senduserDetailsResponse(userId, userData);
      } else {
        console.log("No user found for userId:", userId);
        await kafkaProducer.senduserDetailsResponse(userId, null);
      }
    } catch (error) {
      console.log("Error in handleGetuserDetails:", error);
      await kafkaProducer.senduserDetailsResponse(userId, {
        error: "An error occurred while fetching user details",
      });
    }
  }
}
