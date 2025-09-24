import bcrypt from 'bcrypt';
import { insertInTable, getUserByName, getUserById, getUsers, updateValue,
	getColumnFromTable, getAvailableUser, updateStatus,
	updateStatsWinner, updateStatsLoser, deleteUserInTable } from '../models/models.js'
import { generateJWT, authenticateJWT, revokeJWT } from '../authentication/auth.js';
import { sendCode } from '../authentication/twofa.js';
import { checkNameFormat, checkEmailFormat, checkPhoneFormat } from '../common_tools/checkFormat.js';	
import fs from 'fs';
import path from 'path';

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
export async function register(request, reply) {
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

	// 2FA
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

		// 2FA disabled for login
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
	} else
		return revRes;
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
	//! ajout le 17/09/2025	
	const currentUser = request.user;
	if (currentUser)
		reply.code(401).send( { error : 'User not Authentified'});
		
	console.log("currentUser : ", currentUser, "\n");

	const body = request.body;
	const { name, password, toUpdate, newValue } = body;
	if (!body || !name || !password || !toUpdate || !newValue)
		reply.code(401).send( { error : 'Need all infos in body caca'});
	console.log();
	//! modifié le 17/09/2025
	const user = await getUserByName('registered', currentUser.name);
	//! ajout le 17/09/2025
	//TODO VERIFIER name et user
	if (!user || user.name != name)
		reply.code(401).send( { error : 'User not found'});

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
	// if (toUpdate === 'name'){
	// 	if (await getUserByName('registered', newValue))
	// 		return reply.code(401).send({ error: 'Name is already taken' });
		
	// 	if (!await checkNameFormat(newValue))
	// 		return reply.code(401).send({ error: 'Name format is incorrect. It must begin with an alphabetic character and contain only alphanumeric characters.' });
		
	// 	await updateValue('registered', col, currentUser.name, val);
	// }

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

	//! ajout le 18/09/2025
	// newValue , name enleve
	const newUser = await getUserByName('registered', newValue);
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

// Route GET /id (recupere ses propre infos via son token)
export	async function fetchUserByIdToken(request, reply){

	const user = request.user;
	if (!user)
		return reply.code(401).send({ error : 'Bad Token'});

	const userId = user.id;
	if (!userId)
		return reply.code(401).send({ error : 'Id of user required'});

	const type = user.type;
	if (!type)
		return reply.code(401).send({ error : 'Type of user required'});

	const userInfos = await getUserById(type, userId);
	if (!userInfos)
		return reply.code(404).send({ error : 'User not found'});
	delete userInfos.hashedPassword;
	delete userInfos.email;
	delete userInfos.telephone;
	delete userInfos.friend_ship;
	delete userInfos.type;

	return reply.code(200).send({
		user: userInfos
	});
};

// Route GET /:id
export	async function fetchUserById(request, reply){
	const user = request.params;
	if (!user)
		return reply.code(401).send({ error : 'Need param'});
	//! ajout le 17/09/2025
	const userId = request.params.id;
	if (!userId)
		return reply.code(401).send({ error : 'Id of user required'});

	const userInfos = await getUserById('registered', userId);
	if (!userInfos)
		return reply.code(404).send({ error : 'User not found'});

	delete userInfos.hashedPassword;
	delete userInfos.email;
	delete userInfos.telephone;
	delete userInfos.friend_ship;

	return reply.code(200).send({
		user: userInfos
	});
};

// Route POST /addfriend/(name)
export async function addFriend(request, reply) {
	console.log("####Function addFriend called:\n");

	//! ajout le 09/06/2025
	const currentUser = request.user;
	if (!currentUser)
		return reply.code(401).send({ error : 'Bad Token'});
	if (currentUser.type !== 'registered')
		return reply.code(401).send({ error: 'Only registered users can add friends' });
	
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

// Récupère le statut d'un utilisateur par son nom
export async function fetchUserStatus(request, reply) {
	const { name } = request.params;
	const user = await getUserByName(name);

	//! ajout le 17/09/2025
	if (!user)
		return reply.code(404).send({ error: 'User not found' });

	return reply.send(user.status);
}

// Route PUT /changestatus
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

export async function updateStats(request, reply) {
	const { p1_id, p1_type, p2_id, p2_type, winner_id } = request.body;
	let winner_type, loser_id, loser_type;
	if (winner_id === p1_id) {
		winner_type = p1_type;
		loser_id = p2_id;
		loser_type = p2_type;
	} else {
		winner_type = p2_type;
		loser_id = p1_id;
		loser_type = p1_type;
	}

	// gagnant:
	// 	match_wins++
	//	wins_streak++
	//	played_matches++
	if (winner_id > 0)
		await updateStatsWinner(winner_type, winner_id);

	// perdant:
	//	wins_streak = 0
	//	played_matches++
	if (loser_id > 0)
		await updateStatsLoser(loser_type, loser_id);

	const user = await getUserById(p1_type, p1_id);
	delete user.hashedPassword;
	delete user.email;
	delete user.telephone;

	return reply.code(200).send({
		user: user,
		message: 'Stats updated.'
	});
}