const userService = require("./user.service");

async function getMyProfile(req, res, next) {
	try {
		const user = await userService.getMyProfile(Number(req.user.id));

		res.status(200).json({
			success: true,
			data: user,
		});
	} catch (error) {
		next(error);
	}
}

async function updateMyProfile(req, res, next) {
	try {
		const { firstName, lastName, email } = req.body;

		await userService.updateMyProfile(
			Number(req.user.id),
			firstName,
			lastName,
			email,
		);

		res.status(200).json({
			success: true,
			message: "Profile updated successfully",
		});
	} catch (error) {
		next(error);
	}
}

async function updateMyPassword(req, res, next) {
	try {
		const { currentPassword, newPassword } = req.body;

		await userService.updateMyPassword(
			Number(req.user.id),
			currentPassword,
			newPassword,
		);

		res.status(200).json({
			success: true,
			message: "Password updated successfully",
		});
	} catch (error) {
		next(error);
	}
}

async function deleteMyAccount(req, res, next) {
	try {
		await userService.softDeleteAccount(Number(req.user.id));

		res.status(200).json({
			success: true,
			message: "Account deleted successfully",
		});
	} catch (error) {
		next(error);
	}
}

async function findAllUsers(req, res, next) {
	try {
		const users = await userService.findAllUsers();

		res.status(200).json({
			success: true,
			data: users,
		});
	} catch (error) {
		next(error);
	}
}

async function findUserById(req, res, next) {
	try {
		const user = await userService.findUserById(Number(req.params.id));

		res.status(200).json({
			success: true,
			data: user,
		});
	} catch (error) {
		next(error);
	}
}

async function findUserByEmail(req, res, next) {
	try {
		const user = await userService.searchUserByEmail(req.query.email);

		res.status(200).json({
			success: true,
			data: user,
		});
	} catch (error) {
		next(error);
	}
}

async function findDeletedUsers(req, res, next) {
	try {
		const users = await userService.findDeletedUsers();

		return res.status(200).json({
			success: true,
			data: users,
		});
	} catch (error) {
		next(error);
	}
}

async function findUserByIdForAdmin(req, res, next) {
	try {
		const user = await userService.findUserByIdForAdmin(Number(req.params.id));

		res.status(200).json({
			success: true,
			data: user,
		});
	} catch (error) {
		next(error);
	}
}

async function deleteAccountById(req, res, next) {
	try {
		await userService.softDeleteAccount(Number(req.params.id));

		res.status(200).json({
			success: true,
			message: "Account deleted successfully",
		});
	} catch (error) {
		next(error);
	}
}

module.exports = {
	getMyProfile,
	updateMyProfile,
	updateMyPassword,
	deleteMyAccount,
	findAllUsers,
	findUserById,
	findUserByEmail,
  findDeletedUsers,
  findUserByIdForAdmin,
	deleteAccountById,
};
