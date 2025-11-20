import BjScene from '../tools/games/BjScene';
import { connect as BjConnect } from '../tools/games/BjRequest';

export default function Blackjack(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'flex justify-center items-center h-screen bg-[#09050d]';

  const canvas = document.createElement('canvas');
  canvas.className = 'block fixed w-full h-full';
  container.appendChild(canvas);

  // Initial size, will be resized for the responsive
  canvas.width = 2032;
  canvas.height = 1016;
  canvas.style.width = canvas.width + "px";
  canvas.style.height = canvas.height + "px";

  let bjScene: BjScene | null = null;
  const resizeHandlers: (() => void)[] = [];

  const resizeCanvas = () => {
    if (window.innerHeight / window.innerWidth > 0.5) {
      canvas.width = window.innerWidth;
      canvas.height = canvas.width * 0.5;
    } else {
      canvas.height = window.innerHeight;
      canvas.width = canvas.height / 0.5;
    }
    canvas.style.width = canvas.width + "px";
    canvas.style.height = canvas.height + "px";
  };

  async function game() {
    bjScene = new BjScene(canvas);

    resizeCanvas();
    bjScene.engine.resize();

    const resizeHandler1 = resizeCanvas;
    const resizeHandler2 = () => bjScene?.engine.resize();

    window.addEventListener("resize", resizeHandler1);
    window.addEventListener("resize", resizeHandler2);
    resizeHandlers.push(resizeHandler1, resizeHandler2);

    // Le gameId sera généré par le backend lors du join
    const gameId = `game_${Date.now()}`;
    const playerId = `player_${Date.now()}`;
    (window as any).BJ_GAME_ID = gameId;
    (window as any).BJ_PLAYER_ID = playerId;

    try {
      await BjConnect({
        gameId,
        playerId,
        playerName: 'Player',
        bank: 0,
        position: 'p1'
      });
    } catch (e) {
      console.error('[Blackjack] Connection backend échouée:', e);
    }

    bjScene.start();
  }

  // Fonction de cleanup globale
  const cleanup = () => {
    console.log('[Blackjack] Cleaning up scene and resources...');

    // Supprimer les event listeners de resize
    resizeHandlers.forEach(handler => {
      window.removeEventListener("resize", handler);
    });
    resizeHandlers.length = 0;

    // Disposer la scène Babylon
    if (bjScene) {
      bjScene.dispose();
      bjScene = null;
    }
  };

  // Enregistrer cleanup pour qu'il soit appelé par __bjDisconnect
  const oldDisconnect = (window as any).__bjDisconnect;
  (window as any).__bjDisconnect = () => {
    cleanup();
    if (oldDisconnect) oldDisconnect();
  };

  game();

  return container;
}