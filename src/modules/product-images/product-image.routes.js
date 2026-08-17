const express = require("express");

const imageController = require("./product-image.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/authorization.middleware");
const upload = require("../../middlewares/upload.middleware");

const router = express.Router();

// Public

router.get("/:id/images", imageController.getProductImages);

// Admin

router.post(
	"/:id/images",
	authMiddleware,
	authorize("admin"),
	upload.array("images", 5),
	imageController.addProductImage,
);

router.patch(
	"/:id/images",
	authMiddleware,
	authorize("admin"),
	upload.array("images", 5),
	imageController.replaceProductImages,
);

router.delete(
	"/:id/images/:imageId",
	authMiddleware,
	authorize("admin"),
	imageController.removeProductImage,
);

module.exports = router;
