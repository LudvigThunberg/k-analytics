require("dotenv").config();
import express, { Express, Request, Response } from "express";
import "./passport";
import passport from "passport";
import session from "express-session";
import { google } from "googleapis";
import cookieParser from "cookie-parser";
import { DatasetsModel, PropertySummaries } from "./models/serverModels";
import { colors } from "./chartColors/colors";

const app: Express = express();
const port = 8000;

const sessionMiddleWare = session({
  secret: "changeMe!!",
  name: "test",
  resave: false,
  saveUninitialized: false,
});

app.use(sessionMiddleWare);
app.use(cookieParser());
app.use(passport.authenticate("session"));

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL
);

const analyticsData = google.analyticsdata({
  version: "v1beta",
  auth: oauth2Client,
});

const analyticsAdmin = google.analyticsadmin({
  version: "v1beta",
  auth: oauth2Client,
});

/* const analyticsHub = google.analyticshub({
  version: "v1",
  auth: oauth2Client,
});

const analytics = google.analytics({
  version: "v3",
  auth: oauth2Client,
}); */

app.get("/", (req: Request, res: Response) => {
  res.send("Hello Express + Typescript");
});

app.get("/error", (req: Request, res: Response) => {
  res.send("ERROR");
});

/* app.get(
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
    // set Login credentials
    const auth = (req.session as any).passport.user.accessToken as string;
    oauth2Client.setCredentials({ access_token: auth });

    res.redirect("/google/properties");
  }
); */

app.get("/google/properties", async (req: Request, res: Response) => {
  const auth = req.headers.authorization;
  oauth2Client.setCredentials({ access_token: auth });

  // GET  The logged in accounts summeries

  const accountPropertySummaries: PropertySummaries[] = [];

  try {
    const response = await analyticsAdmin.accountSummaries.list({
      pageSize: 100,
    });

    response.data.accountSummaries?.forEach((element) => {
      element.propertySummaries?.forEach((sum) => {
        const summary: PropertySummaries = {
          property: sum.property as string,
          displayName: sum.displayName as string,
        };
        accountPropertySummaries.push(summary);
      });

      res.send(accountPropertySummaries);
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/google/analytics/", async (req: Request, res: Response) => {
  const { property, fromDate, toDate, metric, dimension, label } = req.query;

  const auth = req.headers.authorization;
  oauth2Client.setCredentials({ access_token: auth });
  try {
    const queryData = await analyticsData.properties.runReport({
      property: property as string,
      requestBody: {
        dateRanges: [
          {
            startDate: fromDate as string,
            endDate: toDate as string,
          },
        ],
        dimensions: [
          {
            name: dimension as string,
          },
        ],
        metrics: [
          {
            name: metric as string,
          },
        ],
      },
    });

    // package data to work with chart.js
    const color = colors[Math.floor(Math.random() * 140)].rgb;
    const labels: string[] = [];
    const data: number[] = [];
    const dimensionMetric = {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [color],
          label,
        },
      ],
    };

    if (queryData.data.rows) {
      for (let i = 0; i < queryData.data.rows.length; i++) {
        queryData.data.rows[i].dimensionValues?.forEach((dValue) => {
          if (dValue.value) {
            labels.push(dValue.value);
          }
        });
        queryData.data.rows[i].metricValues?.forEach((mValue) => {
          if (mValue.value) {
            data.push(parseInt(mValue.value));
          }
        });
      }
    }

    res.send(dimensionMetric);
  } catch (error) {
    console.log("ERRERROR: ", error);
    res.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
