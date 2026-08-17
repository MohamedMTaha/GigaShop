const paymentService = require("./payment.service");

async function stripeWebhook(req, res, next) {
	try {
		const signature = req.headers["stripe-signature"];

		if (!signature) {
			return res.status(400).json({
				success: false,
				message: "Missing Stripe signature",
			});
		}

		await paymentService.handleStripeWebhook(req.body, signature);

		return res.status(200).json({
			received: true,
		});
	} catch (error) {
		next(error);
	}
}

module.exports = {
	stripeWebhook,
};
