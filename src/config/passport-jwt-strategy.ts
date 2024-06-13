import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import passport from "passport";
import { UserRepository } from "../infrastructure/repository/userRepository";

if (!process.env.JWT_KEY) {
  throw new Error("Environment variable JWT_KEY is not set.");
}

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_KEY,
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload: any, done: any) => {
    try {
      const userRepository = new UserRepository();
      const user = await userRepository.findUserExists(jwt_payload.email);
      console.log("INSIDE", user);

      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  })
);
