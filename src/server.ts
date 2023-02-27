require("dotenv").config();
import express, { Express, Request, Response } from "express";
import "./passport";
import passport from "passport";
import session from "express-session";
import { google } from "googleapis";
import cookieParser from "cookie-parser";
import { DatasetsModel, PropertySummaries } from "./models/serverModels";
import { colors } from "./chartColors/colors";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
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

app.get("/google/credentials", async (req: Request, res: Response) => {
  // const { accessToken, refreshToken, expiresIn, username } = req.headers;
  const accessToken = req.headers.accesstoken as string;
  const refreshToken = req.headers.refreshtoken as string;
  const expiresIn = req.headers.expiresin as string;
  const username = req.headers.username as string;
  const googleId = req.headers.googleid as string;

  oauth2Client.setCredentials({ access_token: accessToken });
  if (Date.now() > parseInt(expiresIn)) {
    console.log("Expired!!!!");
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });
  }

  // GET logged in user google account properties

  const user = await prisma.userData.findUnique({
    where: {
      googleId: googleId,
    },
  });

  if (!user) {
    try {
      const response = await analyticsAdmin.accountSummaries.list({
        pageSize: 100,
      });

      const accountPropertySummaries: PropertySummaries[] = [];
      response.data.accountSummaries?.forEach((element) => {
        element.propertySummaries?.forEach((sum) => {
          const summary: PropertySummaries = {
            property: sum.property as string,
            displayName: sum.displayName as string,
          };
          accountPropertySummaries.push(summary);
        });
      });

      const user = await prisma.userData.create({
        data: {
          accessToken: accessToken as string,
          refreshToken: refreshToken as string,
          expiresIn: expiresIn as string,
          username: username as string,
          googleId: googleId as string,
        },
      });

      for (const property of accountPropertySummaries) {
        await prisma.propertySummaries.create({
          data: {
            displayName: property.displayName,
            property: property.property,
            userId: user.id,
          },
        });
      }
      res.sendStatus(200);
    } catch (error) {
      console.log("ERROR", error);
      res.send(error);
    }
  } else {
    res.status(200).send({ message: "Logged in" });
  }
});

const testDb = async () => {
  await prisma.propertySummaries.deleteMany();
  await prisma.userData.deleteMany();

  console.log("DEL");
};

// setInterval(testDb, 5000);

app.get("/google/get-data", async (req: Request, res: Response) => {
  const assessToken = process.env.GOOGLE_ACCESS_TOKEN as string;
  const expiresIn = parseInt(process.env.GOOGLE_EXPIRES_IN as string);
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN as string;

  if (Date.now() > expiresIn) {
    console.log("Expired!!!!");
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });
  } else {
    oauth2Client.setCredentials({ access_token: assessToken });
  }

  console.log("Date.now:", Date.now());
  console.log("EXPIRES_IN:", expiresIn);

  try {
    const queryData = await analyticsData.properties.runReport({
      property: process.env.GOOGLE_PROPERTY_ID,
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

    console.log("queryData", queryData.data);
    res.status(200).send(queryData.data);
  } catch (error) {
    console.log("ERRERROR: ", error);
    res.status(500).send(error);
  }
});

const getData = async () => {
  const user = await prisma.userData.findFirst();

  console.log("USERSR", user);

  if (user) {
    if (Date.now() > parseInt(user?.expiresIn)) {
      console.log("Expired!!!!");
      oauth2Client.setCredentials({
        refresh_token: user.refreshToken,
      });
    } else {
      oauth2Client.setCredentials({ access_token: user.accessToken });
    }

    try {
      const queryData = await analyticsData.properties.runReport({
        property: process.env.GOOGLE_PROPERTY_ID,
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

      const dimensionHeaders = queryData.data.dimensionHeaders;
      const metricHeaders = queryData.data.metricHeaders;
      const rows = queryData.data.rows;

      const TestData = await prisma.testData.create({
        data: {
          userId: user.id,
        },
      });

      const DimensionHeaders = await prisma.dimensionHeaders.create({
        data: {
          testDataId: TestData.id,
        },
      });

      const MetricHeaders = await prisma.metricHeaders.create({
        data: {
          testDataId: TestData.id,
        },
      });

      const Rows = await prisma.rows.create({
        data: {
          testDataId: TestData.id,
        },
      });

      if (dimensionHeaders) {
        for (const dh of dimensionHeaders) {
          await prisma.dimensionHeadersValue.create({
            data: {
              dimensionHeadersId: DimensionHeaders.id,
              name: dh.name,
            },
          });
        }
      }

      if (metricHeaders) {
        for (const mh of metricHeaders) {
          await prisma.metricHeadersValue.create({
            data: {
              metricHeadersId: MetricHeaders.id,
              name: mh.name,
              type: mh.type,
            },
          });
        }
      }

      if (rows) {
        for (const row of rows) {
          const Data = await prisma.data.create({
            data: {
              rowsId: Rows.id,
            },
          });
          if (row.dimensionValues) {
            for (const dV of row.dimensionValues) {
              await prisma.dimensionValues.create({
                data: {
                  dataId: Data.id,
                  value: dV.value,
                },
              });
            }
          }
          if (row.metricValues) {
            for (const mV of row.metricValues) {
              await prisma.metricValues.create({
                data: {
                  dataId: Data.id,
                  value: mV.value,
                },
              });
            }
          }
        }
      }
    } catch (error) {
      console.log("ERRERROR: ", error);
    }
  }
};

//setInterval(getData, 10000);

app.get;

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
