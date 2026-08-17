
const productRepository = require("./product.repository");
const categoryRepository = require("../categories/category.repository");

const ValidationError = require("../../errors/ValidationError");
const NotFoundError = require("../../errors/NotFoundError");
const ConflictError = require("../../errors/ConflictError");

const {
	validateId,
	validateString,
	validateStock,
	validatePrice,
	validateDescription,
	validateQuantity,
} = require("../../utils/validation");

async function findProductById(id) {
	id = validateId(id, "Product ID");

	const product = await productRepository.findProductById(id);

	if (!product) {
		throw new NotFoundError("Product not found");
	}

	return product;
}

async function createProduct(name, description, price, categoryId, stock) {
	name = validateString(name, "Name", {
		min: 2,
		max: 255,
	});

	description = validateDescription(description, "Description");

	price = validatePrice(price, "Price");
	categoryId = validateId(categoryId, "Category ID");
	stock = validateStock(stock, "Stock");

	const category = await categoryRepository.findCategoryById(categoryId);

	if (!category) {
		throw new NotFoundError("Category not found");
	}

	if (category.deletedAt !== null) {
		throw new ConflictError("Category is deleted");
	}

	return productRepository.createProduct({
		name,
		description,
		price,
		categoryId,
		stock,
	});
}

async function updateProduct(id, data) {
	id = validateId(id, "Product ID");

	if (!data || typeof data !== "object") {
		throw new ValidationError("Invalid product data");
	}

	if (Object.keys(data).length === 0) {
		throw new ValidationError("At least one field must be provided");
	}

	const allowedFields = ["name", "description", "price", "categoryId"];

	for (const field of Object.keys(data)) {
		if (!allowedFields.includes(field)) {
			throw new ValidationError(`Field '${field}' cannot be updated`);
		}
	}

	const product = await productRepository.findProductById(id);

	if (!product) {
		throw new NotFoundError("Product not found");
	}

	if (product.deletedAt !== null) {
		throw new ConflictError("Product is deleted");
	}

	if (data.name !== undefined) {
		data.name = validateString(data.name, "Name", {
			min: 2,
			max: 255,
		});
	}

	if (data.description !== undefined) {
		data.description = validateDescription(data.description, "Description");
	}

	if (data.price !== undefined) {
		data.price = validatePrice(data.price, "Price");
	}

	if (data.categoryId !== undefined) {
		data.categoryId = validateId(data.categoryId, "Category ID");

		const category = await categoryRepository.findCategoryById(data.categoryId);

		if (!category) {
			throw new NotFoundError("Category not found");
		}

		if (category.deletedAt !== null) {
			throw new ConflictError("Category is deleted");
		}
	}

	const updatedProduct = await productRepository.updateProduct(id, data);

	if (!updatedProduct) {
		throw new ConflictError("Product was not updated");
	}

	return updatedProduct;
}

async function updateProductStock(id, stock) {
	id = validateId(id, "Product ID");
	stock = validateStock(stock, "Stock");

	const product = await productRepository.findProductById(id);

	if (!product) {
		throw new NotFoundError("Product not found");
	}

	if (product.deletedAt !== null) {
		throw new ConflictError("Product is deleted");
	}

	const updatedProduct = await productRepository.updateProductStock(id, stock);

	if (!updatedProduct) {
		throw new ConflictError("Product stock was not updated");
	}

	return updatedProduct;
}

async function softDeleteProduct(id) {
	id = validateId(id, "Product ID");

	const product = await productRepository.findProductById(id);

	if (!product) {
		throw new NotFoundError("Product not found");
	}

	if (product.deletedAt !== null) {
		throw new ConflictError("Product is already deleted");
	}

	const result = await productRepository.softDeleteProduct(id);

	if (result === 0) {
		throw new ConflictError("Product was not deleted");
	}

	return result;
}

async function restoreProduct(id) {
	id = validateId(id, "Product ID");

	const product = await productRepository.findProductById(id);

	if (!product) {
		throw new NotFoundError("Product not found");
	}

	if (product.deletedAt === null) {
		throw new ConflictError("Product is already active");
	}

	const result = await productRepository.restoreProduct(id);

	if (result === 0) {
		throw new ConflictError("Product was not restored");
	}

	return result;
}

async function decreaseProductStock(id, quantity, client) {
	id = validateId(id, "Product ID");
	quantity = validateQuantity(quantity, "Quantity");

	const product = await productRepository.findProductById(id, client);

	if (!product) {
		throw new NotFoundError("Product not found");
	}

	if (product.deletedAt !== null) {
		throw new ConflictError("Product is deleted");
	}

	const updatedStock = await productRepository.decreaseProductStock(
		id,
		quantity,
		client,
	);

	if (updatedStock === null) {
		throw new ConflictError(`Not enough stock for product "${product.name}"`);
	}

	return updatedStock;
}

async function findProducts(filters = {}) {
	const validatedFilters = {};

	if (filters.status !== undefined) {
		if (!["active", "deleted", "all"].includes(filters.status)) {
			throw new ValidationError("Status must be 'active', 'deleted', or 'all'");
		}

		validatedFilters.status = filters.status;
	}

	if (filters.search !== undefined) {
		if (typeof filters.search !== "string") {
			throw new ValidationError("Search must be a string");
		}

		const search = filters.search.trim();

		if (search.length === 0) {
			throw new ValidationError("Search cannot be empty");
		}

		validatedFilters.search = search;
	}

	if (filters.categoryId !== undefined) {
		validatedFilters.categoryId = validateId(filters.categoryId, "Category ID");
	}

	if (filters.minPrice !== undefined) {
		validatedFilters.minPrice = validatePrice(filters.minPrice, "Min price");
	}

	if (filters.maxPrice !== undefined) {
		validatedFilters.maxPrice = validatePrice(filters.maxPrice, "Max price");
	}

	if (
		validatedFilters.minPrice !== undefined &&
		validatedFilters.maxPrice !== undefined &&
		validatedFilters.minPrice > validatedFilters.maxPrice
	) {
		throw new ValidationError(
			"Min price must be less than or equal to max price",
		);
	}

	return productRepository.findProducts(validatedFilters);
}

module.exports = {
	findProductById,
	createProduct,
	updateProduct,
	updateProductStock,
	softDeleteProduct,
	restoreProduct,
	decreaseProductStock,
	findProducts,
};
