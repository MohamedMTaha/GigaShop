const cartService = require("./cart.service");

async function getCart(req, res) {
	const userId = req.user.id;

	const cart = await cartService.getCart(userId);

	return res.status(200).json({
		success: true,
		data: cart,
	});
}

async function addItemToCart(req, res) {
	const userId = req.user.id;
	const { productId, quantity } = req.body;

	await cartService.addItemToCart(userId, productId, quantity);

	const cart = await cartService.getCart(userId);

	return res.status(201).json({
		success: true,
    message: "Product added to cart successfully",
    cart,
	});
}

async function updateCartItemQuantity(req, res) {
	const userId = req.user.id;
	const productId = Number(req.params.productId);
	const { quantity } = req.body;

	await cartService.updateCartItemQuantity(userId, productId, quantity);

	const cart = await cartService.getCart(userId);

	return res.status(200).json({
		success: true,
    message: "Cart item quantity updated successfully",
    cart,
	});
}

async function removeItemFromCart(req, res) {
	const userId = req.user.id;
	const productId = Number(req.params.productId);

  await cartService.removeItemFromCart(userId, productId);

 	const cart = await cartService.getCart(userId);


	return res.status(200).json({
		success: true,
    message: "Item removed from cart successfully",
		cart
	});
}

async function clearCart(req, res) {
	const userId = req.user.id;

	await cartService.clearCart(userId);

	return res.status(200).json({
		success: true,
		message: "Cart cleared successfully",
	});
}

module.exports = {
	getCart,
	addItemToCart,
	updateCartItemQuantity,
	removeItemFromCart,
	clearCart,
};
