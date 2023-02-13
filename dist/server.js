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
require("./passport");
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const googleapis_1 = require("googleapis");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = (0, express_1.default)();
const port = 8000;
const sessionMiddleWare = (0, express_session_1.default)({
    secret: "changeMe!!",
    name: "test",
    resave: false,
    saveUninitialized: false,
});
app.use(sessionMiddleWare);
app.use((0, cookie_parser_1.default)());
app.use(passport_1.default.authenticate("session"));
const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URL);
const analyticsData = googleapis_1.google.analyticsdata({
    version: "v1beta",
    auth: oauth2Client,
});
const analyticsAdmin = googleapis_1.google.analyticsadmin({
    version: "v1beta",
    auth: oauth2Client,
});
const analyticsHub = googleapis_1.google.analyticshub({
    version: "v1",
    auth: oauth2Client,
});
const analytics = googleapis_1.google.analytics({
    version: "v3",
    auth: oauth2Client,
});
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
    var _a;
    // set Login credentials
    const auth = req.session.passport.user.accessToken;
    oauth2Client.setCredentials({ access_token: auth });
    const accounts = analytics.management.webproperties
        .list({
        accountId: "255221576",
        "max-results": 10,
        "start-index": 1,
    })
        .then((result) => {
        var _a;
        const data = (_a = result.data.items) === null || _a === void 0 ? void 0 : _a.forEach((d) => {
            var _a, _b;
            (_b = (_a = d.permissions) === null || _a === void 0 ? void 0 : _a.effective) === null || _b === void 0 ? void 0 : _b.forEach((p) => {
                console.log("PERMISSIONS: ", p);
            });
        });
        //console.log("RESULT", result.data);
    });
    // GET  The logged in accounts summeries
    const accountPropertySummaries = [];
    const response = yield analyticsAdmin.accountSummaries.list({
        pageSize: 100,
    });
    const propertySummaries = (_a = response.data.accountSummaries) === null || _a === void 0 ? void 0 : _a.forEach((element) => {
        var _a;
        (_a = element.propertySummaries) === null || _a === void 0 ? void 0 : _a.forEach((sum) => {
            const summary = {
                property: sum.property,
                displayName: sum.displayName,
            };
            accountPropertySummaries.push(summary);
        });
        console.log("SUM: ", accountPropertySummaries);
    });
    //const apis = google.getSupportedAPIs();
    // Hämtar vem som har properties för produkten //
    /* const response = await analyticsAdmin.properties.get({
      name: "properties/352913873",
    }); */
    res.redirect("/analytics");
}));
app.get("/analytics", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const auth = req.session.passport.user.accessToken;
    oauth2Client.setCredentials({ access_token: auth });
    const data = yield analyticsData.properties.runReport({
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
    (_b = data.data.rows) === null || _b === void 0 ? void 0 : _b.forEach((metric) => console.log("METRIC: ", metric));
    res.send("analytics");
}));
app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
