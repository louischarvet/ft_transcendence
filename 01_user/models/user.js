import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

const dbFile = '/usr/src/app/users_db';

function checkNameFormat(name) {
	return /^[A-Z]$/i.test(name[0]) && /^[a-zA-Z0-9]+$/.test(name);
}

async function getDB() {
	return open({
		filename: dbFile,
		driver: sqlite3.Database
	});
}

async function isInDatabase(name) {
	const db = await getDB();
	const user = await db.get('SELECT * FROM users WHERE name = ?', [name]);
	return !!user;
}

async function insertInDatabase(name) {
	const db = await getDB();
	await db.run("INSERT INTO users VALUES(?, 'available')", name);
}

export { checkNameFormat, isInDatabase, insertInDatabase };
