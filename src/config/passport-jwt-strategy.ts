import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import passport from "passport";
import { UserRepository } from "../infrastructure/repository/userRepository";

// Use a fallback value or handle undefined JWT_KEY
const jwtKey = process.env.JWT_KEY || "qw8U4DWxcbsNZXWdjkUYheEzFshbDSNE";

const opts: any = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtKey,
  passReqToCallback: false,
};

passport.use(
  new (JwtStrategy as any)(opts, async (jwt_payload: any, done: any) => {
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
