function setUser(user: { [name: string]: string }) {
	localStorage.setItem('user', JSON.stringify(user));
}

export function getUser() {
	const jsonUser = localStorage.getItem('user');
	return jsonUser ? JSON.parse(jsonUser) : null;
}

export async function getRefreshToken() {
	const cookie = await cookieStore.get("refreshToken");
	console.log("cookie getRefreshToken => ", cookie);
	return 	cookie?.value;
}

export async function getTokenAcces() {
	const cookie = await cookieStore.get("accessToken");
	return 	cookie?.value;
}

export async function getUserByToken(){
	const response = await fetch('/api/user/id', {
		method: 'GET',
		credentials: 'include',
	});
	const json = await response.json();
	if (json.user) {
		setUser(json.user);
	}

	return json;
}

export async function getUserById(id: number){

	const response = await fetch(`/api/user/${id}`, {
		method: 'GET',
		headers: {'Content-Type': 'application/json'},
		credentials: 'include',
	});

	if (!response.ok) {
		console.warn("Erreur backend :", response.status);
		return null;
	}

	const data = await response.json();
	return data;
}

export async function Logout(): Promise<Response | null> {

	const response = await fetch('/api/user/logout', {
		method: 'PUT',
		credentials: 'include',
	});

	return response;
}

export async function updateInfo(password: string, toUpdate: string, newValue: string){

	console.log("ooooo", password, toUpdate, newValue);

	const response = await fetch(`/api/user/update`, {
		method: "PUT",
		headers: {'Content-Type': 'application/json'},
		credentials: 'include',
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
	const response = await fetch(`/api/user/addfriend/${encodeURIComponent(friendName)}`, {
		method: "POST",
		headers: {'Content-Type': 'application/json'},
		credentials: 'include',
	});

	return response;
}

export async function getFriendsList(): Promise<{ friends: { name: string; status: string , id: number }[] } | null> {


	const response = await fetch('/api/user/getfriendsprofiles', {
		method: 'GET',
		headers: {'Content-Type': 'application/json'},
		credentials: 'include',
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

	const response = await fetch('/api/user/deleteFriend', {
		method: 'DELETE',
		headers: {'Content-Type': 'application/json'},
		credentials: 'include',
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
	if (!user)
		return false;

	try {
		const response = await fetch('/api/user/id', {
			method: 'GET',
			credentials: 'include',
		});
		if (!response.ok) return false;

		const data = await response.json();
		if (data.user) {
			if (user.type === 'guest' && user.status !== 'available')
				return false;
			setUser(data.user);
			return true;
		}
		return false;
	}
	catch (err) {
		console.error(err);
		return false;
	}
}


export async function checkConnectionGuest() {
	const user = getUser();
	// const token = getToken();

	if (user.type === 'guest'/* && token*/)
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
        // setToken(json.token); // possiblement undefinded du coup si player2
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
		// setToken(json.token);
		return { success: true };
	}
	return { success: false, message: "Unexpected response from server" };
}

export async function deleteUser(password : string) {
	// const token = getToken();

	const response = await fetch('/api/user/delete', {
		method: 'DELETE',
		headers: {
		'Content-Type': 'application/json',
		// 'Authorization': `Bearer ${token}`,
		},
		credentials: 'include',
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
	if (json.user && json.token) {
		setUser(json.user);
		// setToken(json.token);
		return true;
	}
	return false;
}


export type Match = {
	id: string,
	player1: any,
	player2: any,
	created_at: string
}

export async function createMatch(playerType: "ai" | "guest" | "registered", name?: string, password?: string): Promise<Match | null> {
	// const token = getToken();
	// if (!token) return null;

	if (playerType == "registered" && !name && !password) return null;

	const res = await fetch(`/api/match/matches`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json',/* 'Authorization': token */},
		credentials: 'include',

		body: JSON.stringify({ playerType, ...(playerType == "registered" ? { name, password } : {}) })
	});
	const data = await res.json();
	if (data.error) return null;
	return data.match as Match;
}

export async function updateMatchResult(scoreP1: number, scoreP2: number, match: Match) {
	// const token = getToken();
	// if (!token) return false;

	const res = await fetch(`/api/match/matches/${match.id}.result`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json',/* 'Authorization': token*/ },
		credentials: 'include',
		body: JSON.stringify({ scoreP1, scoreP2, ...match })
	});
	const data = await res.json();
	if (data.error) return false;
	return true;
}

export async function launchTournament(nbPlayers: number) {
	// const token = getToken();
	// if (!token) return null;

	const res = await fetch('/api/tournament/launchtournament', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json',/* 'Authorization': token*/ },
		credentials: 'include',
		body: JSON.stringify({ nbPlayers })
	});
	const data = await res.json();
	if (data.error) return null;
	console.log("launchTournament data -> ", data);
	return data.Tournament as Tournament;
}

export async function joinTournamentAsLogged(tournamentId: number, name: string, password: string): Promise<{id: string, name: string} | null> {
	// const token = getToken();
	// if (!token) return null;

	const res = await fetch(`/api/tournament/jointournamentregistered/${tournamentId}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json',/* 'Authorization': token*/ },
		credentials: 'include',
		body: JSON.stringify({ name, password })
	});
	const data = await res.json();
	if (data.error) return null;
	return { id: data.user.id, name: data.user.name };
}

export async function joinTournamentAsGuest(tournamentId: number) {
	// const token = getToken();
	// if (!token) return null;

	const res = await fetch(`/api/tournament/jointournamentguest/${tournamentId}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json',/* 'Authorization': token*/ },
		credentials: 'include',
	});
	const data = await res.json();
	if (data.error) return null;
	console.log("joinTournamentAsGuest data -> ", data);
	return { id: data.user.id, name: data.user.name };
}

export type Tournament = {
	id: number,
	matchs: Match[],
	nb_players: number,
	nbPlayersTotal: number,
	created_at: string
}

export async function startTournament(tournamentId: number): Promise<Tournament | null> {
	// const token = getToken();
	// if (!token) return null;

	const res = await fetch(`/api/tournament/starttournament/${tournamentId}`, {
		method: 'POST',
		headers: {'Content-Type': 'application/json'/* 'Authorization': token*/ },
		credentials: 'include',
	});
	const data = await res.json();
	if (data.error) return null;
	return data.tournament as Tournament;
}

export async function nextTournamentMatch(scoreP1: number, scoreP2: number, match: Match): Promise<Tournament | null> {
	// const token = getToken();
	// if (!token) return null;

	const res = await fetch(`/api/tournament/next`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json',/* 'Authorization': token*/ },
		credentials: 'include',
		body: JSON.stringify({ scoreP1, scoreP2, ...match})
	});
	const data = await res.json();
	if (data.error) return null;
	return data.tournament as Tournament;

}