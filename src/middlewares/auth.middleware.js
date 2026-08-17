const { verifyToken } = require("../utils/jwt");

const UnauthorizedError = require("../errors/UnauthorizedError");

const userRepository = require("../modules/users/user.repository");

async function authMiddleware(req, res, next) {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader) {
			throw new UnauthorizedError("Authentication required");
		}

		const parts = authHeader.trim().split(/\s+/);

		if (parts.length !== 2) {
			throw new UnauthorizedError("Invalid authorization header");
		}

		const [scheme, token] = parts;

		if (scheme !== "Bearer") {
			throw new UnauthorizedError("Invalid authorization header");
		}

		let payload;

		try {
			payload = verifyToken(token);
		} catch {
			throw new UnauthorizedError("Invalid or expired token");
		}

		if (!payload.id) {
			throw new UnauthorizedError("Invalid token");
		}

		const user = await userRepository.findUserById(payload.id);

		if (!user) {
			throw new UnauthorizedError("User not found");
		}

		if (user.deletedAt !== null) {
			throw new UnauthorizedError("Account is deleted");
		}

		req.user = {
			id: user.id,
			role: user.role,
		};

		next();
	} catch (error) {
		next(error);
	}
}

module.exports = authMiddleware;
