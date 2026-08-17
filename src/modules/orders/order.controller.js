const orderService = require("./order.service");

async function getMyOrders(req, res, next) {
	try {
		const orders = await orderService.getMyOrders(Number(req.user.id));

		return res.status(200).json({
			success: true,
			data: orders,
		});
	} catch (error) {
		next(error);
	}
}

async function getMyOrder(req, res, next) {
	try {
		const order = await orderService.getMyOrder(
			Number(req.user.id),
			Number(req.params.id),
		);

		return res.status(200).json({
			success: true,
			data: order,
		});
	} catch (error) {
		next(error);
	}
}

async function getOrderById(req, res, next) {
	try {
		const order = await orderService.getOrderById(Number(req.params.id));

		return res.status(200).json({
			success: true,
			data: order,
		});
	} catch (error) {
		next(error);
	}
}

async function getOrdersByUserId(req, res, next) {
	try {
		const orders = await orderService.getOrdersByUserId(
			Number(req.params.userId),
		);

		return res.status(200).json({
			success: true,
			data: orders,
		});
	} catch (error) {
		next(error);
	}
}

async function getAllOrders(req, res, next) {
	try {
		const orders = await orderService.getAllOrders();

		return res.status(200).json({
			success: true,
			data: orders,
		});
	} catch (error) {
		next(error);
	}
}

async function getOrdersByStatus(req, res, next) {
	try {
		const orders = await orderService.getOrdersByStatus(req.params.status);

		return res.status(200).json({
			success: true,
			data: orders,
		});
	} catch (error) {
		next(error);
	}
}

async function updateOrderPaymentStatus(req, res, next) {
	try {
		const order = await orderService.updateOrderPaymentStatus(
			Number(req.params.id),
			req.body.status,
		);

		return res.status(200).json({
			success: true,
			message: "Order payment status updated successfully",
			data: order,
		});
	} catch (error) {
		next(error);
	}
}

async function confirmOrder(req, res, next) {
	try {
		const order = await orderService.confirmOrder(Number(req.params.id));

		return res.status(200).json({
			success: true,
			message: "Order confirmed successfully",
			data: order,
		});
	} catch (error) {
		next(error);
	}
}

async function shipOrder(req, res, next) {
	try {
		const order = await orderService.shipOrder(Number(req.params.id));

		return res.status(200).json({
			success: true,
			message: "Order shipped successfully",
			data: order,
		});
	} catch (error) {
		next(error);
	}
}

async function deliverOrder(req, res, next) {
	try {
		const order = await orderService.deliverOrder(Number(req.params.id));

		return res.status(200).json({
			success: true,
			message: "Order delivered successfully",
			data: order,
		});
	} catch (error) {
		next(error);
	}
}

async function cancelOrder(req, res, next) {
	try {
		const order = await orderService.cancelOrder(Number(req.params.id));

		return res.status(200).json({
			success: true,
			message: "Order cancelled successfully",
			data: order,
		});
	} catch (error) {
		next(error);
	}
}

module.exports = {
	getMyOrders,
	getMyOrder,
	getOrderById,
	getOrdersByUserId,
	getAllOrders,
	getOrdersByStatus,
	updateOrderPaymentStatus,
	confirmOrder,
	shipOrder,
	deliverOrder,
	cancelOrder,
};
