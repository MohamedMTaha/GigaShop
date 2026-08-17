const db = require("../../config/db");

function mapUser(row, includePassword = false) {
	if (!row) {
		return null;
	}

	const user = {
		id: row.id,
		firstName: row.first_name,
		lastName: row.last_name,
		email: row.email,
		role: row.role,
		createdAt: row.created_at,
		deletedAt: row.deleted_at,
	};

	if (includePassword) {
		user.password = row.password;
	}

	return user;
}

async function findUserByEmail(email) {
	const result = await db.query(
		`SELECT
			id,
			first_name,
			last_name,
			email,
			password,
			role,
			created_at,
			deleted_at
		FROM users
		WHERE email = $1`,
		[email],
	);

	return mapUser(result.rows[0], true);
}

async function findUserById(id) {
	const result = await db.query(
		`SELECT
			id,
			first_name,
			last_name,
			email,
			password,
			role,
			created_at,
			deleted_at
		FROM users
		WHERE id = $1`,
		[id],
	);

	return mapUser(result.rows[0], true);
}

async function createUser(firstName, lastName, email, password) {
	const result = await db.query(
		`INSERT INTO users (
			first_name,
			last_name,
			email,
			password
		)
		VALUES ($1, $2, $3, $4)
		RETURNING
			id,
			first_name,
			last_name,
			email,
			role,
			created_at,
			deleted_at`,
		[firstName, lastName, email, password],
	);

	return mapUser(result.rows[0]);
}

async function findAllUsers() {
	const result = await db.query(
		`SELECT
			id,
			first_name,
			last_name,
			email,
			role,
			created_at,
			deleted_at
		FROM users
		ORDER BY id`,
	);

	return result.rows.map((row) => mapUser(row));
}

async function softDeleteUser(id) {
	const result = await db.query(
		`UPDATE users
		SET
			deleted_at = CURRENT_TIMESTAMP,
			email = CONCAT('deleted_', id, '_', email)
		WHERE id = $1
		AND deleted_at IS NULL`,
		[id],
	);

	return result.rowCount;
}

async function updateUserProfile(id, firstName, lastName, email) {
	const result = await db.query(
		`UPDATE users
		SET
			first_name = $1,
			last_name = $2,
			email = $3
		WHERE id = $4
		AND deleted_at IS NULL
		RETURNING
			id,
			first_name,
			last_name,
			email,
			role,
			created_at,
			deleted_at`,
		[firstName, lastName, email, id],
	);

	return mapUser(result.rows[0]);
}

async function updateUserPassword(id, password) {
	const result = await db.query(
		`UPDATE users
		SET password = $1
		WHERE id = $2
		AND deleted_at IS NULL`,
		[password, id],
	);

	return result.rowCount;
}

module.exports = {
	findUserByEmail,
	findUserById,
	createUser,
	findAllUsers,
	softDeleteUser,
	updateUserProfile,
	updateUserPassword,
};
