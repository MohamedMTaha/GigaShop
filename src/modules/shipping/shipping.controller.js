const shippingService = require("./shipping.service");

async function getShippingRates(req, res, next) {
	try {
		const rates = await shippingService.getShippingRates();

		return res.status(200).json({
			success: true,
			data: rates,
		});
	} catch (error) {
		next(error);
	}
}

async function getShippingRate(req, res, next) {
	try {
		const rate = await shippingService.getShippingRate(req.params.governorate);

		return res.status(200).json({
			success: true,
			data: rate,
		});
	} catch (error) {
		next(error);
	}
}

async function createShippingRate(req, res, next) {
	try {
		const { governorateName, shippingFee } = req.body;

		const rate = await shippingService.createShippingRate(
			governorateName,
			shippingFee,
		);

		return res.status(201).json({
			success: true,
			message: "Shipping rate created successfully",
			data: rate,
		});
	} catch (error) {
		next(error);
	}
}

async function updateShippingRate(req, res, next) {
	try {
		const { shippingFee } = req.body;

		const rate = await shippingService.updateShippingRate(
			Number(req.params.id),
			shippingFee,
		);

		return res.status(200).json({
			success: true,
			message: "Shipping rate updated successfully",
			data: rate,
		});
	} catch (error) {
		next(error);
	}
}

async function deleteShippingRate(req, res, next) {
	try {
		await shippingService.deleteShippingRate(Number(req.params.id));

		return res.status(200).json({
			success: true,
			message: "Shipping rate deleted successfully",
		});
	} catch (error) {
		next(error);
	}
}

module.exports = {
	getShippingRates,
	getShippingRate,
	createShippingRate,
	updateShippingRate,
	deleteShippingRate,
};
