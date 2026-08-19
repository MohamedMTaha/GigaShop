const db = require("../../config/db");

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

	return db.withTransaction(async (client) => {
		let cart = await cartRepository.findCartByUserIdForUpdate(userId, client);

		if (!cart) {
			cart = await cartRepository.createCart(userId, client);

			if (!cart) {
				throw new ConflictError("Failed to create cart");
			}
		}

		const result = await cartRepository.addCartItem(
			cart.id,
			productId,
			quantity,
			product.stock,
			client,
		);

		if (!result) {
			throw new ConflictError("Not enough stock");
		}

		return result;
	});
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

	const product = await productRepository.findProductById(productId);

	if (!product) {
		throw new NotFoundError("Product not found");
	}

	if (product.deletedAt !== null) {
		throw new ConflictError("Product is deleted");
	}

	return db.withTransaction(async (client) => {
		const cart = await cartRepository.findCartByUserIdForUpdate(userId, client);

		if (!cart) {
			throw new NotFoundError("Cart not found");
		}

		const cartItem = await cartRepository.findCartItem(
			cart.id,
			productId,
			client,
		);

		if (!cartItem) {
			throw new NotFoundError("Cart item not found");
		}

		const currentQuantity = cartItem.quantity;

		if (newQuantity === currentQuantity) {
			return cartItem;
		}

		const updatedCartItem = await cartRepository.updateCartItemQuantity(
			cartItem.id,
			productId,
			newQuantity,
			client,
		);

		if (updatedCartItem === 0) {
			throw new ConflictError("Not enough stock");
		}

		return {
			id: cartItem.id,
			quantity: newQuantity,
		};
	});
}

async function removeItemFromCart(userId, productId) {
	userId = validateId(userId, "User ID");
	productId = validateId(productId, "Product ID");

	return db.withTransaction(async (client) => {
		const cart = await cartRepository.findCartByUserIdForUpdate(userId, client);

		if (!cart) {
			throw new NotFoundError("Cart not found");
		}

		const cartItem = await cartRepository.findCartItem(
			cart.id,
			productId,
			client,
		);

		if (!cartItem) {
			throw new NotFoundError("Cart item not found");
		}

		const deletedRows = await cartRepository.removeCartItem(
			cartItem.id,
			client,
		);

		if (deletedRows === 0) {
			throw new ConflictError("Cart item was not removed");
		}
	});
}

async function clearCart(userId) {
	userId = validateId(userId, "User ID");

	return db.withTransaction(async (client) => {
		const cart = await cartRepository.findCartByUserIdForUpdate(userId, client);

		if (!cart) {
			return;
		}

		await cartRepository.clearCart(cart.id, client);
	});
}

module.exports = {
	addItemToCart,
	getCart,
	updateCartItemQuantity,
	removeItemFromCart,
	clearCart,
};
