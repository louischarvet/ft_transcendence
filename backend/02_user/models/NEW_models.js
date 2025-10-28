//./models/user.js
import bcrypt, { hash } from 'bcrypt';
import { getDB } from '../common_tools/getDB.js';	

const db = await getDB();

export async function getUserByName(table, name) {
	return (await db.get('SELECT * FROM ' + table + ' WHERE name = ?', [name]));
}

export async function getUserById(table, id) {
	return (await db.get('SELECT * FROM ' + table + ' WHERE id = ?', [id]));
}

export async function getColumnFromTable(column, table) {
	return (await db.all("SELECT " + column + " FROM " + table));
}

// Verifier si un JWT est revoque
export async function isRevokedToken(token) {
	return (!!await db.get('SELECT * FROM revoked_tokens WHERE token = ?', [token]));
}

// Update Info
export async function updateColumn(table, column, name, newValue) {
	const query = `UPDATE ${table} SET ${column} = ? WHERE name = ?`;
	await db.run(query,[ newValue, name ]);
	return (await getUserByName(table, name));
}

// Update Status
// async function updateStatus(table, name, newStatus) {
// 	await db.run('UPDATE ' + table + ' SET status = ? WHERE name = ?', [newStatus, name]);
// }

export async function updateStatsWinner(table, userID) {
	let { played_matches, match_wins } = await db.get(`SELECT played_matches, match_wins FROM ` + table + ` WHERE id = ?`, [ userID ]);
	played_matches++;
	match_wins++;
	const win_rate = (match_wins / played_matches) * 100;
	await db.run(`UPDATE ` + table + ` SET match_wins = ?,
		wins_streak = (wins_streak + 1), played_matches = ?,
		win_rate = ? WHERE id = ?`, [ match_wins, played_matches, win_rate, userID ]);
}

export async function updateStatsLoser(table, userID) {
	let { played_matches, match_wins } = await db.get(`SELECT played_matches, match_wins FROM ` + table + ` WHERE id = ?`, [ userID ]);
	played_matches++;
	const win_rate = (match_wins / played_matches) * 100;
	await db.run(`UPDATE ` + table + ` SET wins_streak = 0,
		played_matches = ?, win_rate = ?
		WHERE id = ?`, [ played_matches, win_rate, userID ]);
}

// Delete user i ntable
export async function deleteUserInTable(table, userName) {
	await db.run('DELETE FROM ' + table + ' WHERE name = ?', [userName]);
}

// ?
export async function getUserTournament(listLogin, listGuests) {
	const registered = await db.all(`SELECT win_rate , id , type FROM registered WHERE id IN (${listLogin.join(',')})`);
	const guests = await db.all(`SELECT win_rate , id , type FROM guest WHERE id IN (${listGuests.join(',')})`);
	return { registered, guests };
}
