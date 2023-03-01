import { PrismaClient } from ".prisma/client";
import { NextFunction, Request, Response } from "express";
import { google } from "googleapis";
import { PropertySummaries } from "../models/serverModels";

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

const analyticsAdmin = google.analyticsadmin({
  version: "v1beta",
  auth: oauth2Client,
});

const login = async (req: Request, res: Response) => {
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

  const user = await prisma.user.findUnique({
    where: {
      googleId: googleId,
    },
  });

  if (!user) {
    try {
      // GET logged in users google account properties
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

      const user = await prisma.user.create({
        data: {
          accessToken: accessToken as string,
          refreshToken: refreshToken as string,
          expiresIn: expiresIn as string,
          username: username as string,
          googleId: googleId as string,
        },
      });

      for (const property of accountPropertySummaries) {
        await prisma.propertySummary.create({
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
    res.status(200).send({ message: "Already logged in" });
  }
};

module.exports = {
  login,
};
