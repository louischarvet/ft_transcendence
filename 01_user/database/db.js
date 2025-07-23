import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Fonction d’accès à la base
export async function getDb() {
  return open({
    filename: __dirname + '/db',
    driver: sqlite3.Database
  });
}

// Facultatif : création de la table si elle n'existe pas
export async function initializeDatabase() {
	const db = await getDb();
	await db.exec(`
		CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL
		);
	`);
	return db;
}
