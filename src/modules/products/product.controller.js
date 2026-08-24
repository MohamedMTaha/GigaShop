const productService = require("./product.service");

async function findProductById(req, res, next) {
	try {
		const product =
			await productService.findProductById(
				Number(req.params.id),
			);

		res.status(200).json({
			success: true,
			data: product,
		});
	} catch (error) {
		next(error);
	}
}

async function findAdminProductById(req, res, next) {
	try {
		const product =
			await productService.findAdminProductById(
				Number(req.params.id),
			);

		res.status(200).json({
			success: true,
			data: product,
		});
	} catch (error) {
		next(error);
	}
}

async function findProducts(req, res, next) {
	try {
		const filters = {
			search: req.query.search,

			categoryId:
				req.query.categoryId !== undefined
					? Number(req.query.categoryId)
					: undefined,

			minPrice:
				req.query.minPrice !== undefined
					? Number(req.query.minPrice)
					: undefined,

			maxPrice:
				req.query.maxPrice !== undefined
					? Number(req.query.maxPrice)
					: undefined,
		};

		const products =
			await productService.findProducts(filters);

		res.status(200).json({
			success: true,
			data: products,
		});
	} catch (error) {
		next(error);
	}
}

async function findAdminProducts(req, res, next) {
	try {
		const filters = {
			status: req.query.status,
			search: req.query.search,

			categoryId:
				req.query.categoryId !== undefined
					? Number(req.query.categoryId)
					: undefined,

			minPrice:
				req.query.minPrice !== undefined
					? Number(req.query.minPrice)
					: undefined,

			maxPrice:
				req.query.maxPrice !== undefined
					? Number(req.query.maxPrice)
					: undefined,
		};

		const products =
			await productService.findAdminProducts(filters);

		res.status(200).json({
			success: true,
			data: products,
		});
	} catch (error) {
		next(error);
	}
}

async function createProduct(req, res, next) {
	try {
		const {
			name,
			description,
			price,
			categoryId,
			stock,
		} = req.body;

		const product =
			await productService.createProduct(
				name,
				description,
				price,
				categoryId,
				stock,
			);

		res.status(201).json({
			success: true,
			message: "Product created successfully",
			data: product,
		});
	} catch (error) {
		next(error);
	}
}

async function updateProduct(req, res, next) {
	try {
		const product =
			await productService.updateProduct(
				Number(req.params.id),
				req.body,
			);

		res.status(200).json({
			success: true,
			message: "Product updated successfully",
			data: product,
		});
	} catch (error) {
		next(error);
	}
}

async function updateProductStock(req, res, next) {
	try {
		const { stock } = req.body;

		const product =
			await productService.updateProductStock(
				Number(req.params.id),
				stock,
			);

		res.status(200).json({
			success: true,
			message:
				"Product stock updated successfully",
			data: product,
		});
	} catch (error) {
		next(error);
	}
}

async function softDeleteProduct(req, res, next) {
	try {
		console.log("DELETE PRODUCT HIT:", req.params.id);

		await productService.softDeleteProduct(
			Number(req.params.id),
		);

		res.status(200).json({
			success: true,
			message: "Product deleted successfully",
		});
	} catch (error) {
		console.log("DELETE PRODUCT ERROR:", error);
		next(error);
	}
}

async function restoreProduct(req, res, next) {
	try {
		await productService.restoreProduct(
			Number(req.params.id),
		);

		res.status(200).json({
			success: true,
			message: "Product restored successfully",
		});
	} catch (error) {
		next(error);
	}
}

module.exports = {
	findProductById,
	findAdminProductById,
	findProducts,
	findAdminProducts,
	createProduct,
	updateProduct,
	updateProductStock,
	softDeleteProduct,
	restoreProduct,
};
