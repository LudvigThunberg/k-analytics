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
const colors_1 = require("./chartColors/colors");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
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
/* const analyticsHub = google.analyticshub({
  version: "v1",
  auth: oauth2Client,
});

const analytics = google.analytics({
  version: "v3",
  auth: oauth2Client,
}); */
app.get("/", (req, res) => {
    res.send("Hello Express + Typescript");
});
app.get("/error", (req, res) => {
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
app.get("/google/properties", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const auth = req.headers.authorization;
    oauth2Client.setCredentials({ access_token: auth });
    // GET  The logged in accounts summeries
    const accountPropertySummaries = [];
    try {
        const response = yield analyticsAdmin.accountSummaries.list({
            pageSize: 100,
        });
        (_a = response.data.accountSummaries) === null || _a === void 0 ? void 0 : _a.forEach((element) => {
            var _a;
            (_a = element.propertySummaries) === null || _a === void 0 ? void 0 : _a.forEach((sum) => {
                const summary = {
                    property: sum.property,
                    displayName: sum.displayName,
                };
                accountPropertySummaries.push(summary);
            });
            res.send(accountPropertySummaries);
        });
    }
    catch (error) {
        res.status(500).send(error);
    }
}));
app.get("/google/analytics/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const { property, fromDate, toDate, metric, dimension, label } = req.query;
    const auth = req.headers.authorization;
    oauth2Client.setCredentials({ access_token: auth });
    try {
        const queryData = yield analyticsData.properties.runReport({
            property: property,
            requestBody: {
                dateRanges: [
                    {
                        startDate: fromDate,
                        endDate: toDate,
                    },
                ],
                dimensions: [
                    {
                        name: dimension,
                    },
                ],
                metrics: [
                    {
                        name: metric,
                    },
                ],
            },
        });
        // package data to work with chart.js
        const color = colors_1.colors[Math.floor(Math.random() * 140)].rgb;
        const labels = [];
        const data = [];
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
                (_b = queryData.data.rows[i].dimensionValues) === null || _b === void 0 ? void 0 : _b.forEach((dValue) => {
                    if (dValue.value) {
                        labels.push(dValue.value);
                    }
                });
                (_c = queryData.data.rows[i].metricValues) === null || _c === void 0 ? void 0 : _c.forEach((mValue) => {
                    if (mValue.value) {
                        data.push(parseInt(mValue.value));
                    }
                });
            }
        }
        res.send(dimensionMetric);
    }
    catch (error) {
        console.log("ERRERROR: ", error);
        res.status(500).send(error);
    }
}));
app.get("/google/credentials", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    // const { accessToken, refreshToken, expiresIn, username } = req.headers;
    const accessToken = req.headers.accesstoken;
    const refreshToken = req.headers.refreshtoken;
    const expiresIn = req.headers.expiresin;
    const username = req.headers.username;
    const googleId = req.headers.googleid;
    oauth2Client.setCredentials({ access_token: accessToken });
    if (Date.now() > parseInt(expiresIn)) {
        console.log("Expired!!!!");
        oauth2Client.setCredentials({
            refresh_token: refreshToken,
        });
    }
    // GET logged in user google account properties
    const user = yield prisma.userData.findUnique({
        where: {
            googleId: googleId,
        },
    });
    if (!user) {
        try {
            const response = yield analyticsAdmin.accountSummaries.list({
                pageSize: 100,
            });
            const accountPropertySummaries = [];
            (_d = response.data.accountSummaries) === null || _d === void 0 ? void 0 : _d.forEach((element) => {
                var _a;
                (_a = element.propertySummaries) === null || _a === void 0 ? void 0 : _a.forEach((sum) => {
                    const summary = {
                        property: sum.property,
                        displayName: sum.displayName,
                    };
                    accountPropertySummaries.push(summary);
                });
            });
            const user = yield prisma.userData.create({
                data: {
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    expiresIn: expiresIn,
                    username: username,
                    googleId: googleId,
                },
            });
            for (const property of accountPropertySummaries) {
                yield prisma.propertySummaries.create({
                    data: {
                        displayName: property.displayName,
                        property: property.property,
                        userId: user.id,
                    },
                });
            }
            res.sendStatus(200);
        }
        catch (error) {
            console.log("ERROR", error);
            res.send(error);
        }
    }
    else {
        res.status(200).send({ message: "Logged in" });
    }
}));
const testDb = () => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.propertySummaries.deleteMany();
    yield prisma.userData.deleteMany();
    console.log("DEL");
});
// setInterval(testDb, 5000);
app.get("/google/get-data", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const assessToken = process.env.GOOGLE_ACCESS_TOKEN;
    const expiresIn = parseInt(process.env.GOOGLE_EXPIRES_IN);
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    if (Date.now() > expiresIn) {
        console.log("Expired!!!!");
        oauth2Client.setCredentials({
            refresh_token: refreshToken,
        });
    }
    else {
        oauth2Client.setCredentials({ access_token: assessToken });
    }
    console.log("Date.now:", Date.now());
    console.log("EXPIRES_IN:", expiresIn);
    try {
        const queryData = yield analyticsData.properties.runReport({
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
    }
    catch (error) {
        console.log("ERRERROR: ", error);
        res.status(500).send(error);
    }
}));
const getData = () => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma.userData.findFirst();
    console.log("USERSR", user);
    if (user) {
        if (Date.now() > parseInt(user === null || user === void 0 ? void 0 : user.expiresIn)) {
            console.log("Expired!!!!");
            oauth2Client.setCredentials({
                refresh_token: user.refreshToken,
            });
        }
        else {
            oauth2Client.setCredentials({ access_token: user.accessToken });
        }
        try {
            const queryData = yield analyticsData.properties.runReport({
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
            const TestData = yield prisma.testData.create({
                data: {
                    userId: user.id,
                },
            });
            const DimensionHeaders = yield prisma.dimensionHeaders.create({
                data: {
                    testDataId: TestData.id,
                },
            });
            const MetricHeaders = yield prisma.metricHeaders.create({
                data: {
                    testDataId: TestData.id,
                },
            });
            const Rows = yield prisma.rows.create({
                data: {
                    testDataId: TestData.id,
                },
            });
            if (dimensionHeaders) {
                for (const dh of dimensionHeaders) {
                    yield prisma.dimensionHeadersValue.create({
                        data: {
                            dimensionHeadersId: DimensionHeaders.id,
                            name: dh.name,
                        },
                    });
                }
            }
            if (metricHeaders) {
                for (const mh of metricHeaders) {
                    yield prisma.metricHeadersValue.create({
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
                    const Data = yield prisma.data.create({
                        data: {
                            rowsId: Rows.id,
                        },
                    });
                    if (row.dimensionValues) {
                        for (const dV of row.dimensionValues) {
                            yield prisma.dimensionValues.create({
                                data: {
                                    dataId: Data.id,
                                    value: dV.value,
                                },
                            });
                        }
                    }
                    if (row.metricValues) {
                        for (const mV of row.metricValues) {
                            yield prisma.metricValues.create({
                                data: {
                                    dataId: Data.id,
                                    value: mV.value,
                                },
                            });
                        }
                    }
                }
            }
        }
        catch (error) {
            console.log("ERRERROR: ", error);
        }
    }
});
//setInterval(getData, 10000);
app.get;
app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
