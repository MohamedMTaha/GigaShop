const shippingRepository = require("./shipping.repository");

const NotFoundError = require("../../errors/NotFoundError");
const ConflictError = require("../../errors/ConflictError");

const {
	validateId,
	validateString,
	validatePrice,
} = require("../../utils/validation");

async function getShippingRates() {
	return shippingRepository.findAllShippingRates();
}

async function getShippingRate(governorateName) {
	governorateName = validateString(governorateName, "Governorate name", {
		min: 2,
		max: 100,
	});

	const rate =
		await shippingRepository.findShippingRateByGovernorate(governorateName);

	if (!rate) {
		throw new NotFoundError("Shipping rate not found");
	}

	return rate;
}

async function createShippingRate(governorateName, shippingFee) {
	governorateName = validateString(governorateName, "Governorate name", {
		min: 2,
		max: 100,
	});

	shippingFee = validatePrice(shippingFee, "Shipping fee");

	const existing =
		await shippingRepository.findShippingRateByGovernorate(governorateName);

	if (existing) {
		throw new ConflictError("Shipping rate already exists");
	}

	return shippingRepository.createShippingRate(governorateName, shippingFee);
}

async function updateShippingRate(id, shippingFee) {
	id = validateId(id, "Shipping rate ID");
	shippingFee = validatePrice(shippingFee, "Shipping fee");

	const rate = await shippingRepository.findShippingRateById(id);

	if (!rate) {
		throw new NotFoundError("Shipping rate not found");
	}

	return shippingRepository.updateShippingRate(id, shippingFee);
}

async function deleteShippingRate(id) {
	id = validateId(id, "Shipping rate ID");

	const result = await shippingRepository.deleteShippingRate(id);

	if (result === 0) {
		throw new NotFoundError("Shipping rate not found");
	}
}

module.exports = {
	getShippingRates,
	getShippingRate,
	createShippingRate,
	updateShippingRate,
	deleteShippingRate,
};
