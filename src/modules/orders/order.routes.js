const express = require("express");

const orderController = require("./order.controller");

const authMiddleware = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/authorization.middleware");

const router = express.Router();

router.use(authMiddleware);

// Customers

router.get("/my", orderController.getMyOrders);

router.get("/my/:id", orderController.getMyOrder);

// Admins

router.get("/", authorize("admin"), orderController.getAllOrders);

router.get(
	"/status/:status",
	authorize("admin"),
	orderController.getOrdersByStatus,
);

router.get(
	"/user/:userId",
	authorize("admin"),
	orderController.getOrdersByUserId,
);

router.post("/:id/ship", authorize("admin"), orderController.shipOrder);

router.post("/:id/deliver", authorize("admin"), orderController.deliverOrder);

router.get("/:id", authorize("admin"), orderController.getOrderById);

router.post("/:id/confirm", authorize("admin"), orderController.confirmOrder);

router.post("/:id/cancel", authorize("admin"), orderController.cancelOrder);

router.patch(
	"/:id/payment-status",
	authorize("admin"),
	orderController.updateOrderPaymentStatus,
);

module.exports = router;
