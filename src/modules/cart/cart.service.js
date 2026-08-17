const cartRepository = require("./cart.repository");
const productRepository = require("../products/product.repository");

const NotFoundError = require("../../errors/NotFoundError");
const ConflictError = require("../../errors/ConflictError");

const { validateId, validateQuantity } = require("../../utils/validation");

async function addItemToCart(userId, productId, quantity) {
	userId = validateId(userId, "User ID");
	productId = validateId(productId, "Product ID");
	quantity = validateQuantity(quantity, "Quantity");

	const product = await productRepository.findProductById(productId);

	if (!product) {
		throw new NotFoundError("Product not found");
	}

	if (product.deletedAt !== null) {
		throw new ConflictError("Product is deleted");
	}

	let cart = await cartRepository.findCartByUserId(userId);

	if (!cart) {
		cart = await cartRepository.createCart(userId);
	}

	const result = await cartRepository.addCartItem(
		cart.id,
		productId,
		quantity,
		product.stock,
	);

	if (!result) {
		throw new ConflictError("Not enough stock");
	}
}

async function getCart(userId) {
	userId = validateId(userId, "User ID");

	const cart = await cartRepository.findCartDetails(userId);

	if (!cart) {
		return {
			items: [],
			subtotal: 0,
		};
	}

	const updatedCartItems = cart.items.map((item) => {
		return {
			...item,
			subtotal: item.status === "active" ? item.price * item.quantity : 0,
		};
	});

	const cartSubtotal = updatedCartItems.reduce(
		(sum, item) => sum + item.subtotal,
		0,
	);

	return {
		items: updatedCartItems,
		subtotal: cartSubtotal,
	};
}

async function updateCartItemQuantity(userId, productId, newQuantity) {
	userId = validateId(userId, "User ID");
	productId = validateId(productId, "Product ID");
	newQuantity = validateQuantity(newQuantity, "Quantity");

	const cart = await cartRepository.findCartByUserId(userId);

	if (!cart) {
		throw new NotFoundError("Cart not found");
	}

	const cartItem = await cartRepository.findCartItem(cart.id, productId);

	if (!cartItem) {
		throw new NotFoundError("Cart item not found");
	}

	const product = await productRepository.findProductById(productId);

	if (!product) {
		throw new NotFoundError("Product not found");
	}

	if (product.deletedAt !== null) {
		throw new ConflictError("Product is deleted");
	}

	const currentQuantity = cartItem.quantity;

	if (newQuantity === currentQuantity) {
		return cartItem;
	}

	const updatedCartItem = await cartRepository.updateCartItemQuantity(
		cartItem.id,
		productId,
		newQuantity,
	);

	if (updatedCartItem === 0) {
		throw new ConflictError("Not enough stock");
	}

	return;
}

async function removeItemFromCart(userId, productId) {
	userId = validateId(userId, "User ID");
	productId = validateId(productId, "Product ID");

	const cart = await cartRepository.findCartByUserId(userId);

	if (!cart) {
		throw new NotFoundError("Cart not found");
	}

	const cartItem = await cartRepository.findCartItem(cart.id, productId);

	if (!cartItem) {
		throw new NotFoundError("Cart item not found");
	}

	await cartRepository.removeCartItem(cartItem.id);
}

async function clearCart(userId) {
	userId = validateId(userId, "User ID");

	const cart = await cartRepository.findCartByUserId(userId);

	if (!cart) {
		return;
	}

	await cartRepository.clearCart(cart.id);
}

module.exports = {
	addItemToCart,
	getCart,
	updateCartItemQuantity,
	removeItemFromCart,
	clearCart,
};
