//./models/user.js
import bcrypt, { hash } from 'bcrypt';
import { getDB } from '../common_tools/getDB.js';	

const db = await getDB();

// Récupère tous les utilisateurs
async function getUsers() {
//	const db = await getDB();
	return db.all('SELECT * FROM users');
}

// Vérifie si l'utilisateur existe dans la base de données
async function isInDatabase(name) {
//	const db = await getDB();
	const user = await db.get('SELECT * FROM users WHERE name = ?', [name]);
	return !!user;
}

// Récupère un utilisateur par son nom
async function getUserByName(name) {
//	const db = await getDB();
	return db.get('SELECT * FROM users WHERE name = ?', [name]);
}

// Insère un nouvel utilisateur dans la base de données
async function insertInDatabase(name) {
//	const db = await getDB();
	await db.run("INSERT INTO users (name, status) VALUES (?, ?)", [name, 'available']);
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

// Get un user disponible pour jouer
async function getAvailableUser(name){
//	const db = await getDB();
	const user = await db.get('SELECT * FROM users WHERE status = "available" AND name != ?', [name]);
	console.log("From getAvailableUser :", user);
	return user;
}

// Update States
async function updateStatus(name, newStatus) {
//	const db = await getDB();
	await db.run('UPDATE users SET status = ? WHERE name = ?', [newStatus, name]);
}


export { isInDatabase, insertInDatabase, getUserByName, getUsers,
	insertInTable, getColumnFromTable, getAvailableUser, updateStatus };
