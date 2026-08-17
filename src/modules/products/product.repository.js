const db = require("../../config/db");

async function createProduct(data, client = db) {
	const result = await client.query(
		`INSERT INTO products (
			name,
			description,
			price,
			category_id,
			stock
		)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id`,
		[data.name, data.description, data.price, data.categoryId, data.stock],
	);

	return {
		id: result.rows[0].id,
	};
}

async function findProductById(id, client = db) {
	const result = await client.query(
		`SELECT *
		FROM products
		WHERE id = $1`,
		[id],
	);

	const row = result.rows[0];

	if (!row) {
		return null;
	}

	return {
		id: row.id,
		name: row.name,
		description: row.description,
		price: row.price,
		stock: row.stock,
		categoryId: row.category_id,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
		deletedAt: row.deleted_at,
		status: row.deleted_at ? "deleted" : "active",
	};
}

async function findProducts(filters = {}, client = db) {
	const conditions = [];
	const values = [];

	switch (filters.status) {
		case "deleted":
			conditions.push("p.deleted_at IS NOT NULL");
			break;

		case "active":
			conditions.push("p.deleted_at IS NULL");
			conditions.push("c.deleted_at IS NULL");
			break;

		case "all":
			break;

		default:
			conditions.push("p.deleted_at IS NULL");
			conditions.push("c.deleted_at IS NULL");
	}

	if (filters.search) {
		values.push(`%${filters.search}%`);

		conditions.push(
			`(p.name ILIKE $${values.length} OR p.description ILIKE $${values.length})`,
		);
	}

	if (filters.categoryId !== undefined) {
		values.push(filters.categoryId);

		conditions.push(`p.category_id = $${values.length}`);
	}

	if (filters.minPrice !== undefined) {
		values.push(filters.minPrice);

		conditions.push(`p.price >= $${values.length}`);
	}

	if (filters.maxPrice !== undefined) {
		values.push(filters.maxPrice);

		conditions.push(`p.price <= $${values.length}`);
	}

	const result = await client.query(
		`SELECT p.*
		FROM products p
		INNER JOIN categories c ON c.id = p.category_id
		WHERE ${conditions.join(" AND ")}
		ORDER BY p.created_at DESC`,
		values,
	);

	return result.rows.map((row) => ({
		id: row.id,
		name: row.name,
		description: row.description,
		price: row.price,
		stock: row.stock,
		categoryId: row.category_id,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
		deletedAt: row.deleted_at,
		status: row.deleted_at ? "deleted" : "active",
	}));
}

async function updateProduct(id, data, client = db) {
	const updates = [];
	const values = [];

	if (data.name !== undefined) {
		values.push(data.name);
		updates.push(`name = $${values.length}`);
	}

	if (data.description !== undefined) {
		values.push(data.description);
		updates.push(`description = $${values.length}`);
	}

	if (data.price !== undefined) {
		values.push(data.price);
		updates.push(`price = $${values.length}`);
	}

	if (data.categoryId !== undefined) {
		values.push(data.categoryId);
		updates.push(`category_id = $${values.length}`);
	}

	updates.push("updated_at = CURRENT_TIMESTAMP");

	values.push(id);

	const result = await client.query(
		`UPDATE products
		SET ${updates.join(", ")}
		WHERE id = $${values.length}
		RETURNING *`,
		values,
	);

	const row = result.rows[0];

	if (!row) {
		return null;
	}

	return {
		id: row.id,
		name: row.name,
		description: row.description,
		price: row.price,
		stock: row.stock,
		categoryId: row.category_id,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
		deletedAt: row.deleted_at,
		status: row.deleted_at ? "deleted" : "active",
	};
}

async function updateProductStock(id, stock, client = db) {
	const result = await client.query(
		`UPDATE products
		SET
			stock = $1,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $2
		RETURNING *`,
		[stock, id],
	);

	const row = result.rows[0];

	if (!row) {
		return null;
	}

	return {
		id: row.id,
		name: row.name,
		description: row.description,
		price: row.price,
		stock: row.stock,
		categoryId: row.category_id,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
		deletedAt: row.deleted_at,
		status: row.deleted_at ? "deleted" : "active",
	};
}

async function decreaseProductStock(productId, quantity, client = db) {
	const result = await client.query(
		`UPDATE products
		SET
			stock = stock - $1,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $2
		AND stock >= $1
		RETURNING stock`,
		[quantity, productId],
	);

	return result.rows[0]?.stock ?? null;
}

async function increaseProductStock(productId, quantity, client = db) {
	const result = await client.query(
		`UPDATE products
		SET
			stock = stock + $1,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $2
		RETURNING stock`,
		[quantity, productId],
	);

	return result.rows[0]?.stock ?? null;
}

async function softDeleteProduct(id, client = db) {
	const result = await client.query(
		`UPDATE products
		SET
			deleted_at = CURRENT_TIMESTAMP,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $1`,
		[id],
	);

	return result.rowCount;
}

async function restoreProduct(id, client = db) {
	const result = await client.query(
		`UPDATE products
		SET
			deleted_at = NULL,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $1`,
		[id],
	);

	return result.rowCount;
}

module.exports = {
	createProduct,
	findProductById,
	findProducts,
	updateProduct,
	updateProductStock,
	decreaseProductStock,
	increaseProductStock,
	softDeleteProduct,
	restoreProduct,
};
