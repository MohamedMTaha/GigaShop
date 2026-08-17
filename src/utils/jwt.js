const jwt = require("jsonwebtoken");

const secret = process.env.JWT_SECRET;

if (!secret) {
	throw new Error("JWT_SECRET is not configured");
}

function signToken(payload) {
	return jwt.sign(payload, secret, {
		expiresIn: "1h",
	});
}

function verifyToken(token) {
	return jwt.verify(token, secret);
}

module.exports = {
	signToken,
	verifyToken,
};
