import { getData } from "./scripts/getData";
require("dotenv").config();
import express, { Express } from "express";
const googleRouter = require("./routes/googleRoutes");

const app: Express = express();
const port = 8000;

app.use("/google", googleRouter);

getData();

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
