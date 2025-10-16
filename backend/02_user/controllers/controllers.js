import bcrypt from 'bcrypt';
import { insertInTable, getUserByName, getUserById, getUsers, updateValue,
	getColumnFromTable, getAvailableUser, updateStatus,
	updateStatsWinner, updateStatsLoser, deleteUserInTable, getUserTournament} from '../models/models.js'
import { generateJWT, revokeJWT } from '../authentication/auth.js';
import { sendCode } from '../authentication/twofa.js';
import { checkNameFormat, checkEmailFormat, checkPasswordFormat } from '../common_tools/checkFormat.js';	
import fs from 'fs';
import path from 'path';

const secureCookieOptions = {
	httpOnly: true,
	secure: true,
	sameSite: 'Strict'
};

async function clearCookies(reply) {
	reply.clearCookie('accessToken')
		.clearCookie('refreshToken');
}

// rout POST /guest
export async function createGuest(request, reply) {
	const guests = await getColumnFromTable('id', 'guest');
	const len = guests.length;
	const newID = (len ? guests[len - 1].id + 1 : 1);
	const name = "Guest" + newID;
	const tmp = request.body.tmp;

	await insertInTable('guest', {
		name: name
	});

	// possiblement foireux si creation en tant que P1 avec tmp==true -> pas de token
	const user = await getUserByName('guest', name);
	user.verified = true;

	clearCookies(reply);

	if (!tmp) {
		const { accessToken, refreshToken } = await generateJWT(user);
		reply.setCookie('accessToken', accessToken, {
			...secureCookieOptions,
			maxAge: 1800,
			path: '/'
		})
		.setCookie('refreshToken', refreshToken, {
			...secureCookieOptions,
			maxAge: 604800,
			path: '/session/refresh'
		})
	}

	return reply.code(201).send({
		user,
		message: 'Guest created'
	});
}

// route POST /register
export async function register(request, reply) {
	const { name, password, email} = request.body;

	if (!await checkNameFormat(name))
		return reply.code(400).send({ error: 'Name format is incorrect. It must begin with an alphabetic character and contain only alphanumeric characters.' });

	if (!await checkEmailFormat(email))
		return reply.code(400).send({ error: 'Email format is incorrect. It must be a valid email address.' });

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
	// temporary accessToken with verified == false
	const { accessToken } = await sendCode({
		name: name,
		email: email,
		id: user.id
	});
	
	updateStatus('registered', name, 'pending');

	clearCookies(reply);

	return reply.code(201)
		.setCookie('accessToken', accessToken, {
			...secureCookieOptions,
			maxAge: 1800,
			path: '/twofa/verify'
		})
		.send({
			user,
			message: 'User ' + name + ' created'
		});
}

// route PUT /login
export async function logIn(request, reply) {
	const { name, password, tmp } = request.body;

	const exists = await getUserByName('registered', name);

	clearCookies(reply);
	
	if (exists === undefined)
		return reply.code(400).send({ error: 'User is not in the database' });
	if (exists.status !== 'logged_out')
		return reply.code(409).send({ error: 'User already logged in.' });

	if (await bcrypt.compare(password, exists.hashedPassword)) {
		await updateStatus('registered', name, 'available');

		const user = await getUserByName('registered', name);
		delete user.hashedPassword;
		delete user.email;
		
		user.verified = true;

		const { accessToken, refreshToken } = await generateJWT(user);
		const body = {
			user: user,
			message: 'User ' + name + ' available.',
		};
		return reply.code(201)
			.setCookie('accessToken', accessToken, {
				...secureCookieOptions,
				maxAge: 1800,
				path: '/'
			})
			.setCookie('refreshToken', refreshToken, {
				...secureCookieOptions,
				maxAge: 604800,
				path: '/session/refresh'
			})
			.send(body);
	} else
		return reply.code(400).send({ error: 'Bad password' });
}

// Route PUT /logout
// Si le joueur est pending, le supprime.
export async function logOut(request, reply) {
//	console.log("####Function logOut called:\n");
	const revRes = await revokeJWT(request.headers.authorization); ///////
	if (revRes.status == 200) {
		if (request.user.type == "guest")
			deleteUserInTable(request.user.type, request.user.name);
		else
			updateStatus(request.user.type, request.user.name, 'logged_out');

		clearCookies(reply);

		return reply.code(201).send({
			message: "Successfully logged out."
		});
	} else
		return revRes;
}

// Route DELETE /delete
export async function deleteUser(request, reply) {
	console.log("####Function deleteUser called:\n");

	const user = request.user;
	console.log("user", user);
	//! ajout le 02/10/2025
	//! verifier le token de l'user ?
	const { password} = request.body;

	const exists = await getUserByName('registered', user.name);
	if (!exists)
		return reply.code(400).send({ error: 'User is not in the database' });

	const passwordMatch = await bcrypt.compare(password, exists.hashedPassword);
	if (!passwordMatch)
		return reply.code(401).send({ error: 'Bad password' });
	
	const revRes = await revokeJWT(request.headers.authorization);
	if (revRes.status == 200) {
		console.log("###request.user.type : ", request.user.type, "\n###");
		deleteUserInTable(request.user.type, request.user.name);

		clearCookies(reply);

		return reply.code(200).send({
			message: "User successfully deleted."
		});
	}
	else{
		return revRes;
	}
}

// Route PUT /update
export async function updateInfo(request, reply) {
	console.log("####Function updateInfo called:\n");

	const currentUser = await getUserByName('registered', request.user.name);
	if (!currentUser)
		return reply.code(401).send( { error : 'User not Authentified'});
		
	console.log("currentUser : ", currentUser, "\n");

	const { password, toUpdate, newValue } = request.body;
	if (!password || !toUpdate || !newValue)
		return reply.code(401).send( { error : 'Need all infos in body'});

	// Verif si schema ok
	if (!['email', 'password'].includes(toUpdate))
		return reply.code(400).send({ error: "Only email and password can be updated" });
	
	// Verif actuel passwrd
	const passwordMatch = await bcrypt.compare(password, currentUser.hashedPassword);
	if (!passwordMatch) 
		return reply.code(401).send({ error: "Incorrect password" });


	let columnToUpdate;
	let valueToUpdate;

	if (toUpdate === 'password') {
		columnToUpdate = 'hashedPassword';
		const salt = await bcrypt.genSalt();
		valueToUpdate = await bcrypt.hash(newValue, salt);
		if (!await checkPasswordFormat(newValue))
			return reply.code(401).send({ error: "Incorrect password format" });
	} else if (toUpdate === 'email'){
		if (!await checkEmailFormat(newValue))
			return reply.code(400).send({ error: "Invalid email format"});
		columnToUpdate = toUpdate;
		valueToUpdate = newValue;
	}

	// Data mis a jour
	const updatedUser = await updateValue('registered', columnToUpdate, currentUser.name, valueToUpdate);
	if (updatedUser)
		delete updatedUser.hashedPassword;

	return reply.code(200).send({
		user: updatedUser,
		message: 'User info updated'
	});
}

// Route PUT /updateAvatar
export async function updateAvatar(request, reply) {
	console.log("####Function updateAvatars called:\n");
	const user = await getUserByName('registered', request.user.name);

	if (!user)
		return reply.code(400).send({ error: 'Unauthorized' });

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

	const relativePath = `/pictures/${fileName}`;
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
		return reply.code(400).send({ error : 'Bad Token'}); // inutile

	const userId = user.id;
	if (!userId)
		return reply.code(400).send({ error : 'Id of user required'}); // inutile

	const type = user.type;
	if (!type)
		return reply.code(400).send({ error : 'Type of user required'}); // inutile

	const userInfos = await getUserById(type, userId);
	if (!userInfos)
		return reply.code(404).send({ error : 'User not found'});
	delete userInfos.hashedPassword;

	return reply.code(200).send({
		user: userInfos
	});
};

// Route GET /:id
export	async function fetchUserById(request, reply){
	const user = request.params;
	if (!user)
		return reply.code(400).send({ error : 'Need param'});
	//! ajout le 17/09/2025
	const userId = request.params.id;
	if (!userId)
		return reply.code(400).send({ error : 'Id of user required'});

	const userInfos = await getUserById('registered', userId);
	if (!userInfos)
		return reply.code(404).send({ error : 'User not found'});

	delete userInfos.hashedPassword;
	delete userInfos.email;
	delete userInfos.friends;

	return reply.code(200).send({
		user: userInfos
	});
};

// Route GET /getguest/:id
export async function getGuestById(request, reply) {
	const userId = request.params.id;
	if (!userId)
		return reply.code(400).send({ error : 'Id of user required'});

	const userInfos = await getUserById('guest', userId);
	if (!userInfos)
		return reply.code(404).send({ error : 'User not found'});

	return reply.code(200).send({
		user: userInfos
	});
}

// Route POST /addfriend/(name)
export async function addFriend(request, reply) {
	const currentUser = request.user;
	if(request.params.friendName.length > 64)
		return reply.code(401).send({ error: 'Invalid name' });

	if (currentUser.type !== 'registered')
		return reply.code(400).send({ error: 'Only registered users can add friends' });
	
	const user = await getUserByName('registered', currentUser.name);
	if (!user) 
		return reply.code(400).send({ error: 'User not found' });

	const { friendName } = request.params;
	if (friendName === undefined)
		return reply.code(400).send({ error: 'friendName is missing' });

	const friend = await getUserByName('registered', friendName);
	if (!friend)
		return reply.code(404).send({ error: 'Username not found' });

	
	let friendListString = user.friends || "";
	//split en tableau sans ; pour verifier apres si l'ami est deja dans la liste en js
	const friendList = friendListString ? friendListString.split(";").filter(f => f) : [];
	console.log("friendList before add friend :", friendList);

	//verifier si l'ami est deja dans la liste
	if (friendList.includes(String(friend.id)))
		return reply.code(409).send({ error: 'Friend already in the list' });

	const val = friendListString + friend.id + ";";

	//ajouter via la methode updateValue
	await updateValue('registered', "friends", user.name, val);
	console.log("####\n");

	delete friend.hashedPassword;
	delete friend.type;
	delete friend.friends;

	// renvoyer le profil user mis a jour!
    return reply.code(200).send({newFriend : friend,  message: `Friend ${friendName} added.` });
}

// Route GET pour recuperer les profiles des amis
export async function getFriendsProfiles(request, reply) {
	const user = await getUserById('registered', request.user.id);
	const { friends } = user;
	if (friends === undefined || friends === null)
		return reply.code(204).send({ friends: [], message: "User has no friends" });
	else {
		// console.log("friends : ", friends);
		const friendsIDs = await friends.split(';').filter(p => p);
		let friendsProfiles = new Array();
		for (let i = 0, n = friendsIDs.length; i < n; i++) {
			friendsProfiles[i] = await getUserById('registered', friendsIDs[i]);
			if(!friendsProfiles[i])
				continue;
			delete friendsProfiles[i].hashedPassword;
			delete friendsProfiles[i].email;
			
			if (friendsProfiles[i] === undefined)
				return reply.code(400).send({ error: 'Bad friend ID.' });
		}
		return reply.code(200).send({
			friends: friendsProfiles,
			message: 'Friends profiles.'
		});
	}
}

export async function deleteFriend(request, reply) {
	const friendId = request.body.id;
	if (!friendId)
		return reply.code(400).send({ error: 'Need friend id to delete' });

	const friend = await getUserById('registered', friendId);
	if (!friend)
		return reply.code(404).send({ error: 'Friend user not found' });

	const user = await getUserById('registered', request.user.id);
	if (!user)
		return reply.code(401).send({ error: 'User not authenticated' });

	const { friends } = user;
	if (!friends)
		return reply.code(204).send({ friends: [], message: "User has no friends" });

	const friendList = friends.split(";").filter(f => f);
	console.log("friendList before delete:", friendList);

	if (!friendList.includes(String(friend.id)))
		return reply.code(409).send({ error: 'Friend not in the list' });

	// Retirer le friend.id de la liste
	const newFriendList = friendList.filter(id => id !== String(friend.id));

	await updateValue('registered', "friends", user.name, newFriendList.join(";"));

	return reply.code(200).send({
		friends: newFriendList,
		message: `Friend ${friend.name || friend.id} deleted successfully.`,
	});
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

	if (winner_id > 0)
		await updateStatsWinner(winner_type, winner_id);

	if (loser_id > 0)
		await updateStatsLoser(loser_type, loser_id);

	const user1 = p1_id > 0 ? await getUserById(p1_type, p1_id) : {
		id: 0,
		type: 'ia'
	};
	const user2 = p2_id > 0 ? await getUserById(p2_type, p2_id) : {
		id: 0,
		type: 'ia'
	};
	delete user1.hashedPassword;
	delete user2.hashedPassword;
	delete user1.email;
	delete user2.email;
	delete user1.telephone;
	delete user2.telephone;

	return reply.code(200).send({
		user1: user1,
		user2: user2,
		message: 'Stats updated.'
	});
}

// Route Get / tournaments
export async function fetchUserTournament(request, reply) {
	const listUsers = request.body.ArrayIdAndType;
	if (!listUsers || listUsers.length === 0)
		return reply.code(400).send({ error: 'List of users is required' });
	
	let listLogin =new Array();
	let listGuests =new Array();
	for (let i = 0; i < listUsers.length; i++){
		if (listUsers[i].type === 'registered')
			listLogin.push(listUsers[i].id);
		else if (listUsers[i].type === 'guest')
			listGuests.push(listUsers[i].id);
		else
			return reply.code(400).send({ error: 'Type of user is not correct' });
	};
	const usersInfos = await getUserTournament(listLogin, listGuests);
	if (!usersInfos || usersInfos.length === 0)
		return reply.code(404).send({ error: 'Users not found' });

	delete usersInfos.hashedPassword;
	delete usersInfos.email;
	delete usersInfos.friend_ship;
	return reply.code(200).send({
		users: JSON.stringify(usersInfos),
		message: 'Users found'
	});
}
