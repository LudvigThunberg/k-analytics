import { PrismaClient, User } from "@prisma/client";
import { formatDate } from "./dateHelper";
const prisma = new PrismaClient();

export const analyticsFetchChecker = async (user: User) => {
  const userData = await prisma.user.findUnique({
    where: {
      googleId: user.googleId,
    },
    include: {
      googleData: true,
    },
  });
  const dd = formatDate(Date.now());
  const gData = userData?.googleData.find((gD) => {
    return gD.date === dd;
  });
  return gData ? true : false;
};
