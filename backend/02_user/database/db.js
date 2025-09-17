import	sqlite3		from	'sqlite3';
import	{ open }	from	'sqlite';

export async function initDB(){
	const db = await open({
		filename: '/usr/src/app/data/users_db',
		driver: sqlite3.Database
	});

	await db.exec(`
		CREATE TABLE IF NOT EXISTS registered (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		type TEXT NOT NULL DEFAULT "registered",
		status TEXT NOT NULL DEFAULT "pending",
		wins INTEGER NOT NULL DEFAULT 0,
		losses INTEGER NOT NULL DEFAULT 0,
		friend_ship TEXT,
		picture TEXT NOT NULL DEFAULT "./pictures/BG.webp",
		hashedPassword TEXT NOT NULL,
		email TEXT,
		telephone TEXT
		);
	`);

	await db.exec(`
		CREATE TABLE IF NOT EXISTS guest (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		type TEXT NOT NULL DEFAULT "guest",
		status TEXT NOT NULL DEFAULT "available",
		wins INTEGER NOT NULL DEFAULT 0,
		losses INTEGER NOT NULL DEFAULT 0,
		jwt_time INTEGER DEFAULT NULL,
		pic TEXT NOT NULL DEFAULT "./pictures/BG.webp"
		);
	`);

	console.log('Database user initialized');
	return db;
};
