import jwt from "jsonwebtoken";

export function generateToken(email: string): string {
  const jwtKey = process.env.JWT_KEY;

  if (!jwtKey) {
    throw new Error("JWT_KEY environment variable is not defined Error From generatejwtToken");
  }

  const accessToken = jwt.sign({ email }, jwtKey,{expiresIn:'1h'});
  return accessToken;
}

export function generateRefreshToken(email: string): string {
  const JWTREFRESHKEY = process.env.JWT_REFRESHKEY;

  if (!JWTREFRESHKEY) {
    throw new Error("JWT_REFRESHKEY environment variable is not defined Error From generatejwtToken");
  }

  const refreshToken = jwt.sign({ email }, JWTREFRESHKEY,{expiresIn:'1d'});
  return refreshToken;
}