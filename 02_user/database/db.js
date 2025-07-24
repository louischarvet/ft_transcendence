//./database/db.js
import { getDB } from '../common_tools/db.js';

// On crée la table users si elle n'existe pas
export async function initializeDatabase() {
	const db = await getDB();
	await db.exec(`
		CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		status TEXT NOT NULL
		);
	`);

	return db;
}
