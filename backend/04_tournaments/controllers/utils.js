//// utils.js
//import {
//  addPlayerToTournament,
//  setTournamentWinner,
//  getTournamentsWonByUser,
//  addMatchesAndPlayersToHistory,
//  addMatchesStringToTournament,
//  addDataRoundTable,
//  startTournamentInternal
//} from '../models/model.js';

//export async function fetchUserTournament(ArrayIdAndType){
//	const res = await fetch(`http://user-service:3000/tournament`, {
//		method: 'POST', headers: {'Content-Type':'application/json'},
//		body: JSON.stringify({ ArrayIdAndType })
//	});
//	if (!res.ok)
//		return { error: 'Users not found' };
//	const users = await res.json();
//	return JSON.parse(users.users);
//}

//export async function fetchGetUserById(id){
//	const res = await fetch(`http://user-service:3000/${id}`);
//	if (!res.ok)
//		return { error: 'User not found' };
//	return (await res.json()).user;
//}

//export async function fetchGetGuestById(id){
//	const res = await fetch(`http://user-service:3000/getguest/${id}`);
//	if (!res.ok)
//		return { error: 'User not found' };
//	return (await res.json()).user;
//}

//export async function fetchChangeStatusUser(user){
//	const res = await fetch(`http://user-service:3000/changestatus`, {
//		method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(user)
//	});
//	if (!res.ok)
//		return { error: 'User not found' };
//	return (await res.json()).user;
//}

//export async function fetchUserLogin(name, password){
//	const res = await fetch(`http://user-service:3000/login`, {
//		method: 'PUT', headers: {'Content-Type':'application/json'},
//		body: JSON.stringify({ name, password, tmp: true })
//	});
//	if (!res.ok)
//		return { error: 'Login failed' };
//	return (await res.json()).user;
//}

///* création et persist des matches (ancien createAndPersistMatches) */
//export async function createAndPersistMatches(matches, tournamentId, tournament){
//	const matchData = [];
//	for (const m of matches){
//		const res = await fetch(`http://match-service:3000/tournament`, {
//		method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(m)
//		});
//		if (!res.ok)
//			return { error: 'match_service' };
//		const j = await res.json();
//		matchData.push(j.match);
//	}
//	const matchesString = matchData.map(m=>m.id).join(';') + ';';
//	const h = await addMatchesAndPlayersToHistory(tournamentId, matchesString, tournament.players);
//	if (!h)
//		return { error:'history_fail' };
//	const a = await addMatchesStringToTournament(tournamentId, matchesString);
//	if (!a)
//		return { error:'tournament_update_fail' };
//	const r = await addDataRoundTable(tournamentId, tournament.rounds, matchesString, tournament.players);
//	if (!r)
//		return { error:'round_fail' };
//	const started = await startTournamentInternal(tournamentId);
//	if (!started)
//		return { error:'start_fail' };
//	return { matchData, matchesString, updatedTournament: started };
//}

//export async function setTournamentWinnerLocal(tournamentId, winnerId){
//	return await setTournamentWinner(tournamentId, winnerId);
//}

//export async function getTournamentsWonByUserLocal(userId){
//	return await getTournamentsWonByUser(userId);
//}
