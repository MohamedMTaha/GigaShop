const userRepository = require("./user.repository");

const NotFoundError = require("../../errors/NotFoundError");
const ConflictError = require("../../errors/ConflictError");
const UnauthorizedError = require("../../errors/UnauthorizedError");
const ValidationError = require("../../errors/ValidationError");

const { hashPassword, verifyPassword } = require("../../utils/password");

const {
	validateId,
	validateString,
	validateEmail,
} = require("../../utils/validation");

async function getMyProfile(userId) {
	userId = validateId(userId, "User ID");

	const user = await userRepository.findUserById(userId);

	if (!user || user.deletedAt !== null) {
		throw new NotFoundError("User not found");
	}

	return {
		id: user.id,
		firstName: user.firstName,
		lastName: user.lastName,
		email: user.email,
		role: user.role,
		createdAt: user.createdAt,
	};
}

async function findUserByEmail(email) {
	email = validateEmail(email);

	return userRepository.findUserByEmail(email);
}

async function searchUserByEmail(email) {
	const user = await findUserByEmail(email);

	if (!user || user.deletedAt !== null) {
		throw new NotFoundError("User not found");
	}

	const { password, ...safeUser } = user;

	return safeUser;
}

async function findUserById(id) {
	id = validateId(id, "User ID");

	const user = await userRepository.findUserById(id);

	if (!user || user.deletedAt !== null) {
		throw new NotFoundError("User not found");
	}

	const { password, ...safeUser } = user;

	return safeUser;
}

async function updateMyProfile(userId, firstName, lastName, email) {
	userId = validateId(userId, "User ID");

	firstName = validateString(firstName, "First name", {
		min: 2,
		max: 50,
	});

	lastName = validateString(lastName, "Last name", {
		min: 2,
		max: 50,
	});

	email = validateEmail(email);

	const user = await userRepository.findUserById(userId);

	if (!user || user.deletedAt !== null) {
		throw new NotFoundError("User not found");
	}

	const existingUser = await userRepository.findUserByEmail(email);

	if (
		existingUser &&
		existingUser.id !== userId &&
		existingUser.deletedAt === null
	) {
		throw new ConflictError("Email is already in use");
	}

	const result = await userRepository.updateUserProfile(
		userId,
		firstName,
		lastName,
		email,
	);

	if (!result) {
		throw new ConflictError("User profile was not updated");
	}

	return result;
}

async function updateMyPassword(userId, currentPassword, newPassword) {
	userId = validateId(userId, "User ID");

	currentPassword = validateString(currentPassword, "Current password");

	newPassword = validateString(newPassword, "New password", { min: 8 });

	const user = await userRepository.findUserById(userId);

	if (!user || user.deletedAt !== null) {
		throw new NotFoundError("User not found");
	}

	const validPassword = await verifyPassword(currentPassword, user.password);

	if (!validPassword) {
		throw new UnauthorizedError("Current password is incorrect");
	}

	const hashedPassword = await hashPassword(newPassword);

	const result = await userRepository.updateUserPassword(
		userId,
		hashedPassword,
	);

	if (result === 0) {
		throw new ConflictError("Password was not updated");
	}

	return result;
}

async function deleteMyAccount(userId) {
	userId = validateId(userId, "User ID");

	const user = await userRepository.findUserById(userId);

	if (!user || user.deletedAt !== null) {
		throw new NotFoundError("User not found");
	}

	const result = await userRepository.softDeleteUser(userId);

	if (result === 0) {
		throw new ConflictError("User was not deleted");
	}

	return result;
}

async function findAllUsers() {
	return userRepository.findAllUsers();
}

async function createUser(firstName, lastName, email, hashedPassword) {
	firstName = validateString(firstName, "First name", {
		min: 2,
		max: 50,
	});

	lastName = validateString(lastName, "Last name", {
		min: 2,
		max: 50,
	});

	email = validateEmail(email);

	if (hashedPassword === undefined || hashedPassword === null) {
		throw new ValidationError("Password is required");
	}

	if (typeof hashedPassword !== "string") {
		throw new ValidationError("Password must be a string");
	}

	const result = await userRepository.createUser(
		firstName,
		lastName,
		email,
		hashedPassword,
	);

	if (!result) {
		throw new ConflictError("User was not created");
	}

	return result;
}

module.exports = {
	getMyProfile,
	updateMyProfile,
	updateMyPassword,
	deleteMyAccount,
	findAllUsers,
	findUserById,
	findUserByEmail,
	searchUserByEmail,
	createUser,
};
