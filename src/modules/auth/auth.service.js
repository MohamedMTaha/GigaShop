const { signToken } = require("../../utils/jwt");
const { hashPassword, verifyPassword } = require("../../utils/password");

const { validateString, validateEmail } = require("../../utils/validation");

const userService = require("../users/user.service");

const ConflictError = require("../../errors/ConflictError");
const UnauthorizedError = require("../../errors/UnauthorizedError");

async function register(firstName, lastName, email, password) {
	firstName = validateString(firstName, "First name", {
		min: 2,
		max: 50,
	});

	lastName = validateString(lastName, "Last name", {
		min: 2,
		max: 50,
	});

	email = validateEmail(email);

	password = validateString(password, "Password", {
		min: 8,
	});

	const existingUser = await userService.findUserByEmail(email);

	if (existingUser) {
		throw new ConflictError("Email already exists");
	}

	const hashedPassword = await hashPassword(password);

	const result = await userService.createUser(
		firstName,
		lastName,
		email,
		hashedPassword,
	);

	return signToken({
		id: result.id,
		role: result.role,
	});
}

async function login(email, password) {
	email = validateEmail(email);

	if (typeof password !== "string" || password.length === 0) {
		throw new UnauthorizedError("Invalid email or password");
	}

	const user = await userService.findUserByEmail(email);

	if (!user || user.deletedAt !== null) {
		throw new UnauthorizedError("Invalid email or password");
	}

	const isPasswordCorrect = await verifyPassword(password, user.password);

	if (!isPasswordCorrect) {
		throw new UnauthorizedError("Invalid email or password");
	}

	return signToken({
		id: user.id,
		role: user.role,
	});
}

module.exports = {
	register,
	login,
};
