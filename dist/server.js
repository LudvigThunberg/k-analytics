"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getData_1 = require("./scripts/getData");
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const googleRouter = require("./routes/googleRoutes");
const app = (0, express_1.default)();
const port = 8000;
app.use("/google", googleRouter);
(0, getData_1.getData)();
app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
