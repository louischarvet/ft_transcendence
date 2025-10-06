import { defineRoutes, renderRoute } from './router';
import './style.css';
import Home from './pages/Home';
// import SelectGame from './pages/SelectGame';
import PongScene from './pages/Pong3D';
import Blackjack from './pages/Blackjack';
import Tournament from './pages/Tournament';
import Register from './pages/Register';
import RegisterTester from './pages/RegisterTester';
import GameAccess from './pages/GameAccess';
import Login from './pages/Login';
import Guest from './pages/Guest';

defineRoutes([
	{ path: '/', render: Home },

	{ path: '/pong3d', render: () => GameAccess('/pong3d/play') },
	{ path: '/blackjack', render: () => GameAccess('/blackjack/play') },

	{ path: '/pong3d/play', render: PongScene },
	{ path: '/blackjack/play', render: Blackjack },

	{ path: '/login', render: Login },
	{ path: '/guest', render: Guest },
	{ path: '/register-tester', render: RegisterTester },
	{ path: '/tournament', render: Tournament },
	{ path: '/register', render: Register },
]);


document.addEventListener('DOMContentLoaded', () => {
  renderRoute();

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