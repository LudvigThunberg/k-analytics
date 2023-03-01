import express from "express";
const router = express.Router();
const googleController = require("../controllers/googleController");

router.get("/login", googleController.login);

module.exports = router;
