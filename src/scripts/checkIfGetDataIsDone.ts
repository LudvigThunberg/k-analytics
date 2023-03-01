import { PrismaClient } from "@prisma/client";
import { analyticsFetchChecker } from "../helpers/analyticsFetchChecker";
import { getData } from "./getData";

const prisma = new PrismaClient();

export const checkIfGetDataIsDone = async () => {
  const users = await prisma.user.findMany();

  for (const user of users) {
    const jobDone = await analyticsFetchChecker(user);

    if (!jobDone) {
      getData();
    }
  }
};
