import passport from "passport";
import passportGoogle from "passport-google-oauth20";

const GoogleStrategy = passportGoogle.Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: "/auth/google/redirect",
      passReqToCallback: true,
    },
    (request, accessToken, refreshToken, profile, done) => {
      const userProfile = { accessToken };
      console.log("Token-Token", userProfile);

      return done(null, userProfile);
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(async (id, done) => {});
