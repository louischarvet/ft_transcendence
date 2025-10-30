function setUser(user: { [name: string]: string }) {
	localStorage.setItem('user', JSON.stringify(user));
}

export function getUser() {
	const jsonUser = localStorage.getItem('user');
	return jsonUser ? JSON.parse(jsonUser) : null;
}

export async function getRefreshToken() {
	const cookie = await cookieStore.get("refreshToken");
	console.log("cookie getRefreshToken => ", cookie?.value);
	console.log("cookie getRefreshToken => ", cookie);
	return 	cookie?.value;
}

export async function getTokenAcces() {
	const cookie = await cookieStore.get("accessToken");
	console.log("cookie accessToken => ", cookie?.value);
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
		credentials: 'include',
	});

	return response;
}

export async function getFriendsList(): Promise<{ friends: { name: string; status: string , id: number }[] } | null> {


	const response = await fetch('/api/user/getfriendsprofiles', {
		method: 'GET',
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

export async function fetchRefreshToken(){

	const response = await fetch ("/api/refresh", {
		method: 'POST',
		credentials: 'include',
	});

	if (response.status === 403) {
		console.log("Impossible de mettre a jour le refresh token", response);
		return false;
	}
	return true;
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
	const tmp = getUser();
	if (!tmp)
		return false;

	const response = await fetch('/api/user/id', {
		method: 'GET',
		credentials: 'include',
	});
	if (response.status === 401){
		if (await fetchRefreshToken() === false)
			return false;
		return true;
	}
	if (!response.ok)
		return false;
	const data = await response.json();
	console.log("data request -> ", data);
	if (data.user) {
		if (data.user.type === 'guest' && data.user.status !== 'available')
			return false;
		setUser(data.user);
		return true;
	}
	return false;
}

export async function register(name: string, email: string, password: string) {
	const response = await fetch('/api/user/register', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({ name, email, password }),
	});

	const json = await response.json();

	// Si le serveur renvoie ereur (400, 409, etc.)
	if (!response.ok)
		return { success: false, message: json.message || json.error || 'Unknown error' };

	if (json.user) {
		setUser(json.user);
		return { success: true };
	}
	return { success: false, message: json.error || 'Unknown error' };
}

export async function asGuest(asPlayer2: Boolean = false) { // TO DO
	const response = await fetch('/api/user/guest', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
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
		credentials: 'include',
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

	const response = await fetch('/api/user/delete', {
		method: 'DELETE',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({ password }),
	});
	const json = await response.json();

	console.log("fetch deleteUser here");
	if (!json.error) {
		console.log("deleteUser removeItem here");
		localStorage.removeItem('user');
		return true;
	}
	return false;
}

export async function verifyTwoFactorCode(code: string) {
	const user = getUser();

	const response = await fetch('/api/twofa/verifycode', {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		credentials: 'include',
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
	return true;
}

export type Match = {
	id: string,
	player1: { id: string, name?: string , type: string },
	player2: { id: string, name?: string , type: string },
	tournament_id: any | undefined
}
// ce       | match --> {
// match-service       |   id: 1,
// match-service       |   p1_id: 1,
// match-service       |   p1_type: 'guest',
// match-service       |   p2_id: 2,
// match-service       |   p2_type: 'guest',
// match-service       |   tournament_id: 0,
// match-service       |   created_at: 'Thu Oct 30 2025 15:31:37'
// match-service       | }

export async function createMatch(playerType: string, name?: string, password?: string) {

	if (playerType == "registered" && !name && !password) return null;

	const res = await fetch(`/api/match/` + playerType, {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		credentials: 'include',
		body: JSON.stringify({ playerType, ...(playerType == "registered" ? { name, password } : {}) })
	});
	const data = await res.json();
	if (data.error) return null;
	return {
		id: data.match.id,
		player1: {id: data.match.p1_id, type: data.match.p1_type, name: data.user1.name},
		player2: {id: data.match.p2_id, type: data.match.p2_type, name: data.user2.name}
	} as Match;
}

export async function updateMatchResult(scoreP1: number, scoreP2: number, match: Match) {

	const res = await fetch(`/api/match/finish`, {
		method: 'PUT',
		headers: {'Content-Type': 'application/json'},
		credentials: 'include',
		body: JSON.stringify({ scoreP1, scoreP2, ...match })
	});
	const data = await res.json();
	if (data.error) return false;
	return true;
}

export async function launchTournament(nbPlayers: number) {

	const res = await fetch('/api/tournament/launchtournament', {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		credentials: 'include',
		body: JSON.stringify({ nbPlayers })
	});
	const data = await res.json();
	console.log("launchTournament data -> ", data);
	if (data.error) return null;
	return data.Tournament as Tournament;
}

export async function joinTournamentAsLogged(tournamentId: number, name: string, password: string): Promise<{id: string, name: string} | null> {

	const res = await fetch(`/api/tournament/jointournamentregistered/${tournamentId}`, {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		credentials: 'include',
		body: JSON.stringify({ name, password })
	});
	const data = await res.json();
	if (data.error) return null;
	return { id: data.user.id, name: data.user.name };
}

export async function joinTournamentAsGuest(tournamentId: number) {

	const res = await fetch(`/api/tournament/jointournamentguest/${tournamentId}`, {
		method: 'POST',
		credentials: 'include',
	});
	const data = await res.json();
	if (data.error)
		return { error: data.error };
 	console.log("joinTournamentAsGuest data -> ", data);
    return { 
        id: data.user.id, 
        name: data.user.name, 
        message: data.message
    };
}

export type Tournament = {
	id: number,
	matches: Match[],
	nb_players: number,
	nbPlayersTotal: number,
}

export async function startTournament(tournamentId: number): Promise<Tournament | null> {

	const res = await fetch(`/api/tournament/starttournament/${tournamentId}`, {
		method: 'POST',
		credentials: 'include',
	});
	const data = await res.json();
	if (data.error)
		return null;
	console.log("data tournament: ", data.tournament);
	console.log("data tournament as Type: ", data.tournament as Tournament);
	return data.tournament as Tournament;
}

export async function nextTournamentMatch(scoreP1: number, scoreP2: number, match: Match): Promise<any | null> {

	const res = await fetch(`/api/tournament/next`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({ scoreP1, scoreP2, ...match})
	});
	const data = await res.json();
	if (data.error){
		console.error(data.error);
		return null;
	}
	console.log("next data : ", data);
	return data;
}