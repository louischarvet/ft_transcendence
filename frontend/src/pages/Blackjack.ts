import BjScene from '../tools/games/BjScene';
import { checkConnection } from '../tools/APIStorageManager';
import { navigate } from '../router';
import { socket } from '../tools/socket';

export default function Blackjack(): HTMLElement {
  // Vérifie si l'utilisateur est connecté
  checkConnection().then((connected) => {
    if (!connected) {
      navigate('/');
    }
  });

  const container = document.createElement('div');
  container.className = 'flex justify-center items-center h-screen bg-[#09050d]';

  const canvas = document.createElement('canvas');
  canvas.className = 'block fixed w-full h-full';
  container.appendChild(canvas);

  // Taille initiale du canvas
  canvas.width = 2032;
  canvas.height = 1016;
  canvas.style.width = canvas.width + "px";
  canvas.style.height = canvas.height + "px";

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

  // UI pour choisir le mode de jeu
  const modeSelector = document.createElement('div');
  modeSelector.className = 'absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50';
  modeSelector.innerHTML = `
    <div class="bg-gray-900 p-8 rounded-lg shadow-2xl">
      <h2 class="text-white text-3xl mb-6 text-center">Blackjack</h2>
      <div class="flex gap-4">
        <button id="soloBtn" class="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded text-xl">
          Solo
        </button>
        <button id="multiBtn" class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded text-xl">
          Multijoueur
        </button>
      </div>
    </div>
  `;
  container.appendChild(modeSelector);

  async function startGame(mode: 'solo' | 'multi') {
    modeSelector.remove();

    const bjScene = new BjScene(canvas);

    try {
      // Connexion au WebSocket
      await socket.connect('ws://localhost:3000/blackjack');
      
      // Récupérer le nom d'utilisateur (à adapter selon votre système)
      const username = await getUsernameFromDB();
      
      // Rejoindre la partie
      socket.emit('join', { username, mode });

    } catch (error) {
      console.error('Erreur de connexion:', error);
      bjScene.showMessage('Erreur de connexion au serveur');
      return;
    }

    // === Événements réseau (réception depuis le serveur) ===

    socket.on('joined', (data: { playerId: string; roomId: string; mode: string; playerCount: number }) => {
      console.log('Rejoint la partie:', data);
      bjScene.showMessage(`Connecté - ${data.mode === 'solo' ? 'Mode Solo' : `Multijoueur (${data.playerCount}/2)`}`);
    });

    socket.on('playerJoined', (data: { username: string; playerCount: number }) => {
      bjScene.showMessage(`${data.username} a rejoint (${data.playerCount}/2)`);
    });

    socket.on('bettingPhase', (data: { message: string }) => {
      bjScene.showMessage(data.message);
      bjScene.enableBetting();
    });

    socket.on('betPlaced', (data: { playerId: string; username: string; position: number; amount: number; balance: number }) => {
      bjScene.showMessage(`${data.username} a parié ${data.amount}€ à la position ${data.position}`);
      bjScene.updateTable(data);
    });

    socket.on('readyToStart', (data: { message: string }) => {
      bjScene.showMessage(data.message);
      bjScene.enableStart();
    });

    socket.on('waitingForPlayers', (data: { message: string }) => {
      bjScene.showMessage(data.message);
    });

    socket.on('roundStarted', (gameState: any) => {
      bjScene.showMessage('La partie commence !');
      bjScene.startRound(gameState);
      bjScene.disableAllActions();
    });

    socket.on('playerTurn', (data: { playerId: string; username: string }) => {
      bjScene.showMessage(`Tour de ${data.username}`);
      bjScene.enableActions();
    });

    socket.on('cardDrawn', (data: { playerId: string; position: number; card: string; value: number }) => {
      bjScene.drawCard(data);
    });

    socket.on('playerStand', (data: { playerId: string; username: string }) => {
      bjScene.playerStand(data);
    });

    socket.on('dealerReveal', (data: { cards: string[]; value: number }) => {
      bjScene.showMessage(`Dealer révèle: ${data.value}`);
      bjScene.revealDealerCards(data);
    });

    socket.on('dealerDraw', (data: { card: string; value: number }) => {
      bjScene.showMessage(`Dealer tire: ${data.value}`);
    });

    socket.on('roundFinished', (data: { dealerValue: number; results: any[] }) => {
      let message = `Dealer: ${data.dealerValue}\n`;
      data.results.forEach(r => {
        message += `${r.username} (pos ${r.position}): ${r.result.toUpperCase()} - ${r.payout}€\n`;
      });
      bjScene.showMessage(message);
      bjScene.disableAllActions();
    });

    socket.on('newRound', (data: { message: string }) => {
      bjScene.showMessage(data.message);
      bjScene.enableBetting();
    });

    socket.on('error', (data: string) => {
      bjScene.showMessage(`Erreur: ${data}`);
    });

    socket.on('info', (data: string) => {
      bjScene.showMessage(`ℹ️ ${data}`);
    });

    socket.on('playerLeft', (data: { playerId: string }) => {
      bjScene.showMessage('Un joueur a quitté la partie');
    });

    socket.on('disconnect', () => {
      bjScene.showMessage('Déconnecté du serveur');
    });

    // === Actions du joueur (envoi vers le serveur) ===

    bjScene.onBet = (amount: number, position: number) => {
      socket.emit('placeBet', { position, amount });
    };

    bjScene.onStart = () => {
      socket.emit('startGame', {});
    };

    bjScene.onHit = () => {
      socket.emit('hit', {});
    };

    bjScene.onStand = () => {
      socket.emit('stand', {});
    };

    bjScene.onSplit = (position: number) => {
      socket.emit('split', { position });
    };

    // === Initialisation de la scène ===

    resizeCanvas();
    bjScene.engine.resize();

    window.addEventListener("resize", () => {
      resizeCanvas();
      bjScene.engine.resize();
    });

    bjScene.start();

    // Nettoyage lors de la fermeture
    window.addEventListener('beforeunload', () => {
      socket.disconnect();
    });
  }

  // Récupérer le nom d'utilisateur depuis la DB
  async function getUsernameFromDB(): Promise<string> {
    try {
      // TODO: Remplacer par votre véritable appel API
      const response = await fetch('/api/user/me');
      const data = await response.json();
      return data.username || 'Player';
    } catch (error) {
      console.error('Erreur récupération username:', error);
      return 'Player';
    }
  }

  // Gestion des boutons de sélection de mode
  const soloBtn = modeSelector.querySelector('#soloBtn');
  const multiBtn = modeSelector.querySelector('#multiBtn');

  soloBtn?.addEventListener('click', () => startGame('solo'));
  multiBtn?.addEventListener('click', () => startGame('multi'));

  return container;
}