const ValidationError = require("../errors/ValidationError");

function requireDefined(value, label) {
	if (value === undefined) {
		throw new ValidationError(`${label} is required`);
	}
	if (value === null) {
		throw new ValidationError("Invalid data");
	}
}

function validateId(id, label = "ID") {
	requireDefined(id, label);
	if (!Number.isInteger(id)) {
		throw new ValidationError(`${label} must be an integer`);
	}
	if (id < 1) {
		throw new ValidationError(`${label} must be greater than 0`);
	}
	return id;
}

function validateString(value, label, { min, max } = {}) {
	requireDefined(value, label);
	if (typeof value !== "string") {
		throw new ValidationError(`${label} must be a string`);
	}

	const trimmed = value.trim();

	if (min !== undefined && trimmed.length < min) {
		throw new ValidationError(`${label} must be at least ${min} characters`);
	}
	if (max !== undefined && trimmed.length > max) {
		throw new ValidationError(`${label} must be at most ${max} characters`);
	}

	return trimmed;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email, label = "Email") {
	const trimmed = validateString(email, label, { min: 2 });

	if (!EMAIL_REGEX.test(trimmed)) {
		throw new ValidationError("Invalid email");
	}

	// Normalize so the same address is never stored/compared inconsistently.
	return trimmed.toLowerCase();
}

function validateQuantity(quantity, label = "Quantity") {
	requireDefined(quantity, label);
	if (!Number.isInteger(quantity)) {
		throw new ValidationError(`${label} must be an integer`);
	}
	if (quantity < 1) {
		throw new ValidationError(`${label} must be greater than 0`);
	}
	return quantity;
}

function validateStock(stock, label = "Stock") {
	requireDefined(stock, label);
	if (!Number.isInteger(stock)) {
		throw new ValidationError(`${label} must be an integer`);
	}
	if (stock < 0) {
		throw new ValidationError(`${label} must be greater than or equal to 0`);
	}
	return stock;
}

function validatePrice(price, label = "Price") {
	requireDefined(price, label);
	if (!Number.isFinite(price)) {
		throw new ValidationError(`${label} must be a number`);
	}
	if (price <= 0 || price > 99999999.99) {
		throw new ValidationError(`${label} must be between 0.01 and 99999999.99`);
	}
	const decimalPlaces = price.toString().split(".")[1];

	if (decimalPlaces && decimalPlaces.length > 2) {
		throw new ValidationError(`${label} must be a maximum of 2 decimal places`);
	}
	return price;
}

function validateDescription(description, label = "Description") {
	if (description === undefined || description === null) {
		description = null;
	} else {
		if (typeof description !== "string") {
			throw new ValidationError(`${label} must be a string`);
		}

		const trimmed = description.trim();

		if (trimmed.length === 0) {
			description = null;
		} else {
			if (trimmed.length > 1000 || trimmed.length < 2) {
				throw new ValidationError(
					`${label} must be between 2 and 1000 characters`,
				);
			}

			description = trimmed;
		}
	}

	return description;
}

function validatePaymentMethod(paymentMethod) {
	const allowedMethods = ["cash", "card"];

	requireDefined(paymentMethod, "Payment method");

	if (!allowedMethods.includes(paymentMethod)) {
		throw new ValidationError("Payment method must be 'cash' or 'card'");
	}

	return paymentMethod;
}

function validatePhone(phone, label = "Phone") {
	const value = validateString(phone, label, {
		min: 11,
		max: 20,
	});

	if (!/^[0-9]+$/.test(value)) {
		throw new ValidationError(`${label} must contain only numbers`);
	}

	return value;
}

module.exports = {
	requireDefined,
	validateId,
	validateString,
	validateEmail,
	validateQuantity,
	validateStock,
	validatePrice,
	validateDescription,
	validatePaymentMethod,
	validatePhone,
};
