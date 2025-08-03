// frontend/src/utils/authFetch.ts

// pour genérer des requêtes authentifiées avec un token JWT
export async function authFetch(input: RequestInfo, init?: RequestInit, retry = true) {

	// Récupérer le token depuis localStorage
	const token = localStorage.getItem('token');

	// Si le token n'existe pas, on ne peut pas faire de requête authentifiée
	const headers = new Headers(init?.headers);

	if (token) 
		headers.set('Authorization', `Bearer ${token}`);

	const fetchInit = { ...init, headers };

	let response = await fetch(input, fetchInit);

	if (response.status === 401) {
		// tentative de refresh token (à adapter selon ton backend)
		const refreshResponse = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });

		if (refreshResponse.ok) {
			const { token: newToken } = await refreshResponse.json();
			if (newToken) {
				localStorage.setItem('token', newToken);
				headers.set('Authorization', `Bearer ${newToken}`);
				response = await fetch(input, { ...init, headers });
			} else {
				localStorage.removeItem('token');
				throw new Error('Token refresh failed');
			}
		} else {
			localStorage.removeItem('token');
			throw new Error('Token refresh failed');
		}
	}

	return response;
}
