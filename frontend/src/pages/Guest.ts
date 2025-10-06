import { postJson } from '../utils/authFetch';
import { navigate } from '../router';

export default function Guest(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'flex flex-col items-center justify-center min-h-screen gap-4';

  const title = document.createElement('h1');
  title.textContent = 'Jouer en tant qu’invité';
  title.className = 'text-2xl font-bold';
  container.appendChild(title);

  const btn = document.createElement('button');
  btn.textContent = 'Continuer en invité';
  btn.className = 'p-3 bg-green-500 text-white rounded';
  container.appendChild(btn);

  btn.onclick = async () => {
    btn.disabled = true;
    const nickname = 'Guest_' + Math.floor(Math.random() * 10000);
    try {
      const res = await postJson('/api/user/guest', { nickname });
      if (!res.id) throw new Error('Impossible de créer un invité');
      localStorage.setItem('guestId', res.id);

      const gameRoute = localStorage.getItem('gameRoute') || '/';
      navigate(gameRoute);
    } catch (err) {
      console.error(err);
      btn.disabled = false;
    }
  };

  return container;
}
