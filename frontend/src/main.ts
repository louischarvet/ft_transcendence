import { defineRoutes, renderRoute } from './router';
import './style.css';
import Home from './pages/Home';
// import SelectGame from './pages/SelectGame';
import GameCanvas from './pages/Pong';
import PongScene from './pages/Pong3D';
import Blackjack from './pages/Blackjack';
import Tournament from './pages/Tournament';
import Register from './pages/Register';

defineRoutes([
  { path: '/', render: Home },
  // { path: '/select-game', render: SelectGame },
  { path: '/pong', render: GameCanvas },
  { path: '/pong3d', render: PongScene },
  { path: '/blackjack', render: Blackjack },
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