const authService = require("./auth.service");

async function register(req, res, next) {
	try {
		const { firstName, lastName, email, password } = req.body;

		const token = await authService.register(
			firstName,
			lastName,
			email,
			password,
		);

		res.status(201).json({
			message: "User registered successfully",
			token,
		});
	} catch (error) {
		next(error);
	}
}

async function login(req, res, next) {
	try {
		const { email, password } = req.body;

		const token = await authService.login(email, password);

		res.status(200).json({
			message: "User logged in successfully",
			token,
		});
	} catch (error) {
		next(error);
	}
}

module.exports = {
	register,
	login,
};
