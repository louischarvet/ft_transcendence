
import { isInDatabase, insertInDatabase, getUserByName, getUsers , getAvailableUser, updateState} from '../models/models.js'
import { checkNameFormat } from '../common_tools/checkNameFormat.js';	

// Récupère tous les utilisateurs
export async function fetchUsers(request, reply) {
	const users = await getUsers();
	return reply.send(users);
}

// route POST pour tester les tokens JWT
export async function testJWT(request, reply) {
	const name = request.body.name;
	if (name === undefined)
		return reply.code(400).send({ error: 'Name and status are required' });
	const user = await getUserByName(name);
	if (user === undefined)
		return reply.code(400).send({ error: 'User not found !' });
	const token = await request.server.jwt.sign({ name: user.name, role: 'user' }, { expiresIn: '1h' });
	console.log('TOKEN: ', token);
	return reply.code(201).send({ token });
	
}

// route POST /register
export async function createUser(request, reply) {

	// On recupere le nom et le statut de l'user avec request.body
	// request.body c'est un objet qui contient la data avec POST
	const { name } = request.body;
	if (name === undefined)
		return reply.code(400).send({ error: 'name and status are required' });

	if (!checkNameFormat(name))
		return reply.code(400).send({ error: 'Name format is incorrect. It must begin with an alphabetic character' });
	
	const exists = await isInDatabase(name);
	if (exists)
		return reply.code(409).send({ error: 'User already exists' });
	
	await insertInDatabase(name);

	return reply.code(201).send({ message: 'User created', name });
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
	const query = request.query;
	console.log("Test Query", query);
	if (query === undefined)
		return reply.code(400).send({ error: 'Query is required' });

	const name = query.name;
	if (name === undefined)
		return reply.code(400).send({ error: 'Name is required' });

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
	await updateState(name, newState);
	return reply.code(201).send({message : 'States updated!'});
}
