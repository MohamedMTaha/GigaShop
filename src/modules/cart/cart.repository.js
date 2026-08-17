const db = require("../../config/db");

async function findCartByUserId(userId) {
	const result = await db.query(
		`SELECT id, user_id
		FROM carts
		WHERE user_id = $1`,
		[userId],
	);

	const row = result.rows[0];

	if (!row) {
		return null;
	}

	return {
		id: row.id,
		userId: row.user_id,
	};
}

async function createCart(userId) {
	const result = await db.query(
		`INSERT INTO carts (user_id)
		VALUES ($1)
		ON CONFLICT (user_id)
		DO NOTHING
		RETURNING id`,
		[userId],
	);

	if (result.rows[0]) {
		return {
			id: result.rows[0].id,
		};
	}

	return findCartByUserId(userId);
}

function mapCart(result) {
	const row = result.rows[0];

	if (!row) {
		return null;
	}

	if (row.product_id === null) {
		return {
			id: row.cart_id,
			userId: row.user_id,
			items: [],
		};
	}

	return {
		id: row.cart_id,
		userId: row.user_id,
		items: result.rows.map((item) => ({
			cartItemId: item.cart_item_id,
			quantity: item.quantity,
			productId: item.product_id,
			name: item.name,
			description: item.description,
			price: item.price,
			stock: item.stock,
			status: item.deleted_at ? "deleted" : "active",
			imageUrl: item.image_url,
		})),
	};
}

const CART_QUERY = `
	SELECT
		C.id AS cart_id,
		C.user_id,
		CI.id AS cart_item_id,
		CI.product_id,
		CI.quantity,
		P.name,
		P.description,
		P.price,
		P.deleted_at,
		P.stock,
		PI.image_url
	FROM carts C
	LEFT JOIN cart_items CI
		ON C.id = CI.cart_id
	LEFT JOIN products P
		ON CI.product_id = P.id
	LEFT JOIN (
		SELECT DISTINCT ON (product_id)
			product_id,
			image_url
		FROM product_images
		ORDER BY product_id, sort_order
	) PI
		ON P.id = PI.product_id
	WHERE C.user_id = $1
`;

async function findCartDetails(userId) {
	const result = await db.query(CART_QUERY, [userId]);

	return mapCart(result);
}

async function findCartDetailsForUpdate(userId, client) {
	const result = await client.query(
		`${CART_QUERY}
		FOR UPDATE OF C`,
		[userId],
	);

	return mapCart(result);
}

async function findCartItem(cartId, productId) {
	const result = await db.query(
		`SELECT id, quantity
		FROM cart_items
		WHERE cart_id = $1
		AND product_id = $2`,
		[cartId, productId],
	);

	const row = result.rows[0];

	if (!row) {
		return null;
	}

	return {
		id: row.id,
		quantity: row.quantity,
	};
}

async function addCartItem(cartId, productId, quantity, stock) {
	const result = await db.query(
		`INSERT INTO cart_items (
			cart_id,
			product_id,
			quantity
		)
		VALUES ($1, $2, $3)
		ON CONFLICT (cart_id, product_id)
		DO UPDATE SET
			quantity = cart_items.quantity + EXCLUDED.quantity
		WHERE cart_items.quantity + EXCLUDED.quantity <= $4
		RETURNING id, quantity`,
		[cartId, productId, quantity, stock],
	);

	return result.rows[0] || null;
}

async function updateCartItemQuantity(cartItemId, productId, quantity) {
	const result = await db.query(
		`UPDATE cart_items CI
		SET quantity = $1
		FROM products P
		WHERE CI.id = $2
		AND P.id = $3
		AND $1 <= P.stock`,
		[quantity, cartItemId, productId],
	);

	return result.rowCount;
}

async function removeCartItem(cartItemId) {
	const result = await db.query(
		`DELETE FROM cart_items
		WHERE id = $1`,
		[cartItemId],
	);

	return result.rowCount;
}

async function clearCart(cartId, client = db) {
	const result = await client.query(
		`DELETE FROM cart_items
		WHERE cart_id = $1`,
		[cartId],
	);

	return result.rowCount;
}

module.exports = {
	findCartDetails,
	findCartDetailsForUpdate,
	findCartByUserId,
	createCart,
	findCartItem,
	addCartItem,
	updateCartItemQuantity,
	removeCartItem,
	clearCart,
};
