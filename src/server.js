require("dotenv").config();

const express = require("express");
const cors = require("cors");
const ErrorMiddleware = require("./middlewares/error.middleware");

const authRoutes = require("./modules/auth/auth.routes");
const categoryRoutes = require("./modules/categories/category.routes");
const userRoutes = require("./modules/users/user.routes");
const productRoutes = require("./modules/products/product.routes");
const productImageRoutes = require("./modules/product-images/product-image.routes");
const cartRoutes = require("./modules/cart/cart.routes");
const shippingRoutes = require("./modules/shipping/shipping.routes");
const checkoutRoutes = require("./modules/checkout/checkout.routes");
const orderRoutes = require("./modules/orders/order.routes");
const paymentRoutes = require("./modules/payments/payment.routes");

const NotFoundError = require("./errors/NotFoundError");

const app = express();

/*
 * Stripe webhook MUST receive the raw request body.
 * Therefore it must be registered BEFORE express.json().
 */

app.use("/payments", paymentRoutes);

app.use(
	cors({
		origin: ["http://localhost:5173", "https://giga-shop-frontend.vercel.app"],
	}),
);

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/categories", categoryRoutes);
app.use("/users", userRoutes);
app.use("/products", productImageRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/shipping", shippingRoutes);
app.use("/checkout", checkoutRoutes);
app.use("/orders", orderRoutes);

app.get("/", (req, res) => {
	return res.json({
		message: "E-Commerce API is running 🚀",
	});
});

app.get("/test-error", (req, res) => {
	throw new NotFoundError("Test product not found");
});

app.get("/test-crash", (req, res) => {
	throw new Error("Database crashed");
});

app.use(ErrorMiddleware);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
