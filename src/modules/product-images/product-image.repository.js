const db = require("../../config/db");

function mapProductImage(row) {
	if (!row) {
		return null;
	}

	return {
		id: row.id,
		productId: row.product_id,
		imageUrl: row.image_url,
		cloudinaryPublicId: row.cloudinary_public_id,
		sortOrder: row.sort_order,
		createdAt: row.created_at,
	};
}

async function findImagesByProductId(productId, client = db) {
	const result = await client.query(
		`SELECT
			id,
			product_id,
			image_url,
			cloudinary_public_id,
			sort_order,
			created_at
		FROM product_images
		WHERE product_id = $1
		ORDER BY sort_order`,
		[productId],
	);

	return result.rows.map(mapProductImage);
}

async function findImageById(id, client = db) {
	const result = await client.query(
		`SELECT
			id,
			product_id,
			image_url,
			cloudinary_public_id,
			sort_order,
			created_at
		FROM product_images
		WHERE id = $1`,
		[id],
	);

	return mapProductImage(result.rows[0]);
}

async function createImage(
	productId,
	imageUrl,
	cloudinaryPublicId,
	sortOrder,
	client = db,
) {
	const result = await client.query(
		`INSERT INTO product_images (
			product_id,
			image_url,
			cloudinary_public_id,
			sort_order
		)
		VALUES ($1, $2, $3, $4)
		RETURNING
			id,
			product_id,
			image_url,
			cloudinary_public_id,
			sort_order,
			created_at`,
		[productId, imageUrl, cloudinaryPublicId, sortOrder],
	);

	return mapProductImage(result.rows[0]);
}

async function updateImageSortOrder(id, sortOrder, client = db) {
	const result = await client.query(
		`UPDATE product_images
		SET sort_order = $1
		WHERE id = $2`,
		[sortOrder, id],
	);

	return result.rowCount;
}

async function deleteImage(id, client = db) {
	const result = await client.query(
		`DELETE FROM product_images
		WHERE id = $1`,
		[id],
	);

	return result.rowCount;
}

async function deleteImagesByProductId(productId, client = db) {
	const result = await client.query(
		`DELETE FROM product_images
		WHERE product_id = $1`,
		[productId],
	);

	return result.rowCount;
}

module.exports = {
	findImagesByProductId,
	findImageById,
	createImage,
	updateImageSortOrder,
	deleteImage,
	deleteImagesByProductId,
};
