// Import required modules and setup passport
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20"

console.log(process.env.GOOGLE_CLIENT_ID);


passport.use(
  new GoogleStrategy(
    {
      clientID:process.env.GOOGLE_CLIENT_ID || " ",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || " ",
      callbackURL: "http://localhost:5000/user-service/auth/google/callback",
      scope: ["profile", "email"],
    },
    async function (accessToken, refreshToken, profile, done) {
      return done(null, profile)
    }
  )
);

// Serialize and deserialize user functions
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user: Express.User, done) => {
  done(null, user);
});

export default passport