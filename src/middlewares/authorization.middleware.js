const ForbiddenError = require("../errors/ForbiddenError");

function authorize(...allowedRoles) {
	return (req, res, next) => {
		if (!req.user) {
			return next(new ForbiddenError("Access denied"));
		}

		if (!allowedRoles.includes(req.user.role)) {
			return next(new ForbiddenError("You do not have permission"));
		}

		next();
	};
}

module.exports = authorize;
