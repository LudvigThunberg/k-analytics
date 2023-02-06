"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const propertyId = process.env.GA4_PROPERTY_ID;
require("./passport");
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const googleapis_1 = require("googleapis");
const analytics = googleapis_1.google.analytics("v3");
const app = (0, express_1.default)();
const port = 8000;
const sessionMiddleWare = (0, express_session_1.default)({
    secret: "changeMe!!",
    name: "test",
    resave: false,
    saveUninitialized: false,
});
app.use(sessionMiddleWare);
app.get("/", (req, res) => {
    res.send("Hello Express + Typescript");
});
app.get("/error", (req, res) => {
    res.send("ERROR");
});
app.get("/auth/google", passport_1.default.authenticate("google", {
    scope: [
        "email",
        "profile",
        "https://www.googleapis.com/auth/analytics.readonly",
        "https://www.googleapis.com/auth/analytics",
        "https://www.googleapis.com/auth/logging.read",
    ],
}));
app.get("/auth/google/redirect", passport_1.default.authenticate("google", { failureRedirect: "/error" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
}));
app.get("/analytics", (req, res) => {
    const auth = req.session.passport.user.accessToken;
    const getAnalyticsViewId = () => __awaiter(void 0, void 0, void 0, function* () {
        const analytics = googleapis_1.google.analytics("v3");
        const response = yield analytics.management.accounts.list({ auth });
        const accounts = response.data.items;
        if ((accounts === null || accounts === void 0 ? void 0 : accounts.length) === 0) {
            return;
        }
        return accounts;
    });
    const accounts = getAnalyticsViewId();
    console.log("accounts", accounts);
    res.send("analytics");
});
app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
