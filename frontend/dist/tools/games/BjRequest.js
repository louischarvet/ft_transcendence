const API_URL = (import.meta.env?.VITE_BJ_API_URL || 'http://localhost:3000');
// Utiliser le proxy Vite pour les WebSockets - connexion relative à l'hôte actuel
const WS_URL = (import.meta.env?.VITE_BJ_WS_URL || (window.location.protocol === 'https:' ? `wss://${window.location.host}/ws/blackjack` : `ws://${window.location.host}/ws/blackjack`));
const state = {
    ws: null,
    gameId: '',
    playerId: '',
    isOpen: false,
    joined: false,
    queue: []
};
function dispatch(name, detail) {
    try {
        window.dispatchEvent(new CustomEvent(name, { detail }));
    }
    catch { }
}
async function http(path, init) {
    const res = await fetch(`${API_URL}/api${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...init
    });
    if (!res.ok)
        throw new Error(`${res.status} ${res.statusText}`);
    return await res.json();
}
function sendWs(message) {
    // Toujours autoriser join immédiatement
    if (message.event !== 'join' && !state.joined) {
        state.queue.push(message);
        return;
    }
    if (state.ws && state.isOpen)
        state.ws.send(JSON.stringify(message));
    else
        state.queue.push(message);
}
function onWsMessage(ev) {
    let msg;
    try {
        msg = JSON.parse(ev.data);
    }
    catch {
        return;
    }
    switch (msg.event) {
        case 'joined': {
            // Le backend génère son propre playerId, on doit l'utiliser
            if (msg.data && msg.data.playerId) {
                state.playerId = msg.data.playerId;
                console.log('[BjRequest] Updated playerId from backend:', state.playerId);
            }
            state.joined = true;
            // Flush messages en attente maintenant que le joueur est inscrit côté serveur
            for (const m of state.queue.splice(0)) {
                if (m.event !== 'join')
                    sendWs(m);
            }
            break;
        }
        case 'roundStarted': {
            // Le backend envoie gameState avec les mains des joueurs
            const gameState = msg.data;
            console.log('[BjRequest] roundStarted data:', JSON.stringify(gameState, null, 2));
            console.log('[BjRequest] Current state.playerId:', state.playerId);
            // Distribuer les cartes du dealer
            console.log('[BjRequest] gameState.dealerCards:', gameState?.dealerCards);
            if (gameState && gameState.dealerCards && gameState.dealerCards.length >= 2) {
                console.log('[BjRequest] Dealing dealer cards:', gameState.dealerCards);
                // Distribuer les 2 vraies cartes du dealer
                dealPlace(gameState.dealerCards[0], 'dealer', '', false);
                dealPlace(gameState.dealerCards[1], 'dealer', '', false);
            }
            else {
                console.error('[BjRequest] No dealer cards to deal! gameState:', gameState);
            }
            if (gameState && gameState.players) {
                // Traiter les cartes initiales de chaque joueur
                console.log('[BjRequest] Searching for player with id:', state.playerId);
                const player = gameState.players.find((p) => p.id === state.playerId);
                console.log('[BjRequest] Player found:', player);
                if (player && player.hands) {
                    Object.entries(player.hands).forEach(([position, handData]) => {
                        // Convertir position numérique (1, 2, 3...) en format "p1", "p2", "p3"...
                        const positionStr = `p${position}`;
                        console.log('[BjRequest] Dealing to position:', positionStr, 'cards:', handData.cards);
                        if (handData.cards && Array.isArray(handData.cards)) {
                            handData.cards.forEach((card, index) => {
                                console.log(`[BjRequest] Dealing card ${index}: ${card} to position ${positionStr}`);
                                dealPlace(card, positionStr, String(handData.value), false);
                            });
                        }
                    });
                }
                else {
                    console.error('[BjRequest] No player hands found! player:', player);
                }
            }
            dispatch('bj:actions:show');
            break;
        }
        case 'cardDrawn': {
            const d = msg.data;
            if (d && d.card && d.position) {
                // Convertir position numérique en format "p1", "p2", etc.
                const positionStr = `p${d.position}`;
                console.log(`[BjRequest] cardDrawn: ${d.card} to position ${positionStr}, value: ${d.value}`);
                dealPlace(String(d.card), positionStr, String(d.value ?? ''), false);
            }
            break;
        }
        case 'playerDouble': {
            const d = msg.data;
            if (d && d.card && d.position) {
                // Convertir position numérique en format "p1", "p2", etc.
                const positionStr = `p${d.position}`;
                console.log(`[BjRequest] playerDouble: ${d.card} to position ${positionStr}, new bet: ${d.newBet}, value: ${d.value}`);
                // Distribuer la carte
                dealPlace(String(d.card), positionStr, String(d.value ?? ''), false);
                // TODO: Mettre à jour l'affichage de la mise (newBet)
            }
            break;
        }
        case 'dealerReveal': {
            const dealerData = msg.data;
            if (dealerData && dealerData.value) {
                turnDealerCard(String(dealerData.value));
            }
            dispatch('bj:actions:hide');
            break;
        }
        case 'dealerDraw': {
            const dealerData = msg.data;
            if (dealerData && dealerData.card) {
                console.log('[BjRequest] Dealer draws card:', dealerData.card, 'new value:', dealerData.value);
                // Distribuer la nouvelle carte au dealer
                dealPlace(dealerData.card, 'dealer', String(dealerData.value), false);
            }
            break;
        }
        case 'roundFinished': {
            const results = msg.data?.results || [];
            const resultMap = {};
            results.forEach((r) => {
                if (r.playerId === state.playerId && r.position) {
                    // Convertir position numérique en format "p1", "p2", etc.
                    const positionStr = `p${r.position}`;
                    resultMap[positionStr] = r.result;
                }
            });
            console.log('[BjRequest] Round finished, results:', resultMap);
            endRound(resultMap);
            dispatch('bj:actions:hide');
            break;
        }
        case 'playerTurn': {
            const turnData = msg.data;
            if (turnData && turnData.playerId === state.playerId) {
                dispatch('bj:actions:show');
            }
            break;
        }
        case 'error': {
            console.error('[WS][Blackjack] Error:', msg.data?.message || msg);
            break;
        }
        default:
            break;
    }
}
export async function connect(params) {
    state.gameId = params.gameId;
    state.playerId = params.playerId;
    if (!state.ws || state.ws.readyState > 1) {
        console.log('[BjRequest] Connecting to WebSocket:', WS_URL);
        state.ws = new WebSocket(WS_URL);
        state.isOpen = false;
        state.joined = false;
        state.queue = [];
        state.ws.onopen = () => {
            console.log('[BjRequest] WebSocket connected!');
            state.isOpen = true;
            // Toujours joindre la partie en premier
            const joinMessage = {
                event: 'join',
                data: {
                    gameId: state.gameId,
                    playerId: state.playerId,
                    username: params.playerName,
                    mode: 'solo'
                }
            };
            console.log('[BjRequest] Sending join:', joinMessage);
            sendWs(joinMessage);
        };
        state.ws.onmessage = onWsMessage;
        state.ws.onerror = (err) => {
            console.error('[BjRequest] WebSocket error:', err);
        };
        state.ws.onclose = () => {
            console.log('[BjRequest] WebSocket closed');
            state.isOpen = false;
        };
    }
}
export function disconnect() {
    if (state.ws && state.ws.readyState === WebSocket.OPEN) {
        console.log('[BjRequest] Disconnecting WebSocket...');
        state.ws.close(1000, 'Page navigation');
        state.ws = null;
        state.isOpen = false;
        state.joined = false;
    }
}
// Enregistrer la fonction disconnect globalement pour le routeur
window.__bjDisconnect = disconnect;
export const BjRequest = {
    send: {
        playerBet,
        start,
        stand,
        hit,
        doubleDown,
        split
    },
    receive: {
        resetDeck,
        dealPlace,
        cardInteraction,
        turnDealerCard,
        popUpBJ,
        popUpBust,
        endRound
    }
};
function ensureConnected() {
    if (!state.ws)
        throw new Error('WebSocket non initialisé. Appelle connect() avant.');
}
// Send
async function playerBet(player, places) {
    // Ne pas écraser le playerId reçu du backend
    // state.playerId est déjà défini par le message 'joined'
    ensureConnected();
    // Le backend attend une position (1-5) et un amount
    // places est un objet comme { "p1": { bet: 100 } }
    Object.entries(places).forEach(([position, betData]) => {
        // Convertir position "p1", "p2" etc. en numéro 1, 2, etc.
        const posNum = parseInt(position.replace('p', '')) || 1;
        sendWs({
            event: 'placeBet',
            data: {
                position: posNum,
                amount: betData.bet
            }
        });
    });
}
async function start() {
    ensureConnected();
    sendWs({ event: 'startGame', data: {} });
}
async function stand() {
    ensureConnected();
    sendWs({ event: 'stand', data: {} });
}
async function hit() {
    ensureConnected();
    sendWs({ event: 'hit', data: {} });
}
async function doubleDown() {
    ensureConnected();
    sendWs({ event: 'double', data: {} });
}
async function split() {
    ensureConnected();
    sendWs({ event: 'split', data: {} });
}
// Receive
function resetDeck() {
    dispatch('bj:resetDeck');
}
function dealPlace(card, place, placeCardsValue, onSplit = false) {
    dispatch('bj:dealPlace', { card, place, placeCardsValue, onSplit });
}
function cardInteraction(place) {
    dispatch('bj:cardInteraction', { place });
}
function turnDealerCard(cardsValue) {
    dispatch('bj:turnDealerCard', { cardsValue });
}
function popUpBJ(place) {
    dispatch('bj:popUpBJ', { place });
}
function popUpBust(place) {
    dispatch('bj:popUpBust', { place });
}
function endRound(results) {
    dispatch('bj:endRound', { results });
}
