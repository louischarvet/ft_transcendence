
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

// Send

function playerBet(player: string, places: { [name: string]: { bet: number } }) {}

function start() {}

function stand() {}

function hit() {}

function doubleDown() {}

function split() {}

// Receive

function resetDeck() {}

function dealPlace(card: string, place: string, placeCardsValue: string, onSplit: boolean = false) {}

function cardInteraction(place: string) {}

function turnDealerCard(cardsValue: string) {}

function popUpBJ(place: string) {}

function popUpBust(place: string) {}

function endRound(results: { [place: string]: 'win' | 'lose' }) {} // With players ?