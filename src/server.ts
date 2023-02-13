require("dotenv").config();
import express, { Express, Request, Response } from "express";
import "./passport";
import passport from "passport";
import session from "express-session";
import { google } from "googleapis";
import cookieParser from "cookie-parser";
import { PropertySummaries } from "./models/serverModels";

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

const analyticsHub = google.analyticshub({
  version: "v1",
  auth: oauth2Client,
});

const analytics = google.analytics({
  version: "v3",
  auth: oauth2Client,
});

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
    // set Login credentials
    const auth = (req.session as any).passport.user.accessToken as string;
    oauth2Client.setCredentials({ access_token: auth });

    // GET  The logged in accounts summeries

    const accountPropertySummaries: PropertySummaries[] = [];
    const response = await analyticsAdmin.accountSummaries.list({
      pageSize: 100,
    });

    const propertySummaries = response.data.accountSummaries?.forEach(
      (element) => {
        element.propertySummaries?.forEach((sum) => {
          const summary: PropertySummaries = {
            property: sum.property as string,
            displayName: sum.displayName as string,
          };
          accountPropertySummaries.push(summary);
        });
        console.log("SUM: ", accountPropertySummaries);
      }
    );

    res.redirect("/analytics");

    /* const accounts = analytics.management.webproperties
      .list({
        accountId: "255221576",
        "max-results": 10,
        "start-index": 1,
      })
      .then((result) => {
        const data = result.data.items?.forEach((d) => {
          d.permissions?.effective?.forEach((p) => {
            console.log("PERMISSIONS: ", p);
          });
        });
        //console.log("RESULT", result.data);
      }); */

    //const apis = google.getSupportedAPIs();

    // Hämtar vem som har properties för produkten //
    /* const response = await analyticsAdmin.properties.get({
      name: "properties/352913873",
    }); */
  }
);

app.get("/analytics", async (req: Request, res: Response) => {
  const auth = (req.session as any).passport.user.accessToken as string;
  oauth2Client.setCredentials({ access_token: auth });

  const data = await analyticsData.properties.runReport({
    property: "properties/352913873",
    requestBody: {
      dateRanges: [
        {
          startDate: "2023-02-08",
          endDate: "2023-02-09",
        },
      ],
      dimensions: [
        {
          name: "city",
        },
      ],
      metrics: [
        {
          name: "totalUsers",
        },
      ],
    },
  });

  data.data.rows?.forEach((metric: any) => console.log("METRIC: ", metric));

  res.send("analytics");
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
