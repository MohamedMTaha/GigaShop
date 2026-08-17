const db = require("../../config/db");

const orderRepository = require("./order.repository");
const productRepository = require("../products/product.repository");

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

const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

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

async function updateOrderPaymentStatus(orderId, status) {
	orderId = validateId(orderId, "Order ID");

	status = validateString(status, "Payment status", {
		min: 3,
		max: 20,
	}).toLowerCase();

	if (!PAYMENT_STATUSES.includes(status)) {
		throw new ConflictError("Invalid payment status");
	}

	return db.withTransaction(async (client) => {
		const order = await orderRepository.findOrderByIdForUpdate(orderId, client);

		if (!order) {
			throw new NotFoundError("Order not found");
		}

		if (order.orderStatus === "cancelled") {
			throw new ConflictError(
				"Cancelled order payment status cannot be changed",
			);
		}

		const updatedOrder = await orderRepository.updateOrderPaymentStatus(
			orderId,
			status,
			client,
		);

		if (!updatedOrder) {
			throw new ConflictError("Payment status was not updated");
		}

		return updatedOrder;
	});
}

async function confirmOrder(orderId) {
	orderId = validateId(orderId, "Order ID");

	return db.withTransaction(async (client) => {
		const order = await orderRepository.findOrderByIdForUpdate(orderId, client);

		if (!order) {
			throw new NotFoundError("Order not found");
		}

		validateOrderStatusTransition(order.orderStatus, "confirmed");

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

		const updatedOrder = await orderRepository.updateOrderStatus(
			orderId,
			"delivered",
			client,
		);

		if (!updatedOrder) {
			throw new ConflictError("Order status was not updated");
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

		if (order.paymentMethod === "card" && order.paymentStatus === "paid") {
			throw new ConflictError(
				"Paid card orders cannot be cancelled until refund is implemented",
			);
		}

		validateOrderStatusTransition(order.orderStatus, "cancelled");

		const shouldRestoreStock = order.orderStatus === "confirmed";

		if (shouldRestoreStock) {
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
		}

		const updatedOrder = await orderRepository.updateOrderStatus(
			orderId,
			"cancelled",
			client,
		);

		if (!updatedOrder) {
			throw new ConflictError("Order status was not updated");
		}

		return updatedOrder;
	});
}

module.exports = {
	getOrderById,
	getMyOrders,
	getMyOrder,
	getOrdersByUserId,
	getAllOrders,
	getOrdersByStatus,
	updateOrderPaymentStatus,
	validateOrderStatusTransition,
	confirmOrder,
	shipOrder,
	deliverOrder,
	cancelOrder,
};
