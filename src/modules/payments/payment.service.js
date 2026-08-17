const db = require("../../config/db");

const stripeService = require("../../services/stripeService");

const orderRepository = require("../orders/order.repository");
const productRepository = require("../products/product.repository");

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
		const order = await orderRepository.findOrderByStripePaymentIntentId(
			paymentIntent.id,
			client,
		);

		if (!order) {
			throw new NotFoundError("Order not found");
		}

		/*
		 * Webhooks can sometimes be delivered more than once.
		 *
		 * If the order is already paid, do nothing.
		 */
		if (order.paymentStatus === "paid") {
			return order;
		}

		if (order.orderStatus === "cancelled") {
			throw new ConflictError("Cannot complete payment for a cancelled order");
		}

		/*
		 * Decrease stock only after Stripe confirms
		 * that the payment actually succeeded.
		 */
		for (const item of order.orderItems) {
			const updatedStock = await productRepository.decreaseProductStock(
				item.productId,
				item.quantity,
				client,
			);

			if (updatedStock === null) {
				throw new ConflictError(
					`Not enough stock for product "${item.productName}"`,
				);
			}
		}

		const updatedOrder = await orderRepository.updateOrderPaymentAndStatus(
			order.id,
			"paid",
			"confirmed",
			client,
		);

		if (!updatedOrder) {
			throw new ConflictError("Order was not updated");
		}

		return updatedOrder;
	});
}

async function handlePaymentFailed(paymentIntent) {
	return db.withTransaction(async (client) => {
		const order = await orderRepository.findOrderByStripePaymentIntentId(
			paymentIntent.id,
			client,
		);

		if (!order) {
			throw new NotFoundError("Order not found");
		}

		/*
		 * If the payment was already handled, don't modify it.
		 */
		if (order.paymentStatus === "paid") {
			return order;
		}

		const updatedOrder = await orderRepository.updateOrderPaymentStatus(
			order.id,
			"failed",
			client,
		);

		if (!updatedOrder) {
			throw new ConflictError("Payment status was not updated");
		}

		return updatedOrder;
	});
}

module.exports = {
	handleStripeWebhook,
};
