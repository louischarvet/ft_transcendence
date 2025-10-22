import { Engine, Scene, Vector3,
  StandardMaterial, Texture,
  AbstractMesh, AssetsManager,
  MultiMaterial, Material
} from "@babylonjs/core";

type Card = {
  name: string;
  mesh: AbstractMesh[];
};

export default class BjCard {
  private scene: Scene;
  private assetsManager: AssetsManager;
  private cardBackMaterial: StandardMaterial;
  private Cards: Card[] = [];
  private CardsMaterials: { name: string; material: StandardMaterial }[] = [];
  private Deck: Card[] = [];
  private DiscardTray: Card[] = [];
  private Places: { [name: string]: {
    cards: Card[];
    position: Vector3;
    splitedCards: Card[];
    rotation: Vector3;
    stackOffset: Vector3;
    splitOffset: Vector3;
  }} = {};
  activePlaces: string[] = [];

  // Step: Move from deck
  private dealStep = {position: new Vector3(-0.4, 1, 0.15), rotation: new Vector3(-Math.PI, 0, 0)};

  constructor(numberOfDeck: number, scene: Scene, assetsManager: AssetsManager) {
    this.scene = scene;
    this.assetsManager = assetsManager;

    const cardBackTexture = new Texture(`assets/cardBackTexture.png`, this.scene);
    cardBackTexture.vOffset = 0.04; // Adjust texture offset for better alignment
    this.cardBackMaterial = new StandardMaterial(`MatCardBack`, this.scene);
    this.cardBackMaterial.hasTexture(cardBackTexture);
    this.cardBackMaterial.diffuseTexture = cardBackTexture;
    this.cardBackMaterial.emissiveTexture = cardBackTexture;

    const cardsPatterns = ["Spades", "Hearts", "Diamonds", "Clubs"];
    const cardsNames = ["As", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"];

    let cardsCount = 0;
    for (let d = 0; d < numberOfDeck; d++) {
      cardsPatterns.forEach(pattern => {
        cardsNames.forEach(name => {
          this.createCard(cardsCount);
          this.createCardMaterial(name, pattern);
          cardsCount++;
        });
      });
    }

    this.initPlaces();
  }

  private createCard(index: number) {

    const taskCard = this.assetsManager.addContainerTask("loadGLB", "", "models/", "cardTest.glb");

    taskCard.onSuccess = (taskCard) => {
      taskCard.loadedContainer.addAllToScene();
      const cardMeshes = taskCard.loadedContainer.meshes;

      cardMeshes[2].material = this.cardBackMaterial;
      cardMeshes[2].material.markAsDirty(Material.AllDirtyFlag);

      cardMeshes[0].position = this.dealStep.position.clone();
      cardMeshes[0].position.y -= 0.005;
      cardMeshes[0].rotation = this.dealStep.rotation.clone();
      cardMeshes[0].scaling = new Vector3(0.7, 0.8, 0.8);

      this.Cards.push({
        name: '',
        mesh: cardMeshes
      });
    };

    taskCard.onError = (taskCard, message, exception) => {
      console.error(`Erreur de chargement des cartes :`, message, exception);
    };
  }

  private createCardMaterial(name: string, pattern: string) {
    const cardTexture = new Texture(`assets/${pattern}/${name}.png`, this.scene);
    cardTexture.vOffset = 0.04; // Adjust texture offset for better alignment
    const cardMaterial = new StandardMaterial(`MatCardFront_${name}_of_${pattern}`, this.scene);
    cardMaterial.hasTexture(cardTexture);
    cardMaterial.diffuseTexture = cardTexture;
    cardMaterial.emissiveTexture = cardTexture;

    this.CardsMaterials.push({ name: `${name}_of_${pattern}`, material: cardMaterial });
  }

  async resetDeck() {
    const position = new Vector3(-0.5, 1.04, 0.15);
    const rotation = new Vector3(-Math.PI, 0, Math.PI / 3);
    const offset = new Vector3(-0.002, 0, 0);

    let shuffledCards = this.Deck.concat(this.DiscardTray);
    if (!shuffledCards.length)
      shuffledCards = this.Cards.slice();
    for (let i = shuffledCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
    }

    this.Deck = [];
    this.DiscardTray = [];

    // Fill the deck with the shuffled cards
    for (const [index, cardData] of shuffledCards.entries()) {
      const card = { ...cardData };
      this.moveCard(card, position, rotation, true, 40).then(() => {
        this.moveCard(card, position.add(offset.scale(shuffledCards.length - index)), rotation, true, 100);
      });
      await this.delay(0.01);
    };
    shuffledCards.reverse();
    await this.delay(150);
    this.Deck = shuffledCards;
  }

  private initPlaces() {
    this.Places = {
      "dealer": {
        cards: [],
        position: new Vector3(0, 1, 0.32),
        splitedCards: [],
        rotation: new Vector3(-Math.PI, Math.PI, Math.PI),
        stackOffset: new Vector3(0.04, 0.0001),
        splitOffset: new Vector3()
      },
      "p1": {
        cards: [],
        position: new Vector3(0.7, 1, 0.4),
        splitedCards: [],
        rotation: new Vector3(-Math.PI, Math.PI + Math.PI / 3, Math.PI),
        stackOffset: new Vector3(-0.007, 0.0001, -0.03),
        splitOffset: new Vector3(-0.03, 0, 0.05)
      },
      "p2": {
        cards: [],
        position: new Vector3(0.4, 1, 0.7),
        splitedCards: [],
        rotation: new Vector3(-Math.PI, Math.PI + Math.PI / 6, Math.PI),
        stackOffset: new Vector3(0.007, 0.0001, -0.03),
        splitOffset: new Vector3(-0.05, 0, 0.03)
      },
      "p3": {
        cards: [],
        position: new Vector3(0, 1, 0.8),
        splitedCards: [],
        rotation: new Vector3(-Math.PI, Math.PI, Math.PI),
        stackOffset: new Vector3(0.02, 0.0001, -0.02),
        splitOffset: new Vector3(-0.06)
      },
      "p4": {
        cards: [],
        position: new Vector3(-0.4, 1, 0.7),
        splitedCards: [],
        rotation: new Vector3(-Math.PI, Math.PI - Math.PI / 6, Math.PI),
        stackOffset: new Vector3(0.028, 0.0001, -0.008),
        splitOffset: new Vector3(-0.05, 0, -0.03)
      },
      "p5": {
        cards: [],
        position: new Vector3(-0.7, 1, 0.4),
        splitedCards: [],
        rotation: new Vector3(-Math.PI, Math.PI - Math.PI / 3, Math.PI),
        stackOffset: new Vector3(0.028, 0.0001, 0.008),
        splitOffset: new Vector3(-0.03, 0, -0.055)
      },
    };
  }

  private delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  private normalizeVector3Angles(v: Vector3): Vector3 {
    const normalizeAngle = (angle: number) => {
      while (angle > Math.PI) angle -= 2 * Math.PI;
      while (angle < -Math.PI) angle += 2 * Math.PI;
      return angle;
    };
    return new Vector3(
      normalizeAngle(v.x),
      normalizeAngle(v.y),
      normalizeAngle(v.z)
    );
  }

  private async moveCard(card: Card, position: Vector3, rotation: Vector3, withoutStep = false, timeTo = 500) {

    if (!withoutStep) {
      await this.moveCard(card, this.dealStep.position, this.dealStep.rotation, true, 100);
    }

    const deltaTime = 16; // Approx. 60 FPS (16.67ms per frame)
    const steps = Math.floor(timeTo / deltaTime);
    const stepPosition = position.subtract(card.mesh[0].position).scale(1 / steps);
    const stepRotation = this.normalizeVector3Angles(rotation.subtract(card.mesh[0].rotation)).scale(1 / steps);

    for (let i = 1; i <= steps; i++) {
      card.mesh[0].position = card.mesh[0].position.add(stepPosition);
      card.mesh[0].rotation = card.mesh[0].rotation.add(stepRotation);
      await this.delay(deltaTime);
    }
  }

  async beginDealingCards(places: string[]) {
    this.activePlaces = places;
    const dealingOrder = [...places, 'dealer', ...places, 'dealer'];

    for (const place of dealingOrder) {
      await this.dealPlace(this.CardsMaterials[Math.floor(Math.random() * this.CardsMaterials.length)].name, place);
    }
    await this.delay(1000);
  }

  private discardTrayPosition = new Vector3(0, 1, 0);

  cleanPlaces() {
    Object.values(this.Places).forEach(place => {
      place.cards.forEach(card => {
        this.moveCard(card, this.discardTrayPosition, card.mesh[0].rotation, true);
        this.DiscardTray.push(card);
      });
      place.cards = [];
      place.splitedCards?.forEach(card => {
        this.moveCard(card, this.discardTrayPosition, card.mesh[0].rotation, true);
        this.DiscardTray.push(card);
      });
      place.splitedCards = [];
    });
  }

  async dealPlace(cardName: string, placeName: string, onSplit = false) {
    const place = this.Places[placeName];
    if (!place) {
      console.error(`Unknown place: ${placeName}`);
      return;
    }
    
    while (!this.Deck.length) {
      await this.delay(10);
    }

    const card = this.Deck.shift()!;

    const cardMaterial = this.CardsMaterials.find(mat => mat.name === cardName);
    if (!cardMaterial) {
      console.error(`Unknown card name: ${cardName}`);
      return;
    }
    card.name = cardName;
    card.mesh[1].material = cardMaterial.material;
    card.mesh[1].material.markAsDirty(Material.AllDirtyFlag);


    let cardStack = place.cards;

    if (onSplit)
      cardStack = place.splitedCards;

    if (placeName != 'dealer' || cardStack.length > 2)
      if (onSplit)
        this.moveCard(card, place.position.add(place.splitOffset).add(place.stackOffset.scale(place.splitedCards.length)), place.rotation);
      else if (place.splitedCards.length)
        this.moveCard(card, place.position.add(place.splitOffset.scale(-1)).add(place.stackOffset.scale(place.cards.length)), place.rotation);
      else
        this.moveCard(card, place.position.add(place.stackOffset.scale(place.cards.length)), place.rotation);
    else {
      if (!cardStack.length)
        this.moveCard(card, place.position.add(place.stackOffset), place.rotation);
      else
        this.moveCard(card, place.position.add(new Vector3(0, 0.002)), place.rotation.add(new Vector3(0, 0, -Math.PI)), false, 300);
    }
    cardStack.push(card);

    await this.delay(300);
  }

  splitPlace(placeName: string) {
    const place = this.Places[placeName];
    if (!place) {
      console.error(`Unknown place: ${placeName}`);
      return;
    }
    if (place.cards.length != 2) {
      console.error(`Place ${placeName} cannot be split, it has ${place.cards.length} cards.`);
      return;
    }
    if (place.splitedCards.length) {
      console.error(`Place ${placeName} cannot be split, it already is.`);
      return;
    }
    const card = place.cards.pop()!;
    this.moveCard(card, place.position.add(place.splitOffset), place.rotation, true);
    place.splitedCards.push(card);

    this.moveCard(place.cards[0], place.position.add(place.splitOffset.scale(-1)), place.rotation, true);
  }

  turnDealerCard() {
    const place = this.Places["dealer"];

    this.moveCard(place.cards[1], place.cards[1].mesh[0].position, place.rotation, true);
  }
}