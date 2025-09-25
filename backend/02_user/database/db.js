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

			played_matches INTEGER NOT NULL DEFAULT 0,
			match_wins INTEGER NOT NULL DEFAULT 0,
			wins_streak INTEGER NOT NULL DEFAULT 0,
			win_rate INTEGER NOT NULL DEFAULT 0,
			tournament_wins INTEGER NOT NULL DEFAULT 0,
			friends	TEXT,
			wallet INTEGER NOT NULL DEFAULT 100,

			picture TEXT NOT NULL DEFAULT "./pictures/BG.webp",
	
			hashedPassword TEXT NOT NULL,
			email TEXT
		);
	`);

	await db.exec(`
		CREATE TABLE IF NOT EXISTS guest (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			type TEXT NOT NULL DEFAULT "guest",
			status TEXT NOT NULL DEFAULT "available",
			
			played_matches INTEGER NOT NULL DEFAULT 0,
			match_wins INTEGER NOT NULL DEFAULT 0,
			wins_streak INTEGER NOT NULL DEFAULT 0,
			win_rate INTEGER NOT NULL DEFAULT 0,
			tournament_wins INTEGER NOT NULL DEFAULT 0,
			friends	TEXT,
			wallet INTEGER NOT NULL DEFAULT 100,

			picture TEXT NOT NULL DEFAULT "./pictures/BG.webp"
		);
	`);

	await db.exec(`UPDATE registered SET win_rate = 10 WHERE id = 3;`);

	console.log('Database user initialized');
	return db;
};
