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

export function getToken() {
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

export async function getUserById(id: number){
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

export async function updateInfo(password: string, toUpdate: string, newValue: string){
	const token = getToken();
	if (!token) return null;
	console.log("ooooo", password, toUpdate, newValue);

	const response = await fetch(`/api/user/update`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${token}`,
		},
		body: JSON.stringify({
			password : password,
			toUpdate : toUpdate,
			newValue : newValue,
		}),
	});

	const data = await response.json();
	if (!response.ok) {
		console.error("Erreur updateInfo:", data.error);
		throw new Error(data.error || "Erreur lors de la mise à jour");
	}

	return data;
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

export async function removeFriend(friendId: string){
	const token = getToken();
	if (!token)
		return null;
	const response = await fetch('/api/user/deleteFriend', {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			id: friendId,
		}),
	});
	const json = await response.json();

	console.log("removeFriend resonse -> ", json);
	if (!json.error) {
		console.log("deleteFriend error here");
		return true;
	}
	return false;
}

export async function checkConnection() {
	const user = getUser();
	const token = getToken();

	if (!user || !token)
		return false;

	return true;
}

export async function checkConnectionGuest() {
	const user = getUser();
	const token = getToken();

	if (user.type === 'guest' && token)
		return true;
	return false;	
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
	});
    if (!response.ok) {
        console.error("Erreur HTTP :", response.status);
        return false;
    }

    const json = await response.json();
    console.log("#### Response asGuest -> ", json, "####");

    if (json.user) {
        setUser(json.user);
        setToken(json.token); // possiblement undefinded du coup si player2
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