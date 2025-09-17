import bcrypt from 'bcrypt';
import { insertInTable, getUserByName, getUsers, updateValue,
	getColumnFromTable, getAvailableUser, updateStatus,
	deleteUserInTable } from '../models/models.js'
import { generateJWT, authenticateJWT, revokeJWT } from '../authentication/auth.js';
import { sendCode } from '../authentication/twofa.js';
import { checkNameFormat, checkEmailFormat, checkPhoneFormat } from '../common_tools/checkFormat.js';	
import fs from 'fs';
import path from 'path';
import { error } from 'console';

// rout POST /guest
export async function createGuest(request, reply) {
	console.log("####Function createGuest called:\n");
	const guests = await getColumnFromTable('id', 'guest');
	const len = guests.length;
	const newID = (len ? guests[len - 1].id + 1 : 1);
	const name = "Guest" + newID;

	await insertInTable('guest', {
		name: name
	});

	const user = await getUserByName('guest', name);
	const response = await generateJWT(user);
	const jsonRes = await response.json();
	const token = jsonRes.token;

	console.log("####\n");
	return reply.code(201).send({
		user,
		token,
		message: 'Guest created'
	});
}

// route POST /register
export async function signIn(request, reply) {
	console.log("####Function signIn called:\n");
	const { name, password, email} = request.body;

	if (!await checkNameFormat(name))
		return reply.code(400).send({ error: 'Name format is incorrect. It must begin with an alphabetic character and contain only alphanumeric characters.' });

	//! ajout le 17/09/2025
	if (!await checkEmailFormat(email))
		return reply.code(400).send({ error: 'Email format is incorrect. It must be a valid email address.' });

	////! ajout le 17/09/2025
	//if (!await checkPhoneFormat(telephone))
	//	return reply.code(400).send({ error: 'Phone format is incorrect. It must be a valid phone number.' });

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

	await sendCode({
		name: name,
		email: email,
		id: user.id
	});
	
	//!ajout le 17/09/2025
	updateStatus('registered', name, 'pending');
	console.log("####\n");
	return reply.code(201).send({
		user,
		message: 'User created'
	});
}

// route PUT /login
export async function logIn(request, reply) {
	console.log("####Function logIn called:\n");
	const { name, password, email } = request.body;

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

		await sendCode({
			name: name,
			email: email,
			id: user.id
		});
		
		console.log("####\n");
		return reply.code(201).send({
			user,
			message: 'User logged in'
		});
	} else
		return reply.code(401).send({ error: 'Bad password' });
}

// Route PUT /logout
export async function logOut(request, reply) {
	console.log("####Function logOut called:\n");
	const revRes = await revokeJWT(request.headers.authorization);
	if (revRes.status == 200) {
		//! ajout le 17/09/2025
		//! nom de la table "guests" au lieu de "guest"
		console.log("chek type : ", request.user.type, "\n");
		if (request.user.type == "guest")
			deleteUserInTable("guest", request.user.name);
		else
			updateStatus(request.user.type, request.user.name, 'logged_out');

		console.log("####\n");
		return reply.code(201).send({
			message: "Successfully logged out."
		});
	} else {
		console.log("####\n");
		return revRes;
	}
}

// Route DELETE /delete
export async function deleteUser(request, reply) {
	console.log("####Function deleteUser called:\n");

	const revRes = await revokeJWT(request.headers.authorization);
	if (revRes.status == 200) {
		console.log("###request.user.type : ", request.user.type, "\n###");
		deleteUserInTable(request.user.type, request.user.name);

		console.log("####\n");
		return reply.code(200).send({
			message: "User successfully deleted."
		});
	}
	else{
		console.log("####\n");
		return revRes;
	}
}

// Route PUT /update
export async function updateInfo(request, reply) {
	console.log("####Function updateInfo called:\n");
	const body = request.body;
	const { name, password, toUpdate, newValue } = body;

	const user = await getUserByName('registered', name);

	if (!await bcrypt.compare(password, user.hashedPassword))
		return reply.code(401).send({ error: 'Bad password' });
	
	//! ajout le 17/09/2025
	//! pour modifier le mot de passe
	const col = toUpdate === 'password' ?
		'hashedPassword' : toUpdate;
	const val = toUpdate === 'password' ?
		await bcrypt.hash(newValue, await bcrypt.genSalt()) : newValue;

	// verifier si le nom existe deja
	//! pour modifier le name
	if (toUpdate === 'name'){
		if (await getUserByName('registered', newValue))
			return reply.code(401).send({ error: 'Name is already taken' });
		
		if (!await checkNameFormat(newValue))
			return reply.code(401).send({ error: 'Name format is incorrect. It must begin with an alphabetic character and contain only alphanumeric characters.' });
		
		await updateValue('registered', col, name, val);
	}

	//! pour modifier le mail
	if (toUpdate === 'email'){
		if (!await checkEmailFormat(newValue))
			return reply.code(401).send({ error: 'Email format is incorrect. It must be a valid email address.' });
	}

	//! pour modifier le telephone
	if (toUpdate === 'telephone'){
		if (!await checkPhoneFormat(newValue))
			return reply.code(401).send({ error: 'Phone format is incorrect. It must be a valid phone number.' });
	}

	const newUser = await getUserByName('registered', (toUpdate === 'name' ? newValue : name));
	delete newUser.hashedPassword;
	delete newUser.email;
	delete newUser.telephone;

	console.log("####\n");
	return reply.code(200).send({
		user: newUser,
		message: 'User info updated'
	});
}

// Route PUT /updateAvatar
export async function updateAvatar(request, reply) {
	console.log("####Function updateAvatars called:\n");
	const user = await getUserByName('registered', request.user.name);

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
	
	console.log("####\n");
	return reply.code(200).send({
		message: 'Avatar updated successfully',
		picture: relativePath
	});
}

// Route POST /addfriend/(name)
export async function addFriend(request, reply) {
	console.log("####Function addFriend called:\n");

	//! ajout le 09/06/2025
	const currentUser = request.user;
	if (!currentUser)
		return reply.code(401).send({ error : 'Bad Token'});
	if (currentUser.type !== 'registered')
		return reply.code(401).send({ error: 'Only registered users can add friends' });
	
	//const body = request.body;
	//const name  = body.name;
	//if (name === undefined)
	//	return reply.code(401).send({ error: 'Name is missing' });

	const user = await getUserByName('registered', currentUser.name);
	if (!user) 
		return reply.code(401).send({ error: 'User not found' });

	const { friendName } = request.params;
	if (friendName === undefined)
		return reply.code(401).send({ error: 'friendName is missing' });

	const friend = await getUserByName('registered', friendName);
	if (!friend) 
		return reply.code(404).send({ error: 'User friend not found' });

	
	let friendListString = user.friend_ship || "";
	//split en tableau sans ; pour verifier apres si l'ami est deja dans la liste en js
	const friendList = friendListString ? friendListString.split(";").filter(f => f) : [];
	console.log("friendList before add friend :", friendList);

	//verifier si l'ami est deja dans la liste
	if (friendList.includes(String(friend.id)))
		return reply.code(409).send({ error: 'Friend already in the list' });

	const col = 'friend_ship';
	const val = friendListString + friend.id + ";";

	//ajouter via la methode updateValue
	await updateValue('registered', col, user.name, val);
	console.log("####\n");
    return reply.code(200).send({ message: `Friend ${friendName} added.` });
}

// Récupère tous les utilisateurs
//export async function fetchUsers(request, reply) {
//	const users = await getUsers();
//	return reply.send(users);
//}

// Recupere un user par son nom
// route GET /users/:name
//export async function fetchUserByName(request, reply) {
//	const { name } = request.params;
//	if (!name)
//		return reply.code(400).send({ error: 'Name is required' });

//	const user = await getUserByName(name);
//	if (!user)
//		return reply.code(404).send({ error: 'User not found' });

//	return reply.send(user);
//}

// Récupère le statut d'un utilisateur par son nom
export async function fetchUserStatus(request, reply) {
	const { name } = request.params;
	const user = await getUserByName(name);

	//! ajout le 17/09/2025
	if (!user)
		return reply.code(404).send({ error: 'User not found' });

	return reply.send(user.status);
}


//export async function getRandomUser(request, reply) {
//	const { name } = request.user;

//	const randomUser = await getAvailableUser(name);
////	console.log("Test randomUser :", randomUser);
//	if (randomUser === undefined)
//		return reply.code(404).send({ error: 'No player available.' });

//	return reply.code(201).send(randomUser);
//}

// Route PUT /changestatus
export async function changeStatus(request, reply) {
	console.log("####Function changeStatus called:\n");
	const reqBody = request.body;
	// check si player2 existe
	// s'il n'existe pas -> player1 VS IA
	console.log("####### body : \n", reqBody, "#####\n");
	const name = reqBody.name;
	if (name === undefined)
		return reply.code(400).send({ error: 'Name is required' });
	
	const newState = reqBody.status;
	if (newState === undefined)
		return reply.code(400).send({ error: 'Status is required' });
	
	const user = await getUserByName('registered', name);
	// verifier si l'etat n'a pas change entre temps ?
	// et si les deux jouerus concernes cherchent a /random en meme temps?
	await updateStatus('registered', name, newState);
	console.log("####\n");
	return reply.code(201).send({message : 'Status updated!'});
}
