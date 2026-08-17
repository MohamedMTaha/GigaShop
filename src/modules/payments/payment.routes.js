const express = require("express");

const paymentController = require("./payment.controller");

const router = express.Router();

router.post(
	"/stripe/webhook",
	express.raw({ type: "application/json" }),
	paymentController.stripeWebhook,
);

module.exports = router;
