import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import fastifyCors from '@fastify/cors';

const fastify = Fastify({ logger: true });

// Enregistrer CORS
fastify.register(fastifyCors, {
  origin: true,
  credentials: true
});

// Enregistrer le plugin WebSocket
fastify.register(fastifyWebsocket);

// Stockage des salles de jeu
const gameRooms = new Map();

// Génération d'un deck de cartes
function generateDeck() {
  const patterns = ['Spades', 'Hearts', 'Diamonds', 'Clubs'];
  const names = ['As', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'];
  const deck = [];
  
  for (let i = 0; i < 6; i++) {
    patterns.forEach(pattern => {
      names.forEach(name => {
        deck.push(`${name}_of_${pattern}`);
      });
    });
  }
  
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  
  return deck;
}

// Calculer la valeur d'une main
function calculateHandValue(cards) {
  let value = 0;
  let aces = 0;
  
  cards.forEach(card => {
    const name = card.split('_of_')[0];
    if (name === 'As') {
      aces++;
      value += 11;
    } else if (['Jack', 'Queen', 'King'].includes(name)) {
      value += 10;
    } else {
      value += parseInt(name);
    }
  });
  
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }
  
  return value;
}

// Broadcast à tous les joueurs d'une room
function broadcastToRoom(room, event, data) {
  room.players.forEach(player => {
    if (player.socket.readyState === 1) { // WebSocket.OPEN
      player.socket.send(JSON.stringify({ event, data }));
    }
  });
}

// Health check
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', service: 'blackjack' };
});

// Route WebSocket
fastify.register(async function (fastify) {
  fastify.get('/blackjack', { websocket: true }, (socket, req) => {
    let playerId = null;
    let roomId = null;

    socket.on('message', (message) => {
      try {
        const { event, data } = JSON.parse(message.toString());

        switch (event) {
          case 'join':
            handleJoin(socket, data);
            break;
          case 'placeBet':
            handlePlaceBet(data);
            break;
          case 'startGame':
            handleStartGame();
            break;
          case 'hit':
            handleHit();
            break;
          case 'stand':
            handleStand();
            break;
          case 'split':
            handleSplit(data);
            break;
        }
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });

    function handleJoin(socket, data) {
      playerId = Math.random().toString(36).substring(7);
      
      if (data.mode === 'solo') {
        roomId = `solo_${playerId}`;
        const room = {
          id: roomId,
          mode: 'solo',
          players: new Map(),
          state: 'waiting',
          dealerHand: [],
          currentPlayerIndex: 0,
          deck: generateDeck()
        };
        gameRooms.set(roomId, room);
      } else {
        let foundRoom = false;
        for (const [id, room] of gameRooms.entries()) {
          if (room.mode === 'multi' && room.state === 'waiting' && room.players.size < 2) {
            roomId = id;
            foundRoom = true;
            break;
          }
        }
        
        if (!foundRoom) {
          roomId = `multi_${Date.now()}`;
          const room = {
            id: roomId,
            mode: 'multi',
            players: new Map(),
            state: 'waiting',
            dealerHand: [],
            currentPlayerIndex: 0,
            deck: generateDeck()
          };
          gameRooms.set(roomId, room);
        }
      }

      const room = gameRooms.get(roomId);
      const player = {
        id: playerId,
        username: data.username,
        balance: 1000,
        socket: socket,
        bets: new Map(),
        hands: new Map(),
        ready: false
      };

      room.players.set(playerId, player);

      socket.send(JSON.stringify({
        event: 'joined',
        data: {
          playerId,
          roomId,
          mode: room.mode,
          playerCount: room.players.size
        }
      }));

      broadcastToRoom(room, 'playerJoined', {
        username: player.username,
        playerCount: room.players.size
      });

      if (room.mode === 'solo' || room.players.size === 2) {
        room.state = 'betting';
        broadcastToRoom(room, 'bettingPhase', { 
          message: 'Placez vos paris (positions 1-5)' 
        });
      }
    }

    function handlePlaceBet(data) {
      if (!playerId || !roomId) return;
      const room = gameRooms.get(roomId);
      if (!room || room.state !== 'betting') return;

      const player = room.players.get(playerId);
      if (!player) return;

      if (data.position < 1 || data.position > 5) {
        socket.send(JSON.stringify({ event: 'error', data: 'Position invalide (1-5)' }));
        return;
      }

      if (data.amount > player.balance) {
        socket.send(JSON.stringify({ event: 'error', data: 'Solde insuffisant' }));
        return;
      }

      let positionTaken = false;
      room.players.forEach(p => {
        if (p.bets.has(data.position)) {
          positionTaken = true;
        }
      });

      if (positionTaken) {
        socket.send(JSON.stringify({ event: 'error', data: 'Position déjà prise' }));
        return;
      }

      player.bets.set(data.position, data.amount);
      player.balance -= data.amount;

      broadcastToRoom(room, 'betPlaced', {
        playerId,
        username: player.username,
        position: data.position,
        amount: data.amount,
        balance: player.balance
      });

      let allPlayersHaveBets = true;
      room.players.forEach(p => {
        if (p.bets.size === 0) allPlayersHaveBets = false;
      });

      if (allPlayersHaveBets) {
        broadcastToRoom(room, 'readyToStart', { message: 'Cliquez sur START pour commencer' });
      }
    }

    function handleStartGame() {
      if (!playerId || !roomId) return;
      const room = gameRooms.get(roomId);
      if (!room || room.state !== 'betting') return;

      const player = room.players.get(playerId);
      if (!player) return;

      player.ready = true;

      let allReady = true;
      room.players.forEach(p => {
        if (!p.ready) allReady = false;
      });

      if (!allReady && room.mode === 'multi') {
        broadcastToRoom(room, 'waitingForPlayers', { 
          message: 'En attente des autres joueurs...' 
        });
        return;
      }

      startRound(room);
    }

    function startRound(room) {
      room.state = 'playing';
      room.dealerHand = [];
      
      room.players.forEach(player => {
        player.hands.clear();
        player.bets.forEach((amount, position) => {
          const hand = [];
          hand.push(room.deck.pop());
          hand.push(room.deck.pop());
          player.hands.set(position, hand);
        });
      });

      room.dealerHand.push(room.deck.pop());
      room.dealerHand.push(room.deck.pop());

      const gameState = {
        dealerCard: room.dealerHand[0],
        players: Array.from(room.players.values()).map(p => ({
          id: p.id,
          username: p.username,
          balance: p.balance,
          hands: Object.fromEntries(
            Array.from(p.hands.entries()).map(([pos, cards]) => [
              pos,
              { cards, value: calculateHandValue(cards) }
            ])
          )
        }))
      };

      broadcastToRoom(room, 'roundStarted', gameState);
      nextPlayerTurn(room);
    }

    function nextPlayerTurn(room) {
      const playerIds = Array.from(room.players.keys());
      if (room.currentPlayerIndex >= playerIds.length) {
        dealerTurn(room);
        return;
      }

      const currentPlayerId = playerIds[room.currentPlayerIndex];
      const currentPlayer = room.players.get(currentPlayerId);

      broadcastToRoom(room, 'playerTurn', {
        playerId: currentPlayerId,
        username: currentPlayer.username
      });
    }

    function handleHit() {
      if (!playerId || !roomId) return;
      const room = gameRooms.get(roomId);
      if (!room || room.state !== 'playing') return;

      const player = room.players.get(playerId);
      if (!player) return;

      let targetHand = null;
      let targetPosition = 0;
      
      player.hands.forEach((hand, position) => {
        if (!targetHand && calculateHandValue(hand) < 21) {
          targetHand = hand;
          targetPosition = position;
        }
      });

      if (!targetHand) return;

      const newCard = room.deck.pop();
      targetHand.push(newCard);

      const value = calculateHandValue(targetHand);

      broadcastToRoom(room, 'cardDrawn', {
        playerId,
        position: targetPosition,
        card: newCard,
        value
      });

      if (value >= 21) {
        handleStand();
      }
    }

    function handleStand() {
      if (!playerId || !roomId) return;
      const room = gameRooms.get(roomId);
      if (!room) return;

      room.currentPlayerIndex++;
      nextPlayerTurn(room);
    }

    function dealerTurn(room) {
      room.state = 'dealer_turn';
      
      broadcastToRoom(room, 'dealerReveal', {
        cards: room.dealerHand,
        value: calculateHandValue(room.dealerHand)
      });

      const dealerDrawInterval = setInterval(() => {
        const value = calculateHandValue(room.dealerHand);
        
        if (value >= 17) {
          clearInterval(dealerDrawInterval);
          finishRound(room);
          return;
        }

        const card = room.deck.pop();
        room.dealerHand.push(card);
        
        broadcastToRoom(room, 'dealerDraw', {
          card,
          value: calculateHandValue(room.dealerHand)
        });
      }, 1000);
    }

    function finishRound(room) {
      room.state = 'finished';
      const dealerValue = calculateHandValue(room.dealerHand);

      const results = [];

      room.players.forEach(player => {
        player.hands.forEach((hand, position) => {
          const playerValue = calculateHandValue(hand);
          const bet = player.bets.get(position);
          let result = 'lose';
          let payout = 0;

          if (playerValue > 21) {
            result = 'lose';
          } else if (dealerValue > 21) {
            result = 'win';
            payout = bet * 2;
          } else if (playerValue > dealerValue) {
            result = 'win';
            payout = bet * 2;
          } else if (playerValue === dealerValue) {
            result = 'push';
            payout = bet;
          }

          player.balance += payout;

          results.push({
            playerId: player.id,
            username: player.username,
            position,
            result,
            payout,
            newBalance: player.balance
          });
        });
      });

      broadcastToRoom(room, 'roundFinished', {
        dealerValue,
        results
      });

      setTimeout(() => {
        room.state = 'betting';
        room.currentPlayerIndex = 0;
        room.players.forEach(p => {
          p.bets.clear();
          p.hands.clear();
          p.ready = false;
        });
        
        broadcastToRoom(room, 'newRound', { message: 'Placez vos paris' });
      }, 5000);
    }

    function handleSplit(data) {
      socket.send(JSON.stringify({ 
        event: 'info', 
        data: 'Split en cours de développement' 
      }));
    }

    socket.on('close', () => {
      if (playerId && roomId) {
        const room = gameRooms.get(roomId);
        if (room) {
          room.players.delete(playerId);
          
          if (room.players.size === 0) {
            gameRooms.delete(roomId);
          } else {
            broadcastToRoom(room, 'playerLeft', { playerId });
          }
        }
      }
    });
  });
});

// Démarrer le serveur
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('🎰 Blackjack service running on http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();