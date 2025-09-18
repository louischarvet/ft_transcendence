import bcrypt from 'bcrypt';
import { insertInTable, getUserByName, getUsers, updateValue,
	getColumnFromTable, getAvailableUser, updateStatus,
	deleteUserInTable } from '../models/models.js'
import { generateJWT, authenticateJWT, revokeJWT } from '../authentication/auth.js';
import { sendCode } from '../authentication/twofa.js';
import { checkNameFormat } from '../common_tools/checkNameFormat.js';	
import fs from 'fs';
import path from 'path';

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

	return reply.code(201).send({
		user,
		token,
		message: 'Guest created'
	});
}

// route POST /register
export async function register(request, reply) {
	const { name, password, email} = request.body;

	if (!await checkNameFormat(name))
		return reply.code(400).send({ error: 'Name format is incorrect. It must begin with an alphabetic character and contain only alphanumeric characters.' });
	
	const exists = await getUserByName('registered', name);
	if (exists !== undefined)
		return reply.code(409).send({ error: 'User already exists' });
	
	const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt());

	await insertInTable('registered', {
		name: name,
		hashedPassword: hashedPassword,
		email: email,
	});

	const user = await getUserByName('registered', name);
	delete user.hashedPassword;
	delete user.email;
	delete user.telephone;

	// 2FA
	await sendCode({
		name: name,
		email: email,
		id: user.id
	});

	return reply.code(201).send({
		user,
		message: 'User ' + name + ' created'
	});
}

// route PUT /login
export async function logIn(request, reply) {
	const { name, password, tmp } = request.body;

	const exists = await getUserByName('registered', name);

	if (exists === undefined)
		return reply.code(400).send({ error: 'User is not in the database' });
	else if (exists.status !== 'logged_out')
		return reply.code(409).send({ error: 'User already logged in.' });

	if (await bcrypt.compare(password, exists.hashedPassword)) {
		updateStatus('registered', name, 'pending');

		const user = await getUserByName('registered', name);
		delete user.hashedPassword;
		delete user.email;
		delete user.telephone;

		// 2FA
		// await sendCode({
		// 	name: name,
		// 	email: email,
		// 	id: user.id
		// });

		const token = tmp == true ? undefined : await generateJWT(user);
		const body = {
			user: user,
			token: token,
			message: 'User ' + name + ' pending 2fa.',
		};
		return reply.code(201).send(body);
	} else
		return reply.code(401).send({ error: 'Bad password' });
}

// Route PUT /logout
export async function logOut(request, reply) {
	const revRes = await revokeJWT(request.headers.authorization);
	if (revRes.status == 200) {
		if (request.user.type == 'guest')
			deleteUserInTable('guest', request.user.name);
		else
			updateStatus(request.user.type, request.user.name, 'logged_out');

		return reply.code(201).send({
			message: "Successfully logged out."
		});
	} else {
		return revRes;
	}
}

// Route DELETE /delete
export async function deleteUser(request, reply) {

	const revRes = await revokeJWT(request.headers.authorization);
	if (revRes.status == 200) {
		deleteUserInTable(request.user.type, request.user.name);

		return reply.code(200).send({
			message: "User successfully deleted."
		});
	}
	else
		return revRes;
}

export async function updateInfo(request, reply) {
	const body = request.body;
	const { name, password, toUpdate, newValue } = body;

	const user = await getUserByName('registered', name);

	if (!await bcrypt.compare(password, user.hashedPassword))
		return reply.code(401).send({ error: 'Bad password' });
		
	const col = toUpdate === 'password' ?
		'hashedPassword' : toUpdate;
	const val = toUpdate === 'password' ?
		await bcrypt.hash(newValue, await bcrypt.genSalt()) : newValue;

	// verifier si le nom existe deja
	if (toUpdate === 'name'
		&& await getUserByName('registered', newValue))
		return reply.code(401).send({ error: 'Name is already taken' });

	await updateValue('registered', col, name, val);

	const newUser = await getUserByName('registered', (toUpdate === 'name' ? newValue : name));
	delete newUser.hashedPassword;
	delete newUser.email;
	delete newUser.telephone;

	return reply.code(200).send({
		user: newUser,
		message: 'User info updated'
	});
}

export async function updateAvatar(request, reply) {
	const user = getUserByName('registered', request.user.name);

	if (!user)
		return reply.code(401).send({ error: 'Unauthorized' });

	const data = await request.file();
	if (!data)
		return reply.code(400).send({ error: 'No file uploaded' });

	const uploadDir = path.join(process.cwd(), 'pictures');
	console.log("############ UPLOADDIR = ", uploadDir); 
	if (!fs.existsSync(uploadDir))
		fs.mkdirSync(uploadDir, { recursive: true });

	if (user.picture && fs.existsSync(user.picture))
		fs.unlinkSync(user.picture);

	const ext = path.extname(data.filename);
	const fileName = `avatar_${user.id}_${Date.now()}${ext}`;
	const filePath = path.join(uploadDir, fileName);

	const buffer = await data.toBuffer();
	fs.writeFileSync(filePath, buffer);

	const relativePath = `./pictures/${fileName}`;
	await updateValue('registered', 'picture', user.name, relativePath);

	return reply.code(200).send({
		message: 'Avatar updated successfully',
		picture: relativePath
	});
}



// Autre service ?
export async function addFriend(request, reply) {
	// Auth deja faite et token deja verifier
	// request.params cest l'amis a ajouter

	const body = request.body;
	console.log("body dans addFriend :", body);
	const name  = body.name;
	if (name === undefined)
		return reply.code(401).send({ error: 'Name is missing' });

	const user = await getUserByName('registered', name);
	if (!user) 
		return reply.code(401).send({ error: 'User not found' });

	const { friendName } = request.params;
	if (friendName === undefined)
		return reply.code(401).send({ error: 'friendName is missing' });

	const friend = await getUserByName('registered', friendName);
	if (!friend) 
		return reply.code(401).send({ error: 'User friend not found' });

	
	let friendListString = user.friend_ship || "";
	//split en tableau sans ; pour verifier apres si l'ami est deja dans la liste en js
	const friendList = friendListString ? friendListString.split(";").filter(f => f) : [];
	console.log("friendList :", friendList);

	//verifier si l'ami est deja dans la liste
	if (friendList.includes(String(friend.id)))
		return reply.code(409).send({ error: 'Friend already in the list' });

	const col = 'friend_ship';
	const val = friendListString + friend.id + ";";

	//ajouter via la methode updateValue
	await updateValue('registered', col, name, val);
    return reply.code(200).send({ message: `Friend ${friendName} added.` });
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
//	console.log("#### IM chagestatus in Docker user\n########");
	// check si player2 existe
	// s'il n'existe pas -> player1 VS IA
//	console.log("####### \n", reqBody, "#####\n");
	const { name, status, type } = request.body;
	if (name === undefined)
		return reply.code(400).send({ error: 'Name is required' });
	if (status === undefined)
		return reply.code(400).send({ error: 'Status is required' });
	
	await updateStatus(type, name, status);
	const user = await getUserByName(type, name);
	delete user.hashedPassword;
	delete user.telephone;
	delete user.email;
	// verifier si l'etat n'a pas change entre temps ?
	// et si les deux jouerus concernes cherchent a /random en meme temps?
	return reply.code(201).send({
		user: user,
		message : 'Status updated!',
	});
}
