const db = require("../../config/db");

const orderRepository = require("../orders/order.repository");
const productRepository = require("../products/product.repository");
const cartRepository = require("../cart/cart.repository");
const userRepository = require("../users/user.repository");
const shippingRepository = require("../shipping/shipping.repository");
const stripeService = require("../../services/stripeService");

const NotFoundError = require("../../errors/NotFoundError");
const ConflictError = require("../../errors/ConflictError");

const {
	validateId,
	validateString,
	validatePaymentMethod,
	validatePhone,
} = require("../../utils/validation");

/*
checkoutData = {
	paymentMethod,
	shippingName,
	shippingPhone,
	shippingGovernorate,
	shippingCity,
	shippingAddressLine
}
*/

async function checkout(userId, checkoutData) {
	userId = validateId(userId, "User ID");

	const paymentMethod = validatePaymentMethod(checkoutData.paymentMethod);

	const shippingName = validateString(
		checkoutData.shippingName,
		"Shipping name",
		{
			min: 2,
			max: 100,
		},
	);

	const shippingPhone = validatePhone(checkoutData.shippingPhone);

	const shippingGovernorate = validateString(
		checkoutData.shippingGovernorate,
		"Shipping governorate",
		{
			min: 2,
			max: 100,
		},
	);

	const shippingCity = validateString(
		checkoutData.shippingCity,
		"Shipping city",
		{
			min: 2,
			max: 100,
		},
	);

	const shippingAddressLine = validateString(
		checkoutData.shippingAddressLine,
		"Shipping address",
		{
			min: 2,
			max: 255,
		},
	);

	const user = await userRepository.findUserById(userId);

	if (!user) {
		throw new NotFoundError("User not found");
	}

	if (user.deletedAt !== null) {
		throw new ConflictError("User is deleted");
	}

	const shippingRate =
		await shippingRepository.findShippingRateByGovernorate(shippingGovernorate);

	if (!shippingRate) {
		throw new NotFoundError("Shipping rate not found");
	}

	const isCard = paymentMethod === "card";

	return db.withTransaction(async (client) => {
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

		const subtotal = cart.items.reduce(
			(sum, item) => sum + Number(item.price) * item.quantity,
			0,
		);

		const shippingFee = Number(shippingRate.shippingFee);

		const totalAmount = subtotal + shippingFee;

		const orderItems = cart.items.map((item) => ({
			productId: item.productId,
			productName: item.name,
			productImageUrl: item.imageUrl,
			priceAtPurchase: item.price,
			quantity: item.quantity,
		}));

		let paymentIntent = null;

		/*
		 * Card:
		 * Create Stripe PaymentIntent only.
		 *
		 * We DO NOT decrease stock here.
		 * Stock will be decreased after Stripe confirms
		 * that the payment succeeded.
		 */
		if (isCard) {
			paymentIntent = await stripeService.createPaymentIntent(totalAmount);
		}

		/*
		 * Cash:
		 * Order stays pending until admin confirms it.
		 *
		 * Card:
		 * Order also stays pending until Stripe webhook
		 * confirms successful payment.
		 */
		const createdOrder = await orderRepository.createOrder(
			{
				user_id: userId,

				order_status: "pending",

				payment_status: "pending",

				payment_method: paymentMethod,

				stripe_payment_intent_id: paymentIntent?.id ?? null,

				subtotal_amount: subtotal,

				shipping_fee: shippingFee,

				shipping_name: shippingName,

				shipping_phone: shippingPhone,

				shipping_governorate: shippingRate.governorateName,

				shipping_city: shippingCity,

				shipping_address_line: shippingAddressLine,
			},
			client,
		);

		await orderRepository.createOrderItems(createdOrder.id, orderItems, client);

		/*
		 * We clear the cart after creating the order.
		 *
		 * The order contains snapshots of all required product data,
		 * so it is independent from the cart afterwards.
		 */
		await cartRepository.clearCart(cart.id, client);

		return {
			...createdOrder,
			totalAmount,

			/*
			 * Only card payments need the client secret.
			 */
			clientSecret: paymentIntent?.client_secret ?? null,
		};
	});
}

module.exports = {
	checkout,
};
