// userController.ts
import { NextFunction, Request, Response } from "express";
import { IuserUsecase } from "../../application/interface/IuserUsecase";


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
      return res.status(200).json({ message: "Otp Verification Successfull" ,user});

    } catch (error) {
      console.log("Error in otp verification:", error);
      return res
        .status(500)
        .json({ error: "An error occurred during otp verification" });
    }
  }
  async loginUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // Proceed with the normal user login flow
      const checkUser = await this.userUsecase.userExists(email);
      if (!checkUser) {
        return res
          .status(404)
          .json({ message: "User doesn't exist. Create a new one." });
      } else {
        if(checkUser?.isVerified == false){
          return res.status(403).json({ message: "Access denied. User not verified." });
        }
        const { user, accessToken, refreshToken } =
          await this.userUsecase.validateUser(email, password);
        if (user) {
          if (accessToken && refreshToken) {
            res.cookie("access_token", accessToken, {
              httpOnly: true,
              sameSite: "none",
              secure: true,
              maxAge: 3600000, // 1 hour
            });
            res.cookie("refresh_token", refreshToken, {
              httpOnly: true,
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
            roles:user.roles,
            accessToken,
            refreshToken
          };
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
}
