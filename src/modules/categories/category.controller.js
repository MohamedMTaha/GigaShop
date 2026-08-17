const categoryService = require("./category.service");

const createCategory = async (req, res, next) => {
	try {
		const { name } = req.body;
		const category = await categoryService.createCategory(name);
		res.status(201).json(category);
	} catch (error) {
		next(error);
	}
};

const findCategories = async (req, res, next) => {
	try {
		const { status } = req.query;
		const categories = await categoryService.findCategories(status);
		res.status(200).json(categories);
	} catch (error) {
		next(error);
	}
};

const findCategoryById = async (req, res, next) => {
	try {
		const id = Number(req.params.id);
		const category = await categoryService.findCategoryById(id);
		res.status(200).json(category);
	} catch (error) {
		next(error);
	}
};

const softDeleteCategory = async (req, res, next) => {
	try {
		const id = Number(req.params.id);
		const result = await categoryService.softDeleteCategory(id);
		res.status(200).json({ result });
	} catch (error) {
		next(error);
	}
};

const restoreCategory = async (req, res, next) => {
	try {
		const id = Number(req.params.id);
		const result = await categoryService.restoreCategory(id);
		res.status(200).json({ result });
	} catch (error) {
		next(error);
	}
};

module.exports = {
	createCategory,
	findCategories,
	findCategoryById,
	softDeleteCategory,
	restoreCategory,
};
