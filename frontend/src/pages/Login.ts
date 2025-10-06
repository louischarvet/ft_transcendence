import { postJson } from '../utils/authFetch';
import { navigate } from '../router';

export default function Login(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'flex flex-col items-center justify-center min-h-screen gap-6 bg-gray-900 text-white p-8';

  const title = document.createElement('h1');
  title.textContent = 'Connexion';
  title.className = 'text-3xl font-bold';
  container.appendChild(title);

  const nameInput = document.createElement('input');
  nameInput.placeholder = "Nom d'utilisateur";
  nameInput.className = 'p-2 rounded w-72 text-black';
  container.appendChild(nameInput);

  const passwordInput = document.createElement('input');
  passwordInput.placeholder = 'Mot de passe';
  passwordInput.type = 'password';
  passwordInput.className = 'p-2 rounded w-72 text-black';
  container.appendChild(passwordInput);

  const btn = document.createElement('button');
  btn.textContent = 'Se connecter';
  btn.className = 'mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded';
  container.appendChild(btn);

  const responseBox = document.createElement('pre');
  responseBox.className = 'bg-gray-700 p-2 rounded w-96 h-24 overflow-auto text-sm mt-4';
  container.appendChild(responseBox);

  btn.onclick = async () => {
    btn.disabled = true;
    const name = nameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!name || !password) {
      responseBox.textContent = 'Nom d’utilisateur et mot de passe requis';
      btn.disabled = false;
      return;
    }

    try {
		const res = await fetch('/api/user/login', {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ name, password }),
		credentials: 'include',
		});
		const data = await res.json();

      localStorage.setItem('authToken', data.token);
      responseBox.textContent = 'Connexion réussie ! Redirection...';

      const gameRoute = localStorage.getItem('gameRoute') || '/';
      setTimeout(() => navigate(gameRoute), 800);
    } catch (err: any) {
      responseBox.textContent = 'Erreur : ' + JSON.stringify(err);
      btn.disabled = false;
    }
  }; // <-- fermeture du onclick

  return container;
} // <-- fermeture de Login()
