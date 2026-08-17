const express = require("express");

const categoryController = require("./category.controller");

const authMiddleware = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/authorization.middleware");

const router = express.Router();

// Public
router.get("/", categoryController.findCategories);
router.get("/:id", categoryController.findCategoryById);

// Admin
router.use(authMiddleware);
router.use(authorize("admin"));

router.post("/", categoryController.createCategory);

router.delete("/:id", categoryController.softDeleteCategory);

router.patch("/:id/restore", categoryController.restoreCategory);

module.exports = router;
