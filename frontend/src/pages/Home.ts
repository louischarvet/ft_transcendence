import { navigate } from '../router';
import { checkConnection } from '../tools/APIStorageManager';
import ContinueAs from '../tools/ContinueAs';
import Login from '../tools/Login';
import Register from '../tools/Register';
import GameSelection from '../tools/GameSelection';
import TwofaVerification from '../tools/2faVerification';
import DropDownMenu from '../tools/DropDownMenu';

export default function Home(subPage?: string): HTMLElement {
  const container = document.createElement('div');
  container.className = 'flex flex-col justify-center items-center w-screen h-screen min-h-screen bg-[url(/assets/background.png)] bg-cover bg-center bg-no-repeat';
  container.style.backgroundSize = '100% 100%';

  // Titre
  const title = document.createElement('h1');
  title.textContent = 'BlackPong';
  title.className = 'w-screen font-extrabold text-green-400 drop-shadow-[0_0_30px_#535bf2] text-6xl sm:text-8xl md:text-9xl lg:text-[12rem]';
  container.appendChild(title);

  const separator = document.createElement('hr'); // Ligne de séparation
  separator.className = 'w-3/4 border-t border-white/20 my-5';
  container.appendChild(separator);

  if (subPage === 'login') {
    container.appendChild(Login());
  } else if (subPage === 'register') {
    container.appendChild(Register());
  } else if (subPage === 'select-game') {
    container.appendChild(GameSelection());
  } else if (subPage === '2fa-verification') {
    container.appendChild(TwofaVerification());
  } else {
    container.appendChild(ContinueAs());
    checkConnection().then((connected) => {
      if (connected) {
        navigate('/select-game');
      }
    });
  }

  container.appendChild(DropDownMenu());

  return container;
}