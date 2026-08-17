const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createPaymentIntent(amount) {
	return stripe.paymentIntents.create({
		amount: Math.round(amount * 100),
		currency: "egp",
		automatic_payment_methods: {
			enabled: true,
			allow_redirects: "never",
		},
	});
}

function constructWebhookEvent(payload, signature) {
	return stripe.webhooks.constructEvent(
		payload,
		signature,
		process.env.STRIPE_WEBHOOK_SECRET,
	);
}

module.exports = {
	createPaymentIntent,
	constructWebhookEvent,
};
