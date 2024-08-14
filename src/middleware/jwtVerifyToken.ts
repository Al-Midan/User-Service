import jwt, { Secret } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET: Secret = process.env.JWT_KEY as Secret;
const JWT_REFRESH_SECRET: Secret = process.env.JWT_REFRESHKEY as Secret;

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const adminverifyToken = (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.headers["authorization"]?.split(" ")[1];
  const refreshToken = req.headers["x-refresh-token"] as string;

  if (!accessToken && !refreshToken) {
    return res
      .status(401)
      .json({ message: "Access token and refresh token not provided" });
  }

  if (accessToken) {
    // Verify the access token
    jwt.verify(accessToken, JWT_SECRET, (err: any, user: any) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ message: "Access token expired" });
        }
        if (err.name === "JsonWebTokenError") {
          req.user = user;
          next();
          return
          // return res.status(403).json({ message: "Malformed token" });
        }
        return res.status(403).json({ message: "Access token is not valid" });
      }

      // req.user = user;
      // next();
    });
  } else {
    // Verify the refresh token
    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err: any, user: any) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ message: "Refresh token expired" });
        }
        return res.status(403).json({ message: "Refresh token is not valid" });
      }

      // Generate a new access token
      const newAccessToken = jwt.sign({ email: user.email }, JWT_SECRET, {
        expiresIn: "1h",
      });

      res.cookie("access_token", newAccessToken, {
        httpOnly: false,
        sameSite: "none",
        secure: false,
        maxAge: 3600000, // 1 hour
      });

      req.user = user;
      next();
    });
  }
};

export default adminverifyToken;