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
	return db.get('SELECT * FROM ' + table + ' WHERE name = ?', [name]);
}

async function insertInTable(table, toInsert) {
	const name = toInsert.name;
	if (toInsert.hashedPassword) { // signin -- with password
		const hashedPassword = toInsert.hashedPassword;
		await db.run("INSERT INTO " + table + "(name, hashedPassword) VALUES (?, ?)",
			[name, hashedPassword]);
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
	const user = await db.get('SELECT * FROM users WHERE status = "available" AND name != ?', [name]);
	console.log("From getAvailableUser :", user);
	return user;
}

// Update States
async function updateStatus(table, name, newStatus) {
//	const db = await getDB();
	await db.run('UPDATE ' + table + ' SET status = ? WHERE name = ?', [newStatus, name]);
}


export { insertInTable, getUserByName, getUsers,
	getColumnFromTable, getAvailableUser, insertRevokedToken,
	isRevokedToken, updateStatus };
