require("dotenv").config();

const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

async function runMigrations() {
	const client = await pool.connect();

	try {
		await client.query(`
			CREATE TABLE IF NOT EXISTS migrations (
				id SERIAL PRIMARY KEY,
				file_name TEXT NOT NULL UNIQUE,
				executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
			);
		`);

		const migrationsPath = path.join(__dirname, "../../database/migrations");

		const files = fs
			.readdirSync(migrationsPath)
			.filter((file) => file.endsWith(".sql"))
			.sort();

		for (const file of files) {
			const migrationExists = await client.query(
				`
				SELECT 1
				FROM migrations
				WHERE file_name = $1
				`,
				[file],
			);

			if (migrationExists.rows.length > 0) {
				console.log(`↷ Skipped ${file}`);
				continue;
			}

			const sql = fs.readFileSync(path.join(migrationsPath, file), "utf8");

			try {
				await client.query("BEGIN");

				await client.query(sql);

				await client.query(
					`
					INSERT INTO migrations (file_name)
					VALUES ($1)
					`,
					[file],
				);

				await client.query("COMMIT");

				console.log(`✓ ${file}`);
			} catch (error) {
				await client.query("ROLLBACK");
				throw error;
			}
		}

		console.log("All migrations completed 🚀");
	} catch (error) {
		console.error("Migration failed ❌");
		console.error(error);
	} finally {
		client.release();
		await pool.end();
	}
}

runMigrations();
