const express = require("express");

const cartController = require("./cart.controller");
const authMiddleware = require("../../middlewares/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", cartController.getCart);

router.post("/items", cartController.addItemToCart);

router.patch("/items/:productId", cartController.updateCartItemQuantity);

router.delete("/items/:productId", cartController.removeItemFromCart);

router.delete("/", cartController.clearCart);

module.exports = router;
