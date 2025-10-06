import { navigate } from '../router';

export default function GameAccess(gameRoute: string): HTMLElement {
  const container = document.createElement('div');
  container.className = 'flex flex-col items-center h-screen bg-[url(/assets/background.png)] bg-cover bg-center';

  // Vérifier si l'utilisateur est déjà loggué ou en invité
  const token = localStorage.getItem('authToken');
  const guestId = localStorage.getItem('guestId');

  if (token || guestId) {
    navigate(gameRoute);
    return container;
  }

  // Stocker temporairement la route du jeu pour redirection après login/guest
  localStorage.setItem('gameRoute', gameRoute);

  // Titre
  const title = document.createElement('h1');
  title.textContent = 'Access Required';
  title.className = 'text-[6rem] font-extrabold text-red-400 drop-shadow-[0_0_30px_black] mt-12';
  container.appendChild(title);

  // Sous-titre
  const subtitle = document.createElement('h2');
  subtitle.textContent = 'Choose how you want to play';
  subtitle.className = 'text-2xl font-bold text-white mb-12';
  container.appendChild(subtitle);

  // Wrapper des options
  const optionsWrapper = document.createElement('div');
  optionsWrapper.className = 'flex flex-wrap justify-center gap-16 p-16';

  // Bouton Login
  const loginBtn = document.createElement('button');
  loginBtn.textContent = 'Login';
  loginBtn.className =
    'px-10 py-6 bg-blue-600 hover:bg-blue-500 rounded-2xl text-2xl text-white shadow-lg transition-transform transform hover:scale-105';
  loginBtn.onclick = () => navigate('/login');
  optionsWrapper.appendChild(loginBtn);

  // Bouton Register
  const registerBtn = document.createElement('button');
  registerBtn.textContent = 'Register';
  registerBtn.className =
    'px-10 py-6 bg-purple-600 hover:bg-purple-500 rounded-2xl text-2xl text-white shadow-lg transition-transform transform hover:scale-105';
  registerBtn.onclick = () => navigate('/register-tester'); // ou '/register'
  optionsWrapper.appendChild(registerBtn);

  // Bouton Guest
  const guestBtn = document.createElement('button');
  guestBtn.textContent = 'Play as Guest';
  guestBtn.className =
    'px-10 py-6 bg-green-600 hover:bg-green-500 rounded-2xl text-2xl text-white shadow-lg transition-transform transform hover:scale-105';
  guestBtn.onclick = () => navigate('/guest');
  optionsWrapper.appendChild(guestBtn);

  container.appendChild(optionsWrapper);
  return container;
}
