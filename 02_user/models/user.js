//./models/user.js
import { getDB } from '../common_tools/db.js';	

// Vérifie si le format du nom est correct
function checkNameFormat(name) {
	/*  /^[a-zA-Z][a-zA-Z0-9]*$/.test(name)*/
	return /^[A-Z]$/i.test(name[0]) && /^[a-zA-Z0-9]+$/.test(name);
}
	
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

export { checkNameFormat, isInDatabase, insertInDatabase, getUserByName, getUsers };
