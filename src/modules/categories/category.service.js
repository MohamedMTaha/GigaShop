const categoryRepository = require("./category.repository");

const ValidationError = require("../../errors/ValidationError");
const NotFoundError = require("../../errors/NotFoundError");
const ConflictError = require("../../errors/ConflictError");

async function createCategory(name) {
	if (!name) {
		throw new ValidationError("Name is required");
	}

	if (typeof name !== "string") {
		throw new ValidationError("Name must be a string");
	}

	if (name.length > 100 || name.trim().length < 2) {
		throw new ValidationError("Name must be between 2 and 100 characters");
	}

	const category = await categoryRepository.findCategoryByName(name);

	if (category) {
		if (category.deletedAt) {
			throw new ConflictError(
				"Category with this name was deleted and cannot be recreated",
			);
		}

		throw new ConflictError("Category with this name already exists");
	}

	return categoryRepository.createCategory(name);
}

async function findCategoryById(id) {
	if (!Number.isInteger(id)) {
		throw new ValidationError("ID must be an integer");
	}
	if (id < 1) {
		throw new ValidationError("ID must be greater than 0");
	}
	const category = await categoryRepository.findCategoryById(id);

	if (!category) {
		throw new NotFoundError("Category not found");
	}

	return category;
}

async function findCategories(status) {
	if (status === undefined || status === "active") {
		return categoryRepository.findCategories("active");
	}

	if (status === "deleted") {
		return categoryRepository.findCategories("deleted");
	}

	if (status === "all") {
		return categoryRepository.findCategories("all");
	}

	throw new ValidationError("Status must be 'active', 'deleted', or 'all'");
}

async function softDeleteCategory(id) {
	if (!Number.isInteger(id)) {
		throw new ValidationError("ID must be an integer");
	}

	if (id < 1) {
		throw new ValidationError("ID must be greater than 0");
	}

	const category = await categoryRepository.findCategoryById(id);

	if (!category) {
		throw new NotFoundError("Category not found");
	}

	if (category.deletedAt !== null) {
		throw new ConflictError("Category is already deleted");
	}

	return categoryRepository.softDeleteCategory(id);
}

async function restoreCategory(id) {
	if (!Number.isInteger(id)) {
		throw new ValidationError("ID must be an integer");
	}

	if (id < 1) {
		throw new ValidationError("ID must be greater than 0");
	}

	const category = await categoryRepository.findCategoryById(id);

	if (!category) {
		throw new NotFoundError("Category not found");
	}

	if (category.deletedAt === null) {
		throw new ConflictError("Category is already active");
	}

	return categoryRepository.restoreCategory(id);
}

module.exports = {
	createCategory,
	findCategoryById,
	findCategories,
	softDeleteCategory,
	restoreCategory,
};
