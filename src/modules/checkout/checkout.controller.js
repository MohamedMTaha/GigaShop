const checkoutService = require("./checkout.service");

async function checkout(req, res, next) {
	try {
		const order = await checkoutService.checkout(Number(req.user.id), req.body);

		return res.status(201).json({
			success: true,
			message: "Order created successfully",
			data: order,
		});
	} catch (error) {
		next(error);
	}
}

module.exports = {
	checkout,
};
