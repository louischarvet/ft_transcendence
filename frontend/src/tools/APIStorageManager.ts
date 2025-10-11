import { navigate } from "../router";

function setUser(user: { [name: string]: string }) {
	localStorage.setItem('user', JSON.stringify(user));
}

function setToken(token: string) {
	localStorage.setItem('token', token);
}

export function getUser() {
	const jsonUser = localStorage.getItem('user');
	return jsonUser ? JSON.parse(jsonUser) : null;
}

function getToken() {
	return localStorage.getItem('token');
}

export async function getUserByToken(){
	const token = getToken();
	if (!token)
		return null;

	const response = await fetch('/api/user/id', {
		method: 'GET',
		headers: { 'Authorization': `Bearer ${token}`},
	});
	const json = await response.json();
	if (json.user) {
		setUser(json.user);
	}

	return json;
}

export async function getUserById(id: number): Promise<{ user: any } | null> {
	const token = getToken();
	if (!token)
		return null;

	const response = await fetch(`/api/user/${id}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		console.warn("Erreur backend :", response.status);
		return null;
	}

	const data = await response.json();
	return data;
}

//export async function getFriendProfil(id) {
//	const token = getToken();
//	if (!token)
//		return null;
	
//	const response = await fetch('/api/user/id', {
//		method: 'GET',
//		headers: { 'Authorization': `Bearer ${token}`},
//	});
//}

export async function Logout(): Promise<Response | null> {
	const token = getToken();
	if (!token)
		return null;

	const response = await fetch('/api/user/logout', {
		method: 'PUT',
		headers: { 'Authorization': `Bearer ${token}`},
	});

	return response;
}

export async function addNewFriend(friendName: string){
	const token = getToken();
	if (!token)
		return null;
	//a mettre dans .env
	const response = await fetch(`/api/user/addfriend/${encodeURIComponent(friendName)}`, {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${token}`,
		},
	});

	return response;
}

export async function getFriendsList(): Promise<{ friends: { name: string; status: string , id: number }[] } | null> {
	const token = getToken();
	if (!token)
		return null;

	const response = await fetch('/api/user/getfriendsprofiles', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});

	//Si le backend renvoie 204 No Content, on retourne null
	if (response.status === 204) {
    	console.log("Aucun ami trouvé.");
		return { friends: [] };
  	};

	const data = await response.json() as { friends: { name: string; status: string, id: number }[] };
	return data;
}


export async function checkConnection() { // TO DO
	const user = getUser();
	const token = getToken();

	if (!user || !token)
		return false;	
	return true;
}

export async function register(name: string, email: string, password: string) {
	const response = await fetch('/api/user/register', {
		method: 'POST',
		headers: {
		'Content-Type': 'application/json',
		},
		body: JSON.stringify({
		name,
		email,
		password,
		}),
	});
	const json = await response.json();
	if (json.user) {
		setUser(json.user);
		return true;
	}
	return false;
}

export async function asGuest(asPlayer2: Boolean = false) { // TO DO
	const response = await fetch('/api/user/guest', {
		method: 'POST',
		headers: {
		'Content-Type': 'application/json',
		},
		body: JSON.stringify({
		tmp: asPlayer2,
		}),
		// body: JSON.stringify({}),
	});
	const json = await response.json();
	console.log("#### Response asGuest -> ", json, "####");
	if (json.user) {
		setUser(json.user);
		setToken(json.token);
		return true;
	}
	return false;
}

export async function login(name: string, password: string) {
	const response = await fetch('/api/user/login', {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json'},
		body: JSON.stringify({ name: name, password: password, tmp: false })
	});
	
	const json = await response.json();

	if (!response.ok)
		return { success: false, message: json.error || "Unknown error" };
	
	if (json.user) {
		setUser(json.user);
		setToken(json.token);
		return { success: true };
	}
	return { success: false, message: "Unexpected response from server" };
}

export async function deleteUser(password : string) {
	const token = getToken();

	const response = await fetch('/api/user/delete', {
		method: 'DELETE',
		headers: {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
		password
		}),
	});
	const json = await response.json();

	console.log("fetch deleteUser here"); ////////////////////////
	if (!json.error) {
		console.log("deleteUser removeItem here");
		localStorage.removeItem('user');
		localStorage.removeItem('token');
		return true;
	}
	return false;
}

export async function verifyTwoFactorCode(code: string) {
	const user = getUser();

	const response = await fetch('/api/twofa/verifycode', {
		method: 'POST',
		headers: {
		'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			id: user?.id,
			name: user?.name,
			email: user?.email,
			type: user?.type,
			code,
		}),
	});
	const json = await response.json();
	console.log("verify2fa -> ", json);
	if (json.token) {
		setToken(json.token);
		return true;
	}
	return false;
}