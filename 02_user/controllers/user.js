import { checkNameFormat, isInDatabase, insertInDatabase, getUserByName, getUsers } from '../models/user.js'
import { getDB } from '../common_tools/db.js';	

// Récupère tous les utilisateurs
export async function fetchUsers(request, reply) {
	const users = await getUsers();
	return reply.send(users);
}

// Récupère un utilisateur par son nom
export async function fetchUserByName(request, reply) {
	const { name } = request.params;
	if (!name)
		return reply.code(400).send({ error: 'Name is required' });

	const user = await getUserByName(name);
	if (!user)
		return reply.code(404).send({ error: 'User not found' });

	return reply.send(user);
}

// Récupère le statut d'un utilisateur par son nom
export async function fetchUserStatus(request, reply) {
	const { name } = request.params;
	const user = await getUserByName(name);
	return reply.send(user.status);
}

// Crée un nouvel utilisateur
export async function createUser(request, reply) {
	const { name } = request.body;
	if (!name)
		return reply.code(400).send({ error: 'Name is required' });

	const db = await getDB();
	console.log(db);		
	// Vérifie si l'utilisateur existe déjà
	const existing = await db.get('SELECT * FROM users WHERE name = ?', [name]);
	console.log(existing);
	if (existing)
		return reply.code(409).send({ error: 'User already exists' });

	// Insère le nouvel utilisateur
	await db.run('INSERT INTO users (name, status) VALUES (?, ?)', [name, 'disponible']);
	return reply.code(201).send({ message: 'User created', name });
}

export async function checkUserExists(request, reply) {
	const { name } = request.query;

	if (!name)
		return { error: 'Name is undefined' };

	if (!checkNameFormat(name))
		return { error: 'Name format is incorrect. It must begin with an alphabetic character' };

	const exists = await isInDatabase(name);

	if (!exists){
		await insertInDatabase(name);
		return { error: 'none' };
	} else
		return { error: 'Name is already taken. Please choose another one.' };
}

export async function getRandomUser(request, reply) {
	const db = await getDB();
	// pas vraiment random: le premier qui vient (le plus ancien?)
	// ne pas prendre le name du joueur qui cherche! OK
	const randomUser = await db.get('SELECT * FROM users WHERE status = "available" AND name != ?', [request.query.name]);

	if (randomUser === undefined)
		return { error: "No player available." };
	return (randomUser);
}

export async function changeState(request, reply) {
	const db = await getDB();

	const reqBody = request.body;
	const p1Name = reqBody.player1;
	const p2Name = reqBody.player2;
	const newStateP1 = reqBody.type + ":" + p2Name;
	const newStateP2 = reqBody.type + ":" + p1Name;

	// verifier si l'etat n'a pas change entre temps ?
	// et si les deux jouerus concernes cherchent a /random en meme temps?
	await db.run('UPDATE users SET status = ? WHERE name = ?', [newStateP1, p1Name]);
	await db.run('UPDATE users SET status = ? WHERE name = ?', [newStateP2, p2Name]);
}