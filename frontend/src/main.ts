// frontend/src/main.ts
import { authFetch } from './utils/authFetch';

// Fonction pour charger des data protégées (token ... necessaire)
async function loadProtectedData() {
	try {
		const res = await authFetch('/api/protected');
		if (!res.ok) throw new Error('Erreur ' + res.status);
		const data = await res.json();
		console.log(data);
	} catch (err) {
		console.error(err);
		// rediriger vers login si besoin
	}
}

function renderHome() {
	const app = document.getElementById('app');
	if (!app)
		return;
	app.innerHTML = `
		<div class="accueil">
			<h1 class="title">BlackPong</h1>
			<input type="text" id="username" name="username" placeholder="Pseudo..." class="input-field" autocomplete="username">
			<button id="createUserButton" class="play-button">Play</button>
		</div>
	`;

	const btn = document.getElementById('createUserButton');
	btn?.addEventListener('click', async () => {

		const nameInput = document.getElementById('username') as HTMLInputElement;
		try {
			const res = await fetch('/api/user/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: nameInput.value }),
			});
			const data = await res.json();
			console.log("data", JSON.stringify(data));
			alert('Utilisateur créé avec succès !');

			// Si le token est renvoyé, le stocker dans localStorage et rediriger vers la page de jeu
			if (data.token) {
				localStorage.setItem('token', data.token);
				window.location.href = '/selectGame';
			}

		} catch (err) {
			console.error(err);
			alert('Erreur lors de la requête');
		}
  });
}

function renderSelectGame() {
	const app = document.getElementById('app');
	if (!app)
		return;
	app.innerHTML = `
		<div class="accueil">
            <h1 class="title">BlackPong</h1>
            <h2 class="text-white text-2xl mb-8">Select a Game</h2>
            <div class="grid grid-cols-2 gap-8">
                <div class="game-card" id="pong-card">
                    <div class="game-content">
                        <h3>Pong</h3>
                    </div>
                </div>
                <div class="game-card" id="blackjack-card">
                    <div class="game-content">
                        <h3>Blackjack</h3>
                    </div>
                </div>
            </div>
        </div>
	`;
}	

window.addEventListener('load', renderHome);
