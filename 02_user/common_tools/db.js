import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

const dbFile = '/usr/src/app/database/db';
async function getDB() {
	return open({
		filename: dbFile,
		driver: sqlite3.Database
	});
}

export { getDB };