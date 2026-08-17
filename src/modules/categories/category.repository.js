const db = require("../../config/db");

async function createCategory(name) {
	const result = await db.query(
		`INSERT INTO categories (name)
        VALUES ($1)
        RETURNING id, name, created_at`,
		[name],
	);

	return {
		id: result.rows[0].id,
		name: result.rows[0].name,
		createdAt: result.rows[0].created_at,
	};
}

async function findCategoryById(id) {
	const result = await db.query(
		`SELECT id, name, created_at, deleted_at
        FROM categories
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
		createdAt: row.created_at,
		deletedAt: row.deleted_at,
	};
}

async function findCategoryByName(name) {
	const result = await db.query(
		`SELECT id, name, created_at, deleted_at
        FROM categories
        WHERE name = $1`,
		[name],
	);

	const row = result.rows[0];

	if (!row) {
		return null;
	}

	return {
		id: row.id,
		name: row.name,
		createdAt: row.created_at,
		deletedAt: row.deleted_at,
	};
}

async function findCategories(status) {
	if (status === "active") {
		const result = await db.query(
			`SELECT id, name, created_at FROM categories
            WHERE deleted_at IS NULL`,
		);

		return result.rows.map((row) => {
			return {
				id: row.id,
				name: row.name,
				createdAt: row.created_at,
			};
		});
	}

	if (status === "deleted") {
		const result = await db.query(
			`SELECT id, name, created_at, deleted_at FROM categories WHERE deleted_at IS NOT NULL`,
		);

		return result.rows.map((row) => {
			return {
				id: row.id,
				name: row.name,
				createdAt: row.created_at,
				deletedAt: row.deleted_at,
			};
		});
	}

	if (status === "all") {
		const result = await db.query(
			`SELECT id, name, created_at, deleted_at FROM categories`,
		);

		return result.rows.map((row) => {
			return {
				id: row.id,
				name: row.name,
				createdAt: row.created_at,
				deletedAt: row.deleted_at,
			};
		});
	}
}

async function softDeleteCategory(id) {
	const result = await db.query(
		`UPDATE categories
        SET deleted_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND deleted_at IS NULL`,
		[id],
	);

	return result.rowCount;
}

async function restoreCategory(id) {
	const result = await db.query(
		`UPDATE categories
        SET deleted_at = NULL
        WHERE id = $1 AND deleted_at IS NOT NULL`,
		[id],
	);

	return result.rowCount;
}

module.exports = {
	createCategory,
	findCategoryById,
	findCategoryByName,
	findCategories,
	softDeleteCategory,
	restoreCategory,
};
