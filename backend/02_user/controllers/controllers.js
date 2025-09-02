import bcrypt from 'bcrypt';
import { insertInTable, getUserByName, getUsers, updateValue,
	getColumnFromTable, getAvailableUser, updateStatus,
	deleteUserInTable } from '../models/models.js'
import { generateJWT, authenticateJWT, revokeJWT } from '../authentication/auth.js';
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
	const response = await generateJWT(user);
	const jsonRes = await response.json();
	const token = jsonRes.token;

	// update value: iat du token -> jwt_time user
	await updateValue('registered', 'jwt_time', name, jsonRes.iat);

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
	const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt());

	await insertInTable('registered', {
		name: name,
		hashedPassword: hashedPassword
	});

	const user = await getUserByName('registered', name);
	delete user.hashedPassword;

	const response = await generateJWT(user);
	const jsonRes = await response.json();
	const token = jsonRes.token;

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
		const response = await generateJWT(user);
		const jsonRes = await response.json();
		const token = jsonRes.token;

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
	const token = request.headers.authorization;
	const body = request.body;

	const authRes = await authenticateJWT(token, body);
	if (authRes.status == 200) {
		const revRes = await revokeJWT(token, body);
		if (revRes.status == 200) {
			if (body.type == 'guest')
				deleteUserInTable('guest', body.name);
			else
				updateStatus(body.type, body.name, 'logged_out');

			return reply.code(201).send({
				message: "Successfully logged out."
			});
		} else {
			return revRes;
		}
	} else {
		return authRes;
	}
}

// Route DELETE /delete
export async function deleteUser(request, reply) {
	const token = request.headers.authorization;
	const body = request.body;

	const authRes = await authenticateJWT(token, body);
	if (authRes.status == 200) {
		const revRes = await revokeJWT(token, body);
		if (revRes.status == 200) {
			deleteUserInTable(body.type, body.name);

			return reply.code(200).send({
				message: "User successfully deleted."
			});
		} else {
			return revRes;
		}
	} else {
		return authRes;
	}
}

export async function updateInfo(request, reply) {
	// pic password email telephone
	const token = request.headers.authorization;
	const body = request.body;
	const { name, password, toUpdate, newValue } = body;

	try {
		const user = await getUserByName('registered', name);

		if (!await bcrypt.compare(password, user.hashedPassword))
			return reply.code(401).send({ error: 'Bad password' });

		const authRes = await authenticateJWT(token, user);
		if (authRes.status == 200) {
			const col = toUpdate === 'password' ?
				'hashedPassword' : toUpdate;
			const val = toUpdate === 'password' ?
				await bcrypt.hash(newValue, await bcrypt.genSalt()) : newValue;

			updateValue('registered', col, name, val);

			return reply.code(200).send({
				user: await getUserByName('registered', name),
				message: 'User info updated'
			});
		} else
			return authRes;
	} catch (err) {
		console.log(err); ////
	}
}

// Autre service ?
export async function addFriend(request, reply) {
	const token = request.headers.authorization;
	const body = request.body;

	// authentication

	const authRes = await authenticateJWT(token, body);
	if (authRes.status == 200) {
		// addFriend
		const { friendName } = request.params;
		if (friendName === undefined)
			return reply.code(401).send({ error: 'friendName is missing' });

		const friend = getUserByName('registered', friendName);
		if (friend === undefined)
			return reply.code(401).send({ error: 'Friend not found' });

		// envoyer une demande d'amis

	} else
		return authRes;
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
//	console.log("Test randomUser :", randomUser);
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
	return reply.code(201).send({message : 'Status updated!'});
}
