//./models/user.js
import { getDB } from '../common_tools/getDB.js';	

// Récupère tous les utilisateurs
async function getUsers() {
	const db = await getDB();
	return db.all('SELECT * FROM users');
}

// Vérifie si l'utilisateur existe dans la base de données
async function isInDatabase(name) {
	const db = await getDB();
	const user = await db.get('SELECT * FROM users WHERE name = ?', [name]);
	return !!user;
}

// Récupère un utilisateur par son nom
async function getUserByName(name) {
	const db = await getDB();
	return db.get('SELECT * FROM users WHERE name = ?', [name]);
}

// Insère un nouvel utilisateur dans la base de données
async function insertInDatabase(name) {
	const db = await getDB();
	await db.run("INSERT INTO users (name, status) VALUES (?, ?)", [name, 'available']);
}

// Get un user disponible pour jouer
async function getAvailableUser(name){
	const db = await getDB();
	const user = await db.get('SELECT * FROM users WHERE status = "available" AND name != ?', [name]);
	console.log("From getAvailableUser :", user);
	return user;
}

// Update States
async function updateState(name, newState) {
	const db = await getDB();
	await db.run('UPDATE users SET status = ? WHERE name = ?', [newState, name]);
}

export { isInDatabase, insertInDatabase, getUserByName, getUsers, getAvailableUser, updateState};
