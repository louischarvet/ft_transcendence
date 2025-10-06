import { navigate } from '../router';

export default function Home(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'flex flex-col items-center h-screen bg-[url(/assets/background.png)] bg-cover bg-center';

  // Titre
  const title = document.createElement('h1');
  title.textContent = 'BlackPong';
  title.className = 'text-[12rem] font-extrabold text-green-400 drop-shadow-[0_0_30px_#535bf2] mt-12';
  container.appendChild(title);

  // Sous-titre
  const subtitle = document.createElement('h2');
  subtitle.textContent = 'Choose your game';
  subtitle.className = 'text-4xl font-bold text-white mb-16 drop-shadow-[0_0_10px_black]';
  container.appendChild(subtitle);

  // Conteneur des boutons de jeu
  const buttonsWrapper = document.createElement('div');
  buttonsWrapper.className = 'flex flex-wrap justify-center gap-16 p-16';

  const createGameButton = (label: string, route: string): HTMLElement => {
    const button = document.createElement('button');
    button.className =
      'flex items-center justify-center w-[420px] h-[280px] bg-[#646cff50] rounded-xl backdrop-blur-2xl ' +
      'hover:scale-105 hover:bg-[#535bf2] hover:drop-shadow-[0_0_20px_#535bf2] transition-all duration-300';

    const p = document.createElement('p');
    p.textContent = label;
    p.className = 'text-white text-5xl font-bold';
    button.appendChild(p);

    button.onclick = () => navigate(route);
    return button;
  };

  buttonsWrapper.appendChild(createGameButton('Pong 3D', '/pong3d'));
  buttonsWrapper.appendChild(createGameButton('Blackjack', '/blackjack'));

  container.appendChild(buttonsWrapper);

  return container;
}
