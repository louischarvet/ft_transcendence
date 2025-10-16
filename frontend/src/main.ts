import { defineRoutes, renderRoute, navigate} from './router';
import './style.css';
import Home from './pages/Home';
// import SelectGame from './pages/SelectGame';
import Pong from './pages/Pong';
import Blackjack from './pages/Blackjack';
import Tournament from './pages/Tournament';
import Profil from './pages/Profil';
import FriendProfil from './pages/FriendProfil';
import { getUserByToken } from './tools/APIStorageManager';

defineRoutes([
	{ path: '/', render: () => Home() },
	{ path: '/register', render: () => Home("register") },
	{ path: '/login', render: () => Home("login") },
	{ path: '/2fa-verification', render: () => Home("2fa-verification") },
	{ path: '/select-game', render: () => Home("select-game") },
	{ path: '/pong', render: () => Pong() },
	{ path: '/blackjack', render: () => Blackjack() },
	{ path: '/tournament', render: () => Tournament() },
	{ path: '/profil', render: () => Profil() },
	{ path: '/profil/:id', render: (params) => FriendProfil(params?.id!) },
	//{ path: '/logout', render: () => Profil() },
]);

async function checkTokenStart(){
    try {
        const response = await getUserByToken();
        // si token invalide (demander confirmation nathan)
        if (!response || !response.user) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirige vers la page de login si user pas trouver
        navigate('/');
        return;
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du token :', error);
    // En cas d’erreur réseau suppression token et redirection
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  }
}

document.addEventListener('DOMContentLoaded', () => {
	renderRoute();
	checkTokenStart();
	// Interception des clics sur les liens
	document.body.addEventListener('click', (e) => {
		const target = e.target as HTMLElement;
		if (target.tagName === 'A') {
		const anchor = target as HTMLAnchorElement;
		if (anchor.hostname === location.hostname && anchor.pathname) {
			e.preventDefault();
			history.pushState({}, '', anchor.pathname);
			renderRoute();
		}
		}
	});
});