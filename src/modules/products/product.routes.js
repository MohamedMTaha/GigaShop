const express = require("express");

const productController = require("./product.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/authorization.middleware");

const router = express.Router();

// ============================================
// Public list
// ============================================

router.get("/", productController.findProducts);

// ============================================
// Admin
// ============================================

router.get(
	"/admin",
	authMiddleware,
	authorize("admin"),
	productController.findAdminProducts,
);

router.get(
	"/admin/:id",
	authMiddleware,
	authorize("admin"),
	productController.findAdminProductById,
);

router.post(
	"/",
	authMiddleware,
	authorize("admin"),
	productController.createProduct,
);

router.patch(
	"/:id",
	authMiddleware,
	authorize("admin"),
	productController.updateProduct,
);

router.patch(
	"/:id/stock",
	authMiddleware,
	authorize("admin"),
	productController.updateProductStock,
);

router.delete(
	"/:id",
	authMiddleware,
	authorize("admin"),
	productController.softDeleteProduct,
);

router.patch(
	"/:id/restore",
	authMiddleware,
	authorize("admin"),
	productController.restoreProduct,
);

// ============================================
// Public single product
// ============================================

router.get("/:id", productController.findProductById);

module.exports = router;
