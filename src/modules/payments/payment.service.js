const db = require("../../config/db");

const stripeService = require("../../services/stripeService");

const orderRepository = require("../orders/order.repository");
const productRepository = require("../products/product.repository");
const cartRepository = require("../cart/cart.repository");
const userRepository = require("../users/user.repository");
const shippingRepository = require("../shipping/shipping.repository");

const NotFoundError = require("../../errors/NotFoundError");
const ConflictError = require("../../errors/ConflictError");

async function handleStripeWebhook(payload, signature) {
	const event = stripeService.constructWebhookEvent(payload, signature);

	switch (event.type) {
		case "payment_intent.succeeded":
			await handlePaymentSucceeded(event.data.object);
			break;

		case "payment_intent.payment_failed":
			await handlePaymentFailed(event.data.object);
			break;

		default:
			break;
	}
}

async function handlePaymentSucceeded(paymentIntent) {
	return db.withTransaction(async (client) => {
		const existingOrder =
			await orderRepository.findOrderByStripePaymentIntentId(
				paymentIntent.id,
				client,
			);

		if (existingOrder) {
			return existingOrder;
		}

		const metadata = paymentIntent.metadata || {};

		const userId = Number(metadata.userId);

		if (!Number.isInteger(userId) || userId <= 0) {
			throw new ConflictError("Invalid payment user");
		}

		const shippingPhone = metadata.shippingPhone;
		const shippingGovernorate = metadata.shippingGovernorate;
		const shippingCity = metadata.shippingCity;
		const shippingAddressLine = metadata.shippingAddressLine;

		if (
			!shippingPhone ||
			!shippingGovernorate ||
			!shippingCity ||
			!shippingAddressLine
		) {
			throw new ConflictError(
				"Payment is missing required shipping information",
			);
		}

		const user = await userRepository.findUserById(userId);

		if (!user) {
			throw new NotFoundError("User not found");
		}

		if (user.deletedAt !== null) {
			throw new ConflictError("User is deleted");
		}

		const cart = await cartRepository.findCartDetailsForUpdate(userId, client);

		if (!cart) {
			throw new NotFoundError("Cart not found");
		}

		if (cart.items.length === 0) {
			throw new ConflictError("Cart is empty");
		}

		for (const item of cart.items) {
			if (item.status === "deleted") {
				throw new ConflictError(`Product "${item.name}" is deleted`);
			}

			if (item.quantity > item.stock) {
				throw new ConflictError(`Not enough stock for product "${item.name}"`);
			}
		}

		const shippingRate =
			await shippingRepository.findShippingRateByGovernorate(
				shippingGovernorate,
			);

		if (!shippingRate) {
			throw new NotFoundError("Shipping rate not found");
		}

		const subtotal = cart.items.reduce(
			(sum, item) => sum + Number(item.price) * item.quantity,
			0,
		);

		const shippingFee = Number(shippingRate.shippingFee);

		const totalAmount = subtotal + shippingFee;

		const expectedStripeAmount = Math.round(totalAmount * 100);

		if (paymentIntent.amount !== expectedStripeAmount) {
			throw new ConflictError("Payment amount does not match order total");
		}

		const orderItems = cart.items.map((item) => ({
			productId: item.productId,
			productName: item.name,
			productImageUrl: item.imageUrl,
			priceAtPurchase: item.price,
			quantity: item.quantity,
		}));

		for (const item of cart.items) {
			const updatedStock = await productRepository.decreaseProductStock(
				item.productId,
				item.quantity,
				client,
			);

			if (updatedStock === null) {
				throw new ConflictError(`Not enough stock for product "${item.name}"`);
			}
		}

		const createdOrder = await orderRepository.createOrder(
			{
				user_id: userId,

				order_status: "pending",

				payment_status: "paid",

				payment_method: "card",

				stripe_payment_intent_id: paymentIntent.id,

				subtotal_amount: subtotal,

				shipping_fee: shippingFee,

				shipping_name: `${user.firstName} ${user.lastName}`,

				shipping_phone: shippingPhone,

				shipping_governorate: shippingRate.governorateName,

				shipping_city: shippingCity,

				shipping_address_line: shippingAddressLine,
			},
			client,
		);

		await orderRepository.createOrderItems(createdOrder.id, orderItems, client);

		await cartRepository.clearCart(cart.id, client);

		return {
			...createdOrder,
			totalAmount,
		};
	});
}

async function handlePaymentFailed(paymentIntent) {
	return {
		paymentIntentId: paymentIntent.id,
		paymentStatus: "failed",
	};
}

module.exports = {
	handleStripeWebhook,
};
