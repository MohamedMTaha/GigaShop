const imageService = require("./product-image.service");

async function getProductImages(req, res, next) {
	try {
		const productId = Number(req.params.id);

		const images = await imageService.getProductImages(productId);

		return res.status(200).json({
			success: true,
			data: images,
		});
	} catch (error) {
		next(error);
	}
}

async function addProductImage(req, res, next) {
	try {
		const productId = Number(req.params.id);

		const images = req.files;

		const createdImages = await imageService.addProductImages(
			productId,
			images,
		);

		return res.status(201).json({
			success: true,
			message: "Product images added successfully",
			data: createdImages,
		});
	} catch (error) {
		next(error);
	}
}

async function removeProductImage(req, res, next) {
	try {
		const productId = Number(req.params.id);
		const imageId = Number(req.params.imageId);

		await imageService.removeProductImage(productId, imageId);

		return res.status(200).json({
			success: true,
			message: "Product image deleted successfully",
		});
	} catch (error) {
		next(error);
	}
}

async function replaceProductImages(req, res, next) {
	try {
		const productId = Number(req.params.id);

		const images = req.files;

		const updatedImages = await imageService.replaceProductImages(
			productId,
			images,
		);

		return res.status(200).json({
			success: true,
			message: "Product images updated successfully",
			data: updatedImages,
		});
	} catch (error) {
		next(error);
	}
}

module.exports = {
	getProductImages,
	addProductImage,
	removeProductImage,
	replaceProductImages,
};
