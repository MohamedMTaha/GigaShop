const express = require("express");

const productController = require("./product.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/authorization.middleware");

const router = express.Router();

// Public

router.get("/", productController.findProducts);

router.get("/:id", productController.findProductById);

// Admin

router.use(authMiddleware);
router.use(authorize("admin"));

router.post("/", productController.createProduct);

router.patch("/:id", productController.updateProduct);

router.patch("/:id/stock", productController.updateProductStock);

router.delete("/:id", productController.softDeleteProduct);

router.patch("/:id/restore", productController.restoreProduct);

module.exports = router;
