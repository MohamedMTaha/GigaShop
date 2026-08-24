const db = require("../../config/db");

const orderRepository = require("./order.repository");
const productRepository = require("../products/product.repository");

const stripeService = require("../../services/stripeService");

const NotFoundError = require("../../errors/NotFoundError");
const ConflictError = require("../../errors/ConflictError");

const { validateId, validateString } = require("../../utils/validation");

const ORDER_STATUSES = [
	"pending",
	"confirmed",
	"shipped",
	"delivered",
	"cancelled",
];

function validateOrderStatusTransition(currentStatus, newStatus) {
	const allowedTransitions = {
		pending: ["confirmed", "cancelled"],
		confirmed: ["shipped", "cancelled"],
		shipped: ["delivered"],
		delivered: [],
		cancelled: [],
	};

	const allowed = allowedTransitions[currentStatus] || [];

	if (!allowed.includes(newStatus)) {
		throw new ConflictError(
			`Cannot change order status from "${currentStatus}" to "${newStatus}"`,
		);
	}
}

async function getOrderById(orderId) {
	orderId = validateId(orderId, "Order ID");

	const order = await orderRepository.findOrderById(orderId);

	if (!order) {
		throw new NotFoundError("Order not found");
	}

	return order;
}

async function getMyOrders(userId) {
	userId = validateId(userId, "User ID");

	return orderRepository.findOrdersByUserId(userId);
}

async function getMyOrder(userId, orderId) {
	userId = validateId(userId, "User ID");
	orderId = validateId(orderId, "Order ID");

	const order = await orderRepository.findOrderByIdAndUserId(orderId, userId);

	if (!order) {
		throw new NotFoundError("Order not found");
	}

	return order;
}

async function getOrdersByUserId(userId) {
	userId = validateId(userId, "User ID");

	return orderRepository.findOrdersByUserId(userId);
}

async function getAllOrders() {
	return orderRepository.findAllOrders();
}

async function getOrdersByStatus(status) {
	status = validateString(status, "Order status", {
		min: 3,
		max: 20,
	}).toLowerCase();

	if (!ORDER_STATUSES.includes(status)) {
		throw new ConflictError("Invalid order status");
	}

	return orderRepository.findOrdersByStatus(status);
}

async function confirmOrder(orderId) {
	orderId = validateId(orderId, "Order ID");

	return db.withTransaction(async (client) => {
		const order = await orderRepository.findOrderByIdForUpdate(orderId, client);

		if (!order) {
			throw new NotFoundError("Order not found");
		}

		validateOrderStatusTransition(order.orderStatus, "confirmed");

		/*
		 * Stock was already decreased when the order was created.
		 *
		 * Admin confirmation ONLY changes the order status.
		 *
		 * No stock deduction happens here.
		 */
		const updatedOrder = await orderRepository.updateOrderStatus(
			orderId,
			"confirmed",
			client,
		);

		if (!updatedOrder) {
			throw new ConflictError("Order status was not updated");
		}

		return updatedOrder;
	});
}

async function shipOrder(orderId) {
	orderId = validateId(orderId, "Order ID");

	return db.withTransaction(async (client) => {
		const order = await orderRepository.findOrderByIdForUpdate(orderId, client);

		if (!order) {
			throw new NotFoundError("Order not found");
		}

		validateOrderStatusTransition(order.orderStatus, "shipped");

		const updatedOrder = await orderRepository.updateOrderStatus(
			orderId,
			"shipped",
			client,
		);

		if (!updatedOrder) {
			throw new ConflictError("Order status was not updated");
		}

		return updatedOrder;
	});
}

async function deliverOrder(orderId) {
	orderId = validateId(orderId, "Order ID");

	return db.withTransaction(async (client) => {
		const order = await orderRepository.findOrderByIdForUpdate(orderId, client);

		if (!order) {
			throw new NotFoundError("Order not found");
		}

		validateOrderStatusTransition(order.orderStatus, "delivered");

		let updatedOrder;

		/*
		 * CASH
		 *
		 * Payment is collected when the order is delivered.
		 *
		 * Therefore:
		 * order_status   = delivered
		 * payment_status = paid
		 *
		 * Both changes happen inside the same transaction.
		 */
		if (order.paymentMethod === "cash") {
			updatedOrder = await orderRepository.updateOrderPaymentAndStatus(
				orderId,
				"paid",
				"delivered",
				client,
			);
		} else {
			/*
			 * CARD
			 *
			 * Payment was already completed through Stripe.
			 *
			 * Only the order status changes.
			 */
			updatedOrder = await orderRepository.updateOrderStatus(
				orderId,
				"delivered",
				client,
			);
		}

		if (!updatedOrder) {
			throw new ConflictError("Order was not delivered");
		}

		return updatedOrder;
	});
}

async function cancelOrder(orderId) {
	orderId = validateId(orderId, "Order ID");

	return db.withTransaction(async (client) => {
		const order = await orderRepository.findOrderByIdForUpdate(orderId, client);

		if (!order) {
			throw new NotFoundError("Order not found");
		}

		validateOrderStatusTransition(order.orderStatus, "cancelled");

		/*
		 * CARD + PAID
		 *
		 * The customer already paid through Stripe.
		 *
		 * Refund the payment before completing cancellation.
		 */
		if (order.paymentMethod === "card" && order.paymentStatus === "paid") {
			if (!order.stripePaymentIntentId) {
				throw new ConflictError(
					"Stripe payment intent is missing for this order",
				);
			}

			await stripeService.refundPayment(order.stripePaymentIntentId);
		}

		/*
		 * Stock was already decreased when the order was created.
		 *
		 * Therefore cancellation restores stock.
		 */
		for (const item of order.orderItems) {
			const updatedStock = await productRepository.increaseProductStock(
				item.productId,
				item.quantity,
				client,
			);

			if (updatedStock === null) {
				throw new ConflictError(
					`Failed to restore stock for product "${item.productName}"`,
				);
			}
		}

		let updatedOrder;

		/*
		 * CARD + PAID
		 *
		 * Stripe refund succeeded.
		 */
		if (order.paymentMethod === "card" && order.paymentStatus === "paid") {
			updatedOrder = await orderRepository.updateOrderPaymentAndStatus(
				orderId,
				"refunded",
				"cancelled",
				client,
			);
		} else if (order.paymentMethod === "cash") {
			/*
			 * CASH
			 *
			 * The customer has not paid yet.
			 *
			 * Since the order was cancelled,
			 * the expected cash payment will never happen.
			 */
			updatedOrder = await orderRepository.updateOrderPaymentAndStatus(
				orderId,
				"failed",
				"cancelled",
				client,
			);
		} else {
			updatedOrder = await orderRepository.updateOrderStatus(
				orderId,
				"cancelled",
				client,
			);
		}

		if (!updatedOrder) {
			throw new ConflictError("Order was not cancelled");
		}

		return updatedOrder;
	});
}

async function cancelMyOrder(userId, orderId) {
  await getMyOrder(userId, orderId);
  return cancelOrder(orderId);
}

module.exports = {
	getOrderById,
	getMyOrders,
	getMyOrder,
	getOrdersByUserId,
	getAllOrders,
	getOrdersByStatus,
	validateOrderStatusTransition,
	confirmOrder,
	shipOrder,
	deliverOrder,
  cancelOrder,
  cancelMyOrder,
};
