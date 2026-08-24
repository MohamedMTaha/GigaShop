const express = require("express");

const orderController = require("./order.controller");

const authMiddleware = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/authorization.middleware");

const router = express.Router();

router.use(authMiddleware);

/*
 * ============================================
 * CUSTOMERS
 * ============================================
 */

router.get("/my", orderController.getMyOrders);

router.get("/my/:id", orderController.getMyOrder);

router.post("/user/:id/cancel", orderController.cancelMyOrder);

/*
 * ============================================
 * ADMINS
 * ============================================
 */

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

router.get("/:id", authorize("admin"), orderController.getOrderById);

router.post("/:id/confirm", authorize("admin"), orderController.confirmOrder);

router.post("/:id/ship", authorize("admin"), orderController.shipOrder);

router.post("/:id/deliver", authorize("admin"), orderController.deliverOrder);

router.post("/:id/cancel", authorize("admin"), orderController.cancelOrder);

module.exports = router;
