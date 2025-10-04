// controllers/fetchFunctions.js

export async function fetchChangeStatus(player, status) {
	const body = JSON.stringify({
		name: player.name,
		id: player.id,
		status: status,
		type: player.type,
	});

	const res = await fetch('http://user-service:3000/changestatus', {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		body: body,
	});
	if (!res.ok)
		return res;
	return ((await res.json()).user);
}