import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

//const userDbFile = '/usr/src/app/users_db'; // DB du user-service (users)
const tournamentDbFile = '../database/db.js'; // DB tournoi (players, pools...)

//function checkNameFormat(name) {
//  	return /^[A-Z]$/i.test(name[0]) && /^[a-zA-Z0-9]+$/.test(name);
//}

////async function getUserDB() {
////	return open({
////		filename: userDbFile,
////		driver: sqlite3.Database,
////	});
////}

// Connexion SQLite pour tournaments.db
const getTournamentDB = open({
	filename: '../database/db.js',
	driver: sqlite3.Database,
});


////async function isInUserDatabase(name) {
////	const db = await getUserDB();
////	const user = await db.get('SELECT * FROM users WHERE name = ?', [name]);
////	return !!user;
////}

////async function insertInUserDatabase(name) {
////	const db = await getUserDB();
////	await db.run("INSERT INTO users VALUES(?, 'available')", name);
////}

export class Player {
	constructor(userData) {
		this.id = userData.id;
		this.name = userData.name;
		this.status = userData.status;
	}

	// Vérifie si le joueur est déjà dans la table players du tournoi
	static async existsInTournamentDB(id) {
		const db = await getTournamentDB();
		const player = await db.get('SELECT * FROM players WHERE id = ?', [id]);
		return !!player;
	}

	// Sauvegarde le joueur dans la table players (si pas déjà présent)
	async saveInTournamentDB() {
		const db = await getTournamentDB();
		const exists = await Player.existsInTournamentDB(this.id);
		if (!exists) {
		await db.run(
			'INSERT INTO players (id, name, status) VALUES (?, ?, ?)',
			[this.id, this.name, this.status]
		);
		}
	}
}

//export { checkNameFormat};
