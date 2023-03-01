import { PrismaClient } from "@prisma/client";
import { google } from "googleapis";
import { analyticsFetchChecker } from "../helpers/analyticsFetchChecker";
import { formatDate } from "../helpers/dateHelper";
const prisma = new PrismaClient();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL
);

const analyticsData = google.analyticsdata({
  version: "v1beta",
  auth: oauth2Client,
});

export const getData = async () => {
  const users = await prisma.user.findMany();

  if (users) {
    for (const user of users) {
      // find if user already did todays analyticsfetch
      const jobDone = await analyticsFetchChecker(user);

      // fetch yesterdays data
      if (!jobDone) {
        if (Date.now() > parseInt(user?.expiresIn)) {
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
                  startDate: formatDate(Date.now()),
                  endDate: formatDate(Date.now()),
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

          const GoogleData = await prisma.googleData.create({
            data: {
              userId: user.id,
              date: formatDate(Date.now()),
            },
          });

          if (dimensionHeaders) {
            for (const dH of dimensionHeaders) {
              await prisma.dimensionHeader.create({
                data: {
                  googleDataId: GoogleData.id,
                  name: dH.name,
                },
              });
            }
          }

          if (metricHeaders) {
            for (const mH of metricHeaders) {
              await prisma.metricHeader.create({
                data: {
                  googleDataId: GoogleData.id,
                  name: mH.name,
                  type: mH.type,
                },
              });
            }
          }

          if (rows) {
            for (const row of rows) {
              const Row = await prisma.row.create({
                data: {
                  googleDataId: GoogleData.id,
                },
              });
              if (row.dimensionValues) {
                for (const dV of row.dimensionValues) {
                  await prisma.dimensionValue.create({
                    data: {
                      rowId: Row.id,
                      value: dV.value,
                    },
                  });
                }
              }
              if (row.metricValues) {
                for (const mV of row.metricValues) {
                  await prisma.metricValue.create({
                    data: {
                      rowId: Row.id,
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
      } else {
        console.log("Already fetched todays data");
      }
    }
  } else {
    return;
  }
};

//setInterval(getData, 5000);
