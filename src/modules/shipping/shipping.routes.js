const express = require("express");

const shippingController = require("./shipping.controller");

const authMiddleware = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/authorization.middleware");

const router = express.Router();

// Public
router.get("/", shippingController.getShippingRates);

router.get("/:governorate", shippingController.getShippingRate);

// Admin only
router.use(authMiddleware);
router.use(authorize("admin"));

router.post("/", shippingController.createShippingRate);

router.patch("/:id", shippingController.updateShippingRate);

router.delete("/:id", shippingController.deleteShippingRate);

module.exports = router;
