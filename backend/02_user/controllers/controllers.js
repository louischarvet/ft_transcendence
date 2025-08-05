import bcrypt from 'bcrypt';
import { isInDatabase, insertInDatabase, getUserByName, getUsers, 
	insertInTable, getColumnFromTable, getAvailableUser, updateStatus } from '../models/models.js'
import { checkNameFormat } from '../common_tools/checkNameFormat.js';	

// Récupère tous les utilisateurs
export async function fetchUsers(request, reply) {
	const users = await getUsers();
	return reply.send(users);
}

// rout POST /guest
export async function createGuest(request, reply) {
	const guests = await getColumnFromTable('id', 'guests');
	console.log("guests: ", guests);
	const len = guests.length;
	const newID = (!len ? 1 : guests[len - 1].id + 1);
	const name = "Guest" + newID;

	const toInsert = { name: name };
	await insertInTable('guests', toInsert);

	const token = await request.server.jwt.sign({ name: name, role: 'guest' }, { expiresIn: '1h' });
	return reply.code(201).send({ message: 'Guest created', token });
}

// route POST /register
export async function signIn(request, reply) {
	const { name, password } = request.body;

	if (!await checkNameFormat(name))
		return reply.code(400).send({ error: 'Name format is incorrect. It must begin with an alphabetic character and contain only alphanumeric characters.' });
	
	const exists = await isInDatabase(name);
	if (exists)
		return reply.code(409).send({ error: 'User already exists' });
	
	// hachage du password
	const hashedPassword = await bcrypt.hash(password, 10);
	const toInsert = { name: name, hashedPassword: hashedPassword };
	await insertInTable('users', toInsert);
	// token expiration ?
	const token = await request.server.jwt.sign({ name: name, role: 'player' }, { expiresIn: '1h' });
	return reply.code(201).send({ message: 'User created', token });
}

// route PUT /login
export async function logIn(request, reply) {
	const { name, password } = request.body;

	const user = await getUserByName(name);

	if (user === undefined)
		return reply.code(400).send({ error: 'User is not in the database' });
	if (await bcrypt.compare(password, user.hashedPassword)) {
		updateStatus(name, 'available');
		const token = await request.server.jwt.sign({ name: name, role: 'player' }, { expiresIn: '1h' });

		return reply.code(202).send({ message: 'User logged in', token });
	} else
		return reply.code(401).send({ error: 'Bad password' });
}

// Recupere un user par son nom
// route GET /users/:name
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


export async function getRandomUser(request, reply) {
	const { name } = request.user;

	const randomUser = await getAvailableUser(name);
	console.log("Test randomUser :", randomUser);
	if (randomUser === undefined)
		return reply.code(404).send({ error: 'No player available.' });

	return reply.code(201).send(randomUser);
}

export async function changeState(request, reply) {
	const reqBody = request.body;
	// check si player2 existe
	// s'il n'existe pas -> player1 VS IA
	const name = reqBody.name;
	if (name === undefined)
		return reply.code(400).send({ error: 'Name is required' });
	
	const newState = reqBody.status;
	if (newState === undefined)
		return reply.code(400).send({ error: 'Status is required' });
	

	// verifier si l'etat n'a pas change entre temps ?
	// et si les deux jouerus concernes cherchent a /random en meme temps?
	await updateStatus(name, newState);
	return reply.code(201).send({message : 'States updated!'});
}
