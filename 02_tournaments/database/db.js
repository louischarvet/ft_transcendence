import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = __dirname + '/db.db';

export async function getDb() {
	return open({
		filename: dbPath,
		driver: sqlite3.Database
	});
}

export async function initializeDatabase() {
	const db = await getDb();

	await db.exec(`
		CREATE TABLE IF NOT EXISTS tournaments (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		created_at TEXT DEFAULT CURRENT_TIMESTAMP
		);
	`);

	return db;
}

//echo 'CREATE TABLE' | sqlite3 mydb