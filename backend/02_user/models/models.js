//./models/user.js
import bcrypt, { hash } from 'bcrypt';
import { getDB } from '../common_tools/getDB.js';	

const db = await getDB();

// Récupère tous les utilisateurs
async function getUsers() {
	return db.all('SELECT * FROM users');
}

// Récupère un utilisateur par son nom
async function getUserByName(table, name) {
	return (await db.get('SELECT * FROM ' + table + ' WHERE name = ?', [name]));
}

async function getUserById(table, id) {
	return (await db.get('SELECT * FROM ' + table + ' WHERE id = ?', [id]));
}


async function insertInTable(table, toInsert) {
	const time = Math.floor( Date.now() / 1000 );
	const name = toInsert.name;
	if (toInsert.hashedPassword) { // signin -- with password
		const hashedPassword = toInsert.hashedPassword;
		await db.run("INSERT INTO " + table + "(name, hashedPassword, email, created_at) VALUES (?, ?, ?, ?)",
			[name, hashedPassword, toInsert.email, time]);
	} else // guest -- no password
		await db.run("INSERT INTO " + table + "(name) VALUES (?)",
			[name]);
}

async function getColumnFromTable(column, table) {
	return (await db.all("SELECT " + column + " FROM " + table));
}

// Revoquer les tokens pour log out
async function insertRevokedToken(token) {
	await db.run('INSERT INTO revoked_tokens (token) VALUES (?)', [token]);
}

// Verifier si un JWT est revoque
async function isRevokedToken(token) {
	return (!!await db.get('SELECT * FROM revoked_tokens WHERE token = ?', [token]));
}

// Get un user disponible pour jouer
async function getAvailableUser(name){
//	const db = await getDB();
	const user = await db.get('SELECT * FROM users WHERE status = "pending" AND name != ?', [name]);
	console.log("From getAvailableUser :", user);
	return user;
}

// Get pour 

// Update Info
async function updateValue(table, column, name, newValue) {
	//! pour eviter injection 
	const query = `UPDATE ${table} SET ${column} = ? WHERE name = ?`;
	await db.run(query,[ newValue, name ]);
	return (await getUserByName(table, name));
}

//export async function updateValue(...) {
//    return new Promise<void>((resolve, reject) => {
//        db.run(sql, [newValue, name], function (err) {
//            if (err) return reject(err);
//            resolve();
//        });
//    });
//}

// Update Status
async function updateStatus(table, name, newStatus) {
//	const db = await getDB();
	await db.run('UPDATE ' + table + ' SET status = ? WHERE name = ?', [newStatus, name]);
}

export async function updateStatsWinner(table, userID) {
	// recuper played_matches et match_wins
	// faire les updates
	// calculer le win_rate en pourcentage
	let { played_matches, match_wins } = await db.get(`SELECT played_matches, match_wins FROM ` + table + ` WHERE id = ?`, [ userID ]);
	played_matches++;
	match_wins++;
	const win_rate = (match_wins / played_matches) * 100;
	await db.run(`UPDATE ` + table + ` SET match_wins = ?,
		wins_streak = (wins_streak + 1), played_matches = ?,
		win_rate = ? WHERE id = ?`, [ match_wins, played_matches, win_rate, userID ]);
}

export async function updateStatsLoser(table, userID) {
	// recuper played_matches et match_wins
	// faire les updates avant l'insertion
	// calculer le win_rate en pourcentage
	let { played_matches, match_wins } = await db.get(`SELECT played_matches, match_wins FROM ` + table + ` WHERE id = ?`, [ userID ]);
	played_matches++;
	const win_rate = (match_wins / played_matches) * 100;
	await db.run(`UPDATE ` + table + ` SET wins_streak = 0,
		played_matches = ?, win_rate = ?
		WHERE id = ?`, [ played_matches, win_rate, userID ]);
}

// Delete user i ntable
async function deleteUserInTable(table, userName) {
	await db.run('DELETE FROM ' + table + ' WHERE name = ?', [userName]);
}

// Supprimer les registered pending depuis plus de 15 minutes
export async function deletePendingRegistered(time) {
	await db.run(`DELETE FROM registered WHERE status = ? AND created_at <= ?`,
		[ 'pending', time ]
	);
}

async function getUserTournament(listLogin, listGuests) {
	const registered = await db.all(`SELECT win_rate , id , type FROM registered WHERE id IN (${listLogin.join(',')})`);
	const guests = await db.all(`SELECT win_rate , id , type FROM guest WHERE id IN (${listGuests.join(',')})`);
	return { registered, guests };
}

export { insertInTable, getUserByName, getUsers,
	getColumnFromTable, getAvailableUser, updateValue,
	insertRevokedToken, isRevokedToken, updateStatus, deleteUserInTable, getUserById, getUserTournament};
