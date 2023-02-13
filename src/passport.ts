import passport from "passport";
import passportGoogle from "passport-google-oauth20";

const GoogleStrategy = passportGoogle.Strategy;

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(async (user: Express.User, done) => {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: "/auth/google/redirect",
      passReqToCallback: true,
    },
    (request, accessToken, refreshToken, profile, done) => {
      const userProfile = { accessToken, profile };

      return done(null, userProfile);
    }
  )
);
