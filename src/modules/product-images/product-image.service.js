const db = require("../../config/db");

const imageRepository = require("./product-image.repository");
const productRepository = require("../products/product.repository");

const {
	uploadImage,
	deleteImage,
} = require("../../services/cloudinaryService");

const NotFoundError = require("../../errors/NotFoundError");
const ConflictError = require("../../errors/ConflictError");
const ValidationError = require("../../errors/ValidationError");

const { validateId } = require("../../utils/validation");

async function getProductImages(productId) {
	productId = validateId(productId, "Product ID");

	const product = await productRepository.findProductById(productId);

	if (!product) {
		throw new NotFoundError("Product not found");
	}

	if (product.deletedAt !== null) {
		throw new ConflictError("Product is deleted");
	}

	return imageRepository.findImagesByProductId(productId);
}

function validateImageFiles(files) {
	if (!Array.isArray(files)) {
		throw new ValidationError("Images must be an array");
	}

	if (files.length === 0) {
		throw new ValidationError("At least one image is required");
	}

	return files;
}

async function addProductImages(productId, files) {
	productId = validateId(productId, "Product ID");
	files = validateImageFiles(files);

	const product = await productRepository.findProductById(productId);

	if (!product) {
		throw new NotFoundError("Product not found");
	}

	if (product.deletedAt !== null) {
		throw new ConflictError("Product is deleted");
	}

	const existingImages = await imageRepository.findImagesByProductId(productId);

	if (existingImages.length + files.length > 5) {
		throw new ValidationError("Product cannot have more than 5 images");
	}

	const uploadedImages = [];

	try {
		for (const file of files) {
			const result = await uploadImage(file.buffer);

			uploadedImages.push({
				imageUrl: result.secure_url,
				cloudinaryPublicId: result.public_id,
			});
		}

		const createdImages = [];

		for (let i = 0; i < uploadedImages.length; i++) {
			const image = await imageRepository.createImage(
				productId,
				uploadedImages[i].imageUrl,
				uploadedImages[i].cloudinaryPublicId,
				existingImages.length + i + 1,
			);

			createdImages.push(image);
		}

		return createdImages;
	} catch (error) {
		for (const image of uploadedImages) {
			try {
				await deleteImage(image.cloudinaryPublicId);
			} catch (cleanupError) {
				console.error("Failed to cleanup Cloudinary image:", cleanupError);
			}
		}

		throw error;
	}
}

async function removeProductImage(productId, imageId) {
	productId = validateId(productId, "Product ID");
	imageId = validateId(imageId, "Image ID");

	const product = await productRepository.findProductById(productId);

	if (!product) {
		throw new NotFoundError("Product not found");
	}

	if (product.deletedAt !== null) {
		throw new ConflictError("Product is deleted");
	}

	const image = await imageRepository.findImageById(imageId);

	if (!image || image.productId !== productId) {
		throw new NotFoundError("Image not found");
	}

	await deleteImage(image.cloudinaryPublicId);

	return db.withTransaction(async (client) => {
		const result = await imageRepository.deleteImage(imageId, client);

		if (result === 0) {
			throw new ConflictError("Image was not deleted");
		}

		const remainingImages = await imageRepository.findImagesByProductId(
			productId,
			client,
		);

		for (let i = 0; i < remainingImages.length; i++) {
			await imageRepository.updateImageSortOrder(
				remainingImages[i].id,
				i + 1,
				client,
			);
		}

		return {
			message: "Image deleted successfully",
		};
	});
}

async function replaceProductImages(productId, files) {
	productId = validateId(productId, "Product ID");
	files = validateImageFiles(files);

	if (files.length > 5) {
		throw new ValidationError("Product cannot have more than 5 images");
	}

	const product = await productRepository.findProductById(productId);

	if (!product) {
		throw new NotFoundError("Product not found");
	}

	if (product.deletedAt !== null) {
		throw new ConflictError("Product is deleted");
	}

	const existingImages = await imageRepository.findImagesByProductId(productId);

	const uploadedImages = [];

	try {
		for (const file of files) {
			const result = await uploadImage(file.buffer);

			uploadedImages.push({
				imageUrl: result.secure_url,
				cloudinaryPublicId: result.public_id,
			});
		}

		const createdImages = await db.withTransaction(async (client) => {
			await imageRepository.deleteImagesByProductId(productId, client);

			const createdImages = [];

			for (let i = 0; i < uploadedImages.length; i++) {
				const image = await imageRepository.createImage(
					productId,
					uploadedImages[i].imageUrl,
					uploadedImages[i].cloudinaryPublicId,
					i + 1,
					client,
				);

				createdImages.push(image);
			}

			return createdImages;
		});

		for (const image of existingImages) {
			try {
				await deleteImage(image.cloudinaryPublicId);
			} catch (cleanupError) {
				console.error("Failed to delete old Cloudinary image:", cleanupError);
			}
		}

		return createdImages;
	} catch (error) {
		for (const image of uploadedImages) {
			try {
				await deleteImage(image.cloudinaryPublicId);
			} catch (cleanupError) {
				console.error("Failed to cleanup Cloudinary image:", cleanupError);
			}
		}

		throw error;
	}
}

module.exports = {
	getProductImages,
	addProductImages,
	removeProductImage,
	replaceProductImages,
};
