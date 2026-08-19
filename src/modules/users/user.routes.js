const express = require("express");

const userController = require("./user.controller");

const authMiddleware = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/authorization.middleware");

const router = express.Router();

router.use(authMiddleware);

// My Account
router.get("/me", userController.getMyProfile);
router.patch("/me", userController.updateMyProfile);
router.patch("/me/password", userController.updateMyPassword);
router.delete("/me", userController.deleteMyAccount);

// Admin / User Management
router.get("/", authorize("admin"), userController.findAllUsers);

router.get("/search", authorize("admin"), userController.findUserByEmail);

router.get("/deleted", authorize("admin"), userController.findDeletedUsers);

router.get("/:id", authorize("admin"), userController.findUserByIdForAdmin);

module.exports = router;
