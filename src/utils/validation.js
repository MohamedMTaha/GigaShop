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

const EMAIL_REGEX =
	/^[A-Za-z](?:[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]*)@[A-Za-z-]+(?:\.[A-Za-z-]+)+$/;

function validateEmail(email, label = "Email") {
	const trimmed = validateString(email, label, {
		min: 5,
		max: 254,
	});

	if (!EMAIL_REGEX.test(trimmed)) {
		throw new ValidationError("Invalid email");
	}

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
			if (trimmed.length > 4096 || trimmed.length < 2) {
				throw new ValidationError(
					`${label} must be between 2 and 4096 characters`,
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
	if (typeof phone !== "string" || !/^\d+$/.test(phone)) {
		throw new ValidationError(`${label} must be 11 Numbers`);
	}

	if (phone.length !== 11) {
		throw new ValidationError(`${label} must be 11 Numbers`);
	}

	if (!/^(010|011|012|015)[0-9]{8}$/.test(phone)) {
		throw new ValidationError(
			`${label} must be a valid Egyptian mobile number`,
		);
	}

	return phone;
}

function validateName(name, label = "Name") {
	const value = validateString(name, label, {
		min: 2,
		max: 50,
	});

	const isArabic = /^[\u0600-\u06FF]+(?:[ '-][\u0600-\u06FF]+)*$/.test(value);

	const isEnglish = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/.test(value);

	if (!isArabic && !isEnglish) {
		throw new ValidationError(
			`${label} must contain Arabic letters only or English letters only`,
		);
	}

	return value;
}

function validateSameNameLanguage(firstName, lastName) {
	const arabicRegex = /^[\u0600-\u06FF]+(?:[ '-][\u0600-\u06FF]+)*$/;
	const englishRegex = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;

	const firstNameIsArabic = arabicRegex.test(firstName);
	const firstNameIsEnglish = englishRegex.test(firstName);

	const lastNameIsArabic = arabicRegex.test(lastName);
	const lastNameIsEnglish = englishRegex.test(lastName);

	if (
		(firstNameIsArabic && !lastNameIsArabic) ||
		(firstNameIsEnglish && !lastNameIsEnglish)
	) {
		throw new ValidationError(
			"First name and last name must use the same language",
		);
	}
}

function validatePassword(password, label = "Password") {
	const value = validateString(password, label, {
		min: 8,
		max: 72,
	});

	if (!/^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]+$/.test(value)) {
		throw new ValidationError(`${label} must use only English letters, numbers, and symbols`);
	}

	if (!/[A-Za-z]/.test(value)) {
		throw new ValidationError(`${label} must contain at least one English letter`);
	}

	if (!/[0-9]/.test(value)) {
		throw new ValidationError(`${label} must contain at least one number`);
	}

	return value;
}

function validateAddress(address, label = "Address") {
	const value = validateString(address, label, {
		min: 5,
		max: 255,
	});

	// Must contain at least one Arabic/English letter or number
	if (!/[A-Za-z\u0600-\u06FF0-9]/.test(value)) {
		throw new ValidationError(`${label} is invalid`);
	}

	// Cannot consist only of symbols
	if (/^[^A-Za-z\u0600-\u06FF0-9]+$/.test(value)) {
		throw new ValidationError(`${label} is invalid`);
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
	validateName,
	validatePassword,
	validateAddress,
	validateSameNameLanguage,
};
