require("dotenv").config();
import express, { Express, Request, Response } from "express";
const propertyId = process.env.GA4_PROPERTY_ID;
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import "./passport";
import passport from "passport";
import session from "express-session";
import { google } from "googleapis";
const analytics = google.analytics("v3");
const app: Express = express();
const port = 8000;

const sessionMiddleWare = session({
  secret: "changeMe!!",
  name: "test",
  resave: false,
  saveUninitialized: false,
});

app.use(sessionMiddleWare);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello Express + Typescript");
});

app.get("/error", (req: Request, res: Response) => {
  res.send("ERROR");
});

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: [
      "email",
      "profile",
      "https://www.googleapis.com/auth/analytics.readonly",
      "https://www.googleapis.com/auth/analytics",
      "https://www.googleapis.com/auth/logging.read",
    ],
  })
);

app.get(
  "/auth/google/redirect",
  passport.authenticate("google", { failureRedirect: "/error" }),
  async (req: Request, res: Response) => {
    /* const response = analytics.data.ga.get({ids: `ga:${viewId}`,
    'start-date': startDate,
    'end-date': endDate,
    metrics: metric,}) */
    /* const auth = (req.session as any).passport.user.accessToken as string;

    const getAnalyticsViewId = async () => {
      const analytics = google.analytics("v3");
      const response = await analytics.management.accounts.list({ auth });
      const accounts = response.data.items;

      if (accounts?.length === 0) {
        return;
      }

      return accounts;
    };

    const accounts = getAnalyticsViewId();

    console.log("accounts", accounts); */
    /* const response = analytics.management.profiles.list();
    console.log("response", response); */

    res.redirect("/analytics");
  }
);

app.get("/analytics", (req: Request, res: Response) => {
  const auth = (req.session as any).passport.user.accessToken as string;

  const getAnalyticsViewId = async () => {
    const analytics = google.analytics("v3");
    const response = await analytics.management.accounts.list({ auth });
    const accounts = response.data.items;

    if (accounts?.length === 0) {
      return;
    }

    return accounts;
  };

  const accounts = getAnalyticsViewId();
  console.log("accounts", accounts);
  res.send("analytics");
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
