const db = require("../../config/db");

function mapShippingRate(row) {
	if (!row) {
		return null;
	}

	return {
		id: row.id,
		governorateName: row.governorate_name,
		shippingFee: row.shipping_fee,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
}

async function findAllShippingRates() {
	const result = await db.query(
		`SELECT
			id,
			governorate_name,
			shipping_fee,
			created_at,
			updated_at
		FROM shipping_rates
		ORDER BY governorate_name`,
	);

	return result.rows.map(mapShippingRate);
}

async function findShippingRateByGovernorate(governorateName) {
	const result = await db.query(
		`SELECT
			id,
			governorate_name,
			shipping_fee,
			created_at,
			updated_at
		FROM shipping_rates
		WHERE LOWER(governorate_name) = LOWER($1)`,
		[governorateName],
	);

	return mapShippingRate(result.rows[0]);
}

async function createShippingRate(governorateName, shippingFee) {
	const result = await db.query(
		`INSERT INTO shipping_rates (
			governorate_name,
			shipping_fee
		)
		VALUES ($1, $2)
		RETURNING
			id,
			governorate_name,
			shipping_fee,
			created_at,
			updated_at`,
		[governorateName, shippingFee],
	);

	return mapShippingRate(result.rows[0]);
}

async function updateShippingRate(id, shippingFee) {
	const result = await db.query(
		`UPDATE shipping_rates
		SET
			shipping_fee = $1,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $2
		RETURNING
			id,
			governorate_name,
			shipping_fee,
			created_at,
			updated_at`,
		[shippingFee, id],
	);

	return mapShippingRate(result.rows[0]);
}

async function deleteShippingRate(id) {
	const result = await db.query(
		`DELETE FROM shipping_rates
		WHERE id = $1`,
		[id],
	);

	return result.rowCount;
}
async function findShippingRateById(id) {
	const result = await db.query(
		`SELECT
			id,
			governorate_name,
			shipping_fee,
			created_at,
			updated_at
		FROM shipping_rates
		WHERE id = $1`,
		[id],
	);

	return mapShippingRate(result.rows[0]);
}

module.exports = {
	findAllShippingRates,
	findShippingRateByGovernorate,
	createShippingRate,
	updateShippingRate,
	deleteShippingRate,
	findShippingRateById,
};
