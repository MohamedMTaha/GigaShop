const express = require("express");

const checkoutController = require("./checkout.controller");

const authMiddleware = require("../../middlewares/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", checkoutController.checkout);

module.exports = router;
