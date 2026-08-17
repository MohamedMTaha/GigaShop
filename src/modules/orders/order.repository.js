const db = require("../../config/db");

function mapOrder(row) {
	if (!row) {
		return null;
	}

	return {
		id: row.id,
		userId: row.user_id,
		orderStatus: row.order_status,
		paymentStatus: row.payment_status,
		paymentMethod: row.payment_method,
		stripePaymentIntentId: row.stripe_payment_intent_id,
		subtotalAmount: row.subtotal_amount,
		shippingFee: row.shipping_fee,
		shippingName: row.shipping_name,
		shippingPhone: row.shipping_phone,
		shippingGovernorate: row.shipping_governorate,
		shippingCity: row.shipping_city,
		shippingAddressLine: row.shipping_address_line,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
}

function mapOrderItems(rows) {
	return rows.map((item) => ({
		id: item.id,
		productId: item.product_id,
		productName: item.product_name,
		productImageUrl: item.product_image_url,
		priceAtPurchase: item.price_at_purchase,
		quantity: item.quantity,
	}));
}

async function createOrder(data, client = db) {
	const result = await client.query(
		`INSERT INTO orders (
			user_id,
			order_status,
			payment_status,
			payment_method,
			stripe_payment_intent_id,
			subtotal_amount,
			shipping_fee,
			shipping_name,
			shipping_phone,
			shipping_governorate,
			shipping_city,
			shipping_address_line
		)
		VALUES (
			$1, $2, $3, $4, $5, $6,
			$7, $8, $9, $10, $11, $12
		)
		RETURNING *`,
		[
			data.user_id,
			data.order_status,
			data.payment_status,
			data.payment_method,
			data.stripe_payment_intent_id ?? null,
			data.subtotal_amount,
			data.shipping_fee,
			data.shipping_name,
			data.shipping_phone,
			data.shipping_governorate,
			data.shipping_city,
			data.shipping_address_line,
		],
	);

	return mapOrder(result.rows[0]);
}

async function createOrderItems(orderId, items, client = db) {
	if (items.length === 0) {
		return [];
	}

	const values = [];
	const placeholders = [];

	items.forEach((item) => {
		const index = values.length + 1;

		values.push(
			orderId,
			item.productId,
			item.productName,
			item.productImageUrl,
			item.priceAtPurchase,
			item.quantity,
		);

		placeholders.push(`(
			$${index},
			$${index + 1},
			$${index + 2},
			$${index + 3},
			$${index + 4},
			$${index + 5}
		)`);
	});

	const result = await client.query(
		`INSERT INTO order_items (
			order_id,
			product_id,
			product_name,
			product_image_url,
			price_at_purchase,
			quantity
		)
		VALUES ${placeholders.join(", ")}
		RETURNING *`,
		values,
	);

	return mapOrderItems(result.rows);
}

async function getOrderItems(orderId, client = db) {
	const result = await client.query(
		`SELECT *
		FROM order_items
		WHERE order_id = $1
		ORDER BY id`,
		[orderId],
	);

	return mapOrderItems(result.rows);
}

async function findOrderById(id, client = db) {
	const result = await client.query(
		`SELECT *
		FROM orders
		WHERE id = $1`,
		[id],
	);

	const order = result.rows[0];

	if (!order) {
		return null;
	}

	const items = await getOrderItems(id, client);

	return {
		...mapOrder(order),
		orderItems: items,
	};
}

async function findOrderByIdAndUserId(id, userId, client = db) {
	const result = await client.query(
		`SELECT *
		FROM orders
		WHERE id = $1
		AND user_id = $2`,
		[id, userId],
	);

	const order = result.rows[0];

	if (!order) {
		return null;
	}

	const items = await getOrderItems(id, client);

	return {
		...mapOrder(order),
		orderItems: items,
	};
}

async function findOrdersByUserId(userId, client = db) {
	const result = await client.query(
		`SELECT *
		FROM orders
		WHERE user_id = $1
		ORDER BY created_at DESC`,
		[userId],
	);

	return result.rows.map(mapOrder);
}

async function findAllOrders(client = db) {
	const result = await client.query(
		`SELECT *
		FROM orders
		ORDER BY created_at DESC`,
	);

	return result.rows.map(mapOrder);
}

async function findOrdersByStatus(status, client = db) {
	const result = await client.query(
		`SELECT *
		FROM orders
		WHERE order_status = $1
		ORDER BY created_at ASC`,
		[status],
	);

	return result.rows.map(mapOrder);
}

async function updateOrderStatus(id, status, client = db) {
	const result = await client.query(
		`UPDATE orders
		SET
			order_status = $1,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $2
		RETURNING *`,
		[status, id],
	);

	return result.rows[0] ? mapOrder(result.rows[0]) : null;
}

async function updateOrderPaymentStatus(id, status, client = db) {
	const result = await client.query(
		`UPDATE orders
		SET
			payment_status = $1,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $2
		RETURNING *`,
		[status, id],
	);

	return result.rows[0] ? mapOrder(result.rows[0]) : null;
}

async function findOrderByIdForUpdate(id, client) {
	const result = await client.query(
		`SELECT *
		FROM orders
		WHERE id = $1
		FOR UPDATE`,
		[id],
	);

	const order = result.rows[0];

	if (!order) {
		return null;
	}

	const items = await getOrderItems(id, client);

	return {
		...mapOrder(order),
		orderItems: items,
	};
}

async function findOrderByStripePaymentIntentId(
	stripePaymentIntentId,
	client = db,
) {
	const result = await client.query(
		`SELECT *
		FROM orders
		WHERE stripe_payment_intent_id = $1`,
		[stripePaymentIntentId],
	);

	const order = result.rows[0];

	if (!order) {
		return null;
	}

	const items = await getOrderItems(order.id, client);

	return {
		...mapOrder(order),
		orderItems: items,
	};
}

async function updateOrderPaymentAndStatus(
	id,
	paymentStatus,
	orderStatus,
	client = db,
) {
	const result = await client.query(
		`UPDATE orders
		SET
			payment_status = $1,
			order_status = $2,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $3
		RETURNING *`,
		[paymentStatus, orderStatus, id],
	);

	return result.rows[0] ? mapOrder(result.rows[0]) : null;
}

module.exports = {
	createOrder,
	createOrderItems,
	findOrderById,
	findOrderByIdAndUserId,
	findOrdersByUserId,
	findAllOrders,
	findOrdersByStatus,
	updateOrderStatus,
	updateOrderPaymentStatus,
	findOrderByIdForUpdate,
	findOrderByStripePaymentIntentId,
	updateOrderPaymentAndStatus,
};
