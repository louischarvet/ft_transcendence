import { navigate } from "../router";

function setUser(user: { [name: string]: string }) {
	localStorage.setItem('user', JSON.stringify(user));
}

function buildFinishPayload(scoreP1:number, scoreP2:number, match:any) {
  const createdAt = match.created_at
    ?? new Date().toLocaleString('fr-FR').split(' GMT')[0]; // même format que DB

  return {
    id: Number(match.id),
    p1_id: Number(match.player1?.id ?? match.p1_id ?? 0),
    p1_type: match.player1?.type ?? match.p1_type ?? 'guest',
	// p1_name: match.player1?.name,
    p2_id: Number(match.player2?.id ?? match.p2_id ?? 0),
    p2_type: match.player2?.type ?? match.p2_type ?? 'guest',
	// p2_name: match.player2?.name,
    scoreP1: Number(scoreP1),
    scoreP2: Number(scoreP2),
    created_at: createdAt,
    tournament_id: match.tournament_id ?? 0
  };
}

// let isRefreshing = false;
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>  {
	
	let response = await fetch(input, { ...init, credentials: 'include' });

	// Si token expiré ou invalide
	if (response.status === 401 || response.status === 403) {
		console.warn("Access token expiré, tentative de refresh...");

		let refreshToken = await fetchRefreshToken();
		if (!refreshToken) {
			console.error("Refresh token invalide. Déconnexion...");
			localStorage.removeItem('user');
			navigate("/");
			return response;
		}
		// Relance une seule fois la requête initiale
		response = await fetch(input, { ...init, credentials: 'include' });
	}
	return response;
}

// exemple dutilisation
// export async function getFriendsList() {
// 	const response = await apiFetch('/api/user/getfriendsprofiles', {
// 		method: 'GET',
// 	});

// 	if (response.status === 204)
// 		return { friends: [] };

// 	if (!response.ok)
// 		return null;

// 	const data = await response.json();
// 	return data;
// }

export function getUser() {
	const jsonUser = localStorage.getItem('user');
	return jsonUser ? JSON.parse(jsonUser) : null;
}

// export async function getRefreshToken() {
// 	const cookie = await cookieStore.get("refreshToken");
// 	console.log("cookie getRefreshToken => ", cookie?.value);
// 	console.log("cookie getRefreshToken => ", cookie);
// 	return 	cookie?.value;
// }

// export async function getTokenAcces() {
// 	const cookie = await cookieStore.get("accessToken");
// 	console.log("cookie accessToken => ", cookie?.value);
// 	return 	cookie?.value;
// }

export async function getUserByToken(){
	const response = await apiFetch('/api/user/id', {
		method: 'GET',
		credentials: 'include',
	});
	const json = await response.json();
	if (json.user){
		setUser(json.user);
		return true;
	}
	return false;
}

export async function getUserById(id: number){

	const response = await apiFetch(`/api/user/${id}`, {
		method: 'GET',
		headers: {'Content-Type': 'application/json'},
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

	const response = await apiFetch(`/api/user/update`, {
		method: "PUT",
		headers: {'Content-Type': 'application/json'},
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

export async function updateAvatar(file: File) {
	const formData = new FormData();
	formData.append('file', file);

	const response = await apiFetch('/api/user/updateAvatar', {
		method: 'PUT',
		body: formData,
	});

	const json = await response.json();
	if (!response.ok) {
		console.error('Erreur updateAvatar:', json.error);
		throw new Error(json.error || 'Erreur lors de la mise à jour de l’avatar');
	}

	// MAJ du localStorage pour refleter le nouveau chemin
	const user = getUser();
	if (user) {
		user.picture = json.picture;
		localStorage.setItem('user', JSON.stringify(user));
	}
	return json;
}

export async function addNewFriend(friendName: string){
	const response = await apiFetch(`/api/user/addfriend/${encodeURIComponent(friendName)}`, {
		method: "POST",
	});

	return response;
}

export async function getFriendsList(): Promise<{ friends: { name: string; status: string , id: number }[] } | null> {

	const response = await apiFetch('/api/user/getfriendsprofiles', {
		method: 'GET',
	});

	// Si le backend renvoie 204 No Content, on retourne []
	if (response.status === 204) {
    	console.log("Aucun ami trouvé.");
		return { friends: [] };
  	};

	if (!response.ok) {
		console.warn("Erreur backend getFriendsList:", response.status);
		return null;
	}

	const data = await response.json() as { friends: { name: string; status: string, id: number }[] };
	return data;
}

export async function fetchRefreshToken(){

	// <-- Do NOT change this to apiFetch (sinon boucle potentielle)
	const response = await fetch("/api/refresh", {
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

	const response = await apiFetch('/api/user/deleteFriend', {
		method: 'DELETE',
		headers: {'Content-Type': 'application/json'},
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
	if (!(getUser())){ // foireux ?
	//	localStorage.removeItem('user');
		return false;
	}
	return true;
}

export async function register(name: string, email: string, password: string) {
	const response = await apiFetch('/api/user/register', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ name, email, password }),
	});

	const json = await response.json();

	// Si le serveur renvoie erreur (400, 409, etc.)
	if (!response.ok)
		return { success: false, message: json.message || json.error || 'Unknown error' };

	if (json.user) {
		setUser(json.user);
		return { success: true };
	}
	return { success: false, message: json.error || 'Unknown error' };
}

export async function asGuest(asPlayer2: Boolean = false) { // TO DO
	const response = await apiFetch('/api/user/guest', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
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
	const response = await apiFetch('/api/user/login', {
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

	const response = await apiFetch('/api/user/delete', {
		method: 'DELETE',
		headers: { 'Content-Type': 'application/json' },
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

	const response = await apiFetch('/api/twofa/verifycode', {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			id: user?.id,
			name: user?.name,
			email: user?.email,
			type: user?.type,
			code
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

export async function createMatch(playerType: string, name?: string, password?: string) {

	if (playerType == "registered" && !name && !password) return null;

	const res = await apiFetch(`/api/match/` + playerType, {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
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
	console.log('updateMatchResult called'); // vérif que la fn est appelée
	const payload = buildFinishPayload(scoreP1, scoreP2, match);
	console.log('[DEBUG] updateMatchResult payload ->', payload);
	const res = await apiFetch(`/api/match/finish`, {
		method: 'PUT',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify(payload)
	});
	const data = await res.json();
	if (data.error) return false;
	return true;
}

export async function launchTournament(nbPlayers: number) {

	const res = await apiFetch('/api/tournament/launchtournament', {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({ nbPlayers })
	});
	const data = await res.json();
	console.log("launchTournament data -> ", data);
	if (data.error) return null;
	return data.Tournament as Tournament;
}

export async function joinTournamentAsLogged(tournamentId: number, name: string, password: string): Promise<{id: string, name: string} | null> {

	const res = await apiFetch(`/api/tournament/jointournamentregistered/${tournamentId}`, {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({ name, password })
	});
	const data = await res.json();
	if (data.error) return null;
	return { id: data.user.id, name: data.user.name };
}

export async function joinTournamentAsGuest(tournamentId: number) {

	const res = await apiFetch(`/api/tournament/jointournamentguest/${tournamentId}`, {
		method: 'POST',
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

	const res = await apiFetch(`/api/tournament/starttournament/${tournamentId}`, {
		method: 'POST',
	});
	const data = await res.json();
	if (data.error)
		return null;
	// console.log("data tournament: ", data.tournament);
	console.log("data tournament as Type: ", data.tournament as Tournament);
	return data.tournament as Tournament;
}

export async function nextTournamentMatch(scoreP1: number, scoreP2: number, match: Match): Promise<any | null> {

	const res = await apiFetch(`/api/tournament/next`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
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
