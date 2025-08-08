import bcrypt from 'bcrypt';
import { insertInTable, getUserByName, getUsers, 
	getColumnFromTable, getAvailableUser, insertRevokedToken,
	isRevokedToken, updateStatus, deleteUserInTable } from '../models/models.js'
import { checkNameFormat } from '../common_tools/checkNameFormat.js';	

// rout POST /guest
export async function createGuest(request, reply) {
	const guests = await getColumnFromTable('id', 'guests');
	const len = guests.length;
	const newID = (len ? guests[len - 1].id + 1 : 1);
	const name = "Guest" + newID;

	await insertInTable('guests', {
		name: name
	});

	const user = await getUserByName('guests', name);
	const token = await request.server.jwt.sign({
		name: name,
		role: 'guest'
	}); // token expiration ?

	return reply.code(201).send({
		user,
		token,
		message: 'Guest created'
	});
}

// route POST /register
export async function signIn(request, reply) {
	const { name, password } = request.body;

	if (!await checkNameFormat(name))
		return reply.code(400).send({ error: 'Name format is incorrect. It must begin with an alphabetic character and contain only alphanumeric characters.' });
	
	const exists = await getUserByName('registered', name);
	if (exists !== undefined)
		return reply.code(409).send({ error: 'User already exists' });
	
	// hachage du password
	const hashedPassword = await bcrypt.hash(password, 10);

	// insertion
	await insertInTable('registered', {
		name: name,
		hashedPassword: hashedPassword });

	const user = await getUserByName('registered', name);
	const token = await request.server.jwt.sign({
		name: name,
		role: 'registered'
	}); // token expiration ?

	return reply.code(201).send({
		user,
		token,
		message: 'User created'
	});
}

// route PUT /login
export async function logIn(request, reply) {
	const { name, password } = request.body;

	const exists = await getUserByName('registered', name);

	if (exists === undefined)
		return reply.code(400).send({ error: 'User is not in the database' });
	else if (exists.status !== 'logged_out')
		return reply.code(409).send({ error: 'User already logged in.' });
	if (await bcrypt.compare(password, exists.hashedPassword)) {
		updateStatus('registered', name, 'available');

		const user = await getUserByName('registered', name);

		const token = await request.server.jwt.sign({
			name: name,
			role: 'registered'
		}); // token expiration ?

		return reply.code(202).send({
			user,
			token,
			message: 'User logged in'
		});
	} else
		return reply.code(401).send({ error: 'Bad password' });
}

// Route PUT /logout
export async function logOut(request, reply) {
	const token = request.headers.authorization.split(' ')[1];
	// verifier si le token n'est pas revoque
	if (await isRevokedToken(token)) {
		return reply.code(409).send({
			error: "Revoked token."
		});
	}
	// revoke token
	insertRevokedToken(token);
	// updateStatus
	updateStatus(request.user.role, request.user.name, 'logged_out');
	return reply.code(201).send({
		message: "Successfully logged out."
	});
}

// Route DELETE /delete/:name
export async function deleteUser(request, reply) {
	const user = request.user;
	const userName = user.name;

	if (userName === request.params.name) {
		deleteUserInTable(user.role, userName);
		return reply.code(200).send({ message: 'User successfully deleted.' });
	}
	else
		return reply.code(409).send({ error: 'Non authorized to delete user.' });
}

// Récupère tous les utilisateurs
export async function fetchUsers(request, reply) {
	const users = await getUsers();
	return reply.send(users);
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

export async function changeStatus(request, reply) {
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
