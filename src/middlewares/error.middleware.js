const AppError = require("../errors/AppError");

function errorMiddleware(err, req, res, next) {
	if (err.type === "entity.parse.failed") {
		return res.status(400).json({
			success: false,
			message: "Invalid JSON body",
		});
	}

	if (err instanceof AppError) {
		return res.status(err.statusCode).json({
			success: false,
			message: err.message,
		});
	}

	console.error(err);

	return res.status(500).json({
		success: false,
		message: "Internal Server Error",
	});
}

module.exports = errorMiddleware;
