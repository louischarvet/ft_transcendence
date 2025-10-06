//./database/db.js

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Chemin vers le fichier de base de données SQLite
const dbFile = '/usr/src/app/data/session_db';

export async function getDB() {
	return await open({
		filename: dbFile,
		driver: sqlite3.Database
	});
}
