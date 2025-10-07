import { AdvancedDynamicTexture,
  Button, Control,
  Rectangle, TextBlock,
  ScrollViewer
} from "@babylonjs/gui";
import { Scene, Vector2
} from "@babylonjs/core";
import { navigate } from '../../router';

export default class BjGui {
  ui: AdvancedDynamicTexture;
  width: number;
  height: number;

  sceneFunctions: any;

  bankAmount: number;
  totalBetAmount: number;

  playButton: Button;

  Bet: {
    button: Button;
    coinsButtons: { [name: string]: {
      button: Button;
      value: number;
      isActive: boolean;
    }};
    areas: { [place: string]: {
      place: string;
      selectBox: Rectangle;
      cardsValue: TextBlock;
      buttonCleanBet: Button;
      textBet: TextBlock;
      bet: number;
    }};
  };

  dealersCardsValue: TextBlock;

  cardsInteractions: {
    stand: Button;
    hit: Button;
    doubleDown: Button;
    split: Button;
  };

  constructor(width: number, height: number, sceneFunctions: any) {
    this.ui = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    this.width = width;
    this.height = height;

    this.sceneFunctions = sceneFunctions;

    // TO DO: Backend request
    this.bankAmount = 5000;
    this.totalBetAmount = 0;

    // Play Button
    this.playButton = Button.CreateSimpleButton("playButton", "PLAY"); {
      this.playButton.width = 136 + "px";
      this.playButton.height = 51 + "px";
      this.playButton.fontSize = 32 + "px";
      this.playButton.color = "black";
      this.playButton.cornerRadius = 15;
      this.playButton.thickness = 0;
      this.playButton.background = "white";
      this.playButton.alpha = 0.7;
      this.playButton.onPointerClickObservable.add(() => {
        this.playButton.isVisible = false;
        this.betGuiVisibility(true);
      });
      this.ui.addControl(this.playButton);
    }

    this.initConstGui();

    this.Bet = {
      button: this.createBetButton(),
      coinsButtons: {
        "5": this.createCoinButton(5, new Vector2(-120, -120.6)),
        "10": this.createCoinButton(10, new Vector2(-72, -171.8)),
        "20": this.createCoinButton(20, new Vector2(0, -186.4)),
        "50": this.createCoinButton(50, new Vector2(72, -171.8)),
        "100": this.createCoinButton(100, new Vector2(120, -120.6))
      },
      areas: {
        "p1": this.createArea("p1"),
        "p2": this.createArea("p2"),
        "p3": this.createArea("p3"),
        "p4": this.createArea("p4"),
        "p5": this.createArea("p5"),
      }
    };
    this.dealersCardsValue = this.createDealersCardsValue();
    this.betGuiVisibility(false);

    this.cardsInteractions = this.initCardsInteractionGui();
    this.cardsInteractionsVisibility(false);
  }

  private initConstGui() {
    // Bank label
    const labelBank = new TextBlock("BankLabel");
    labelBank.text = `Bank: ${this.bankAmount} €`;
    labelBank.verticalAlignment = TextBlock.VERTICAL_ALIGNMENT_BOTTOM;
    labelBank.horizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
    labelBank.left = 16 + "px";
    labelBank.width = 160 + "px";
    labelBank.height = 36.5 + "px";
    labelBank.fontSize = 24 + "px";
    labelBank.color = "white";
    this.ui.addControl(labelBank);

    // Total Bet label
    const labelTotalBet = new TextBlock("TotalBetLabel");
    labelTotalBet.text = `Total Bet: ${this.totalBetAmount} €`;
    labelTotalBet.verticalAlignment = TextBlock.VERTICAL_ALIGNMENT_BOTTOM;
    labelTotalBet.horizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
    labelTotalBet.left = 176 + "px";
    labelTotalBet.width = 200 + "px";
    labelTotalBet.height = 36.5 + "px";
    labelTotalBet.fontSize = 24 + "px";
    labelTotalBet.color = "white";
    labelTotalBet.isVisible = false;
    this.ui.addControl(labelTotalBet);

    // Help Button
    const buttonHelp = Button.CreateSimpleButton("helpButton", "?");
    buttonHelp.horizontalAlignment = Button.HORIZONTAL_ALIGNMENT_LEFT;
    buttonHelp.verticalAlignment = Button.VERTICAL_ALIGNMENT_TOP;
    buttonHelp.top = 14.6 + "px";
    buttonHelp.left = 16 + "px";
    buttonHelp.width = 40 + "px";
    buttonHelp.height = 40 + "px";
    buttonHelp.fontSize = 24 + "px";
    buttonHelp.color = "white";
    buttonHelp.cornerRadius = 50;
    buttonHelp.thickness = 0;
    buttonHelp.background = "black";
    buttonHelp.onPointerEnterObservable.add(() => {
      buttonHelp.thickness = 0.5;
    });
    buttonHelp.onPointerOutObservable.add(() => {
      buttonHelp.thickness = 0;
    });
    buttonHelp.onPointerClickObservable.add(() => {
      // Pop-up help dialog
      const fontHelp = new Rectangle("helpFontBox");
      fontHelp.width = "100%";
      fontHelp.height = "100%";
      fontHelp.thickness = 0;
      fontHelp.background = "black";
      fontHelp.alpha = 0.1;
      const scrollViewer = new ScrollViewer("helpScrollViewer");
      scrollViewer.horizontalAlignment = Button.HORIZONTAL_ALIGNMENT_LEFT;
      scrollViewer.verticalAlignment = Button.VERTICAL_ALIGNMENT_TOP;
      scrollViewer.barSize = 10;
      scrollViewer.top = 50 + "px";
      scrollViewer.left = 16 + "px";
      scrollViewer.width = 520 + "px";
      scrollViewer.height = 730 + "px";
      scrollViewer.barColor = "white";
      scrollViewer.barBackground = "transparent";
      scrollViewer.alpha = 0.7;
      scrollViewer.thickness = 0;
      const boxHelp = new Rectangle("helpBox");
      boxHelp.parent = scrollViewer;
      boxHelp.width = 510 + "px";
      boxHelp.height = 1270 + "px";
      boxHelp.color = "white";
      boxHelp.background = "black";
      boxHelp.alpha = 0.8;
      boxHelp.cornerRadius = 20;
      boxHelp.thickness = 0;
      const textTitleHelp = new TextBlock("helpTitleText", "🎲 Règles du Blackjack");
      textTitleHelp.parent = boxHelp;
      textTitleHelp.textVerticalAlignment = TextBlock.VERTICAL_ALIGNMENT_TOP;
      textTitleHelp.top = 20 + "px";
      textTitleHelp.color = "white";
      textTitleHelp.fontSize = 24 + "px";
      boxHelp.addControl(textTitleHelp);
      let rulesText: string;
      { rulesText = "    🎯 Objectif du jeu\n \
Le but est de battre le croupier en ayant une main\n \
dont la valeur est la plus proche de 21, sans jamais\n \
dépasser ce chiffre.\n \
\n \
🃏 Valeur des cartes\n \
Cartes de 2 à 10 → valeur égale au chiffre.\n \
Figures (Valet, Dame, Roi) → 10 points.\n \
As → 1 ou 11 points (au choix du joueur, selon ce qui\n \
avantage la main).\n \
\n \
▶️ Déroulement d’une partie\n \
\n \
Mise : le joueur place sa mise.\n \
\n \
Distribution :\n \
Chaque joueur reçoit 2 cartes face visible.\n \
Le croupier reçoit 2 cartes : 1 face visible et une face\n \
cachée.\n \
\n \
Tour du joueur :\n \
Tirer : demander une carte supplémentaire.\n \
Rester : garder sa main.\n \
Doubler : doubler la mise et recevoir une seule carte\n \
supplémentaire.\n \
Séparer : si les 2 premières cartes ont la même\n \
valeur, possibilité de séparer en 2 mains distinctes\n \
jouées séparément, avec une mise supplémentaire de\n \
la même valeur.\n \
\n \
Tour du croupier :\n \
Le croupier révèle sa carte cachée.\n \
Il doit tirer des cartes jusqu’à atteindre au moins 17\n \
points.\n \
\n \
🏆 Résultats\n \
Le joueur dépasse 21 → il perd.\n \
Le croupier dépasse 21 → le joueur gagne.\n \
La main du joueur est plus proche de 21 que celle du\n \
croupier → le joueur gagne.\n \
Le joueur et le croupier ont la même valeur → égalité,\n \
la mise est rendue.\n \
\n \
💎 Blackjack\n \
Un Blackjack est obtenu avec un As + une carte valant\n \
10 dès la distribution initiale.\n \
Il bat toute autre combinaison, sauf un autre\n \
Blackjack (égalité).\n \
\n \
Gain classique : 1,5 fois la mise."; }
      const textHelp = new TextBlock("helpText", rulesText);
      textHelp.parent = boxHelp;
      textHelp.textHorizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
      textHelp.textVerticalAlignment = TextBlock.VERTICAL_ALIGNMENT_TOP;
      textHelp.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
      textHelp.left = 8 + "px";
      textHelp.top = 70 + "px";
      textHelp.color = "white";
      textHelp.fontSize = 20 + "px";
      textHelp.lineSpacing = 2 + "px";
      boxHelp.addControl(textHelp);
      fontHelp.onPointerClickObservable.add(() => {
        // Close the quit confirmation box
        this.ui.removeControl(fontHelp);
        this.ui.removeControl(scrollViewer);
      });
      scrollViewer.addControl(boxHelp);
      this.ui.addControl(fontHelp);
      this.ui.addControl(scrollViewer);
      // this.ui.addControl(boxHelp);
    });
    this.ui.addControl(buttonHelp);

    // Quit Button
    const buttonQuit = Button.CreateSimpleButton("quitButton", "🚪");
    buttonQuit.horizontalAlignment = Button.HORIZONTAL_ALIGNMENT_LEFT;
    buttonQuit.verticalAlignment = Button.VERTICAL_ALIGNMENT_BOTTOM;
    buttonQuit.top = -40 + "px";
    buttonQuit.left = 16 + "px";
    buttonQuit.width = 40 + "px";
    buttonQuit.height = 40 + "px";
    buttonQuit.fontSize = 24 + "px";
    buttonQuit.color = "white";
    buttonQuit.cornerRadius = 50;
    buttonQuit.thickness = 0;
    buttonQuit.background = "black";
    buttonQuit.onPointerEnterObservable.add(() => {
      buttonQuit.thickness = 0.5;
    });
    buttonQuit.onPointerOutObservable.add(() => {
      buttonQuit.thickness = 0;
    });
    buttonQuit.onPointerClickObservable.add(() => {
      // Pop-up confirmation dialog
      const fontQuit = new Rectangle("quitFontBox");
      fontQuit.width = "100%";
      fontQuit.height = "100%";
      fontQuit.thickness = 0;
      fontQuit.background = "black";
      fontQuit.alpha = 0.5;

      const boxQuit = new Rectangle("quitBox");
      boxQuit.width = 480 + "px";
      boxQuit.height = 220 + "px";
      boxQuit.color = "white";
      boxQuit.background = "black";
      boxQuit.alpha = 1;
      boxQuit.cornerRadius = 20;
      boxQuit.thickness = 0;

      const textQuit = new TextBlock("quitMessageText", "Are you sure you want to quit?");
      textQuit.color = "white";
      textQuit.top = -36.5 + "px";
      textQuit.fontSize = 20 + "px";
      boxQuit.addControl(textQuit);

      const buttonQuitConfirmation = Button.CreateSimpleButton("quitConfirmationButton", "Quit");
      buttonQuitConfirmation.width = 80 + "px";
      buttonQuitConfirmation.height = 30 + "px";
      buttonQuitConfirmation.color = "grey";
      buttonQuitConfirmation.cornerRadius = 20;
      buttonQuitConfirmation.thickness = 1;
      buttonQuitConfirmation.background = "black";
      buttonQuitConfirmation.top = 36.5 + "px";
      buttonQuitConfirmation.onPointerEnterObservable.add(() => {
        buttonQuitConfirmation.color = "white"; // Change color on hover
      });
      buttonQuitConfirmation.onPointerOutObservable.add(() => {
        buttonQuitConfirmation.color = "grey"; // Change color back on hover out
      });
      buttonQuitConfirmation.onPointerClickObservable.add(() => {
        // Handle quit confirmation
        console.log("User confirmed quit");
        navigate("/"); // Redirect to home page
      });
      fontQuit.onPointerClickObservable.add(() => {
        // Close the quit confirmation box
        this.ui.removeControl(boxQuit);
        this.ui.removeControl(fontQuit);
      });
      boxQuit.addControl(buttonQuitConfirmation);
      // fontQuit.addControl(boxQuit);
      this.ui.addControl(fontQuit);
      this.ui.addControl(boxQuit);
    });
    this.ui.addControl(buttonQuit);

    // Volume button
    const buttonVolume = Button.CreateSimpleButton("volumeButton", "🔊");
    buttonVolume.horizontalAlignment = Button.HORIZONTAL_ALIGNMENT_LEFT;
    buttonVolume.verticalAlignment = Button.VERTICAL_ALIGNMENT_BOTTOM;
    buttonVolume.top = -90 + "px";
    buttonVolume.left = 16 + "px";
    buttonVolume.width = 40 + "px";
    buttonVolume.height = 40 + "px";
    buttonVolume.fontSize = 24 + "px";
    // buttonVolume.color = "white";
    buttonVolume.cornerRadius = 50;
    buttonVolume.thickness = 0;
    buttonVolume.background = "black";
    buttonVolume.onPointerEnterObservable.add(() => {
      buttonVolume.thickness = 0.5;
      // Can change volume with a slider 🔇​​🔈​🔉​🔊
    });
    buttonVolume.onPointerOutObservable.add(() => {
      buttonVolume.thickness = 0;
      // Hide the slider
    });
    buttonVolume.onPointerClickObservable.add(() => {
      // Mute or unmute the sound
      if (buttonVolume.textBlock) {
        if (buttonVolume.textBlock.text === "🔇") {
          buttonVolume.textBlock.text = "🔊";
        } else {
          buttonVolume.textBlock.text = "🔇";
        }
      }
    });
    this.ui.addControl(buttonVolume);
  }

  private createCoinButton(value: number, position: Vector2) {
    const button = Button.CreateImageOnlyButton(`coinButton${value}`, `assets/${value}.svg`);
    button.verticalAlignment = Button.VERTICAL_ALIGNMENT_BOTTOM;
    button.left = position.x + "px";
    button.top = position.y + "px";
    button.width = 56 + "px";
    button.height = 56 + "px";
    button.cornerRadius = 35;
    button.thickness = 0;
    button.color = "black";
    button.background = "white";
    button.fontSize = 24 + "px";

    button.onPointerEnterObservable.add(() => {
      button.thickness = 1;
      button.color = "white"; // Change color on hover
    });
    button.onPointerOutObservable.add(() => {
      if (this.Bet.coinsButtons[`${value}`].isActive)
        return;
      button.thickness = 0;
      button.color = "black"; // Change color back on hover out
    });
    button.onPointerClickObservable.add(() => {
      this.Bet.coinsButtons[`${value}`].isActive = !this.Bet.coinsButtons[`${value}`].isActive;
      if (this.Bet.coinsButtons[`${value}`].isActive) {
        Object.values(this.Bet.coinsButtons).forEach(coin => {
          if (coin.isActive && coin !== this.Bet.coinsButtons[`${value}`]) {
            coin.isActive = false;
            coin.button.thickness = 0;
            coin.button.color = "black";
          }
        });
      }
    });

    this.ui.addControl(button);
    return {
      button,
      value,
      isActive: false
    };
  }

  private createBetButton() {
    const button = Button.CreateSimpleButton("betButton", "BET");
    button.verticalAlignment = Button.VERTICAL_ALIGNMENT_BOTTOM;
    button.top = -14.6 + "px";
    button.width = 170 + "px";
    button.height = 165 + "px";
    button.fontSize = 48 + "px";
    button.color = "black";
    button.cornerRadius = 100;
    button.thickness = 0;
    button.background = "white";
    button.alpha = 0.7;
    button.onPointerClickObservable.add(() => {
      console.log("Play Bet clicked");
      if (this.totalBetAmount === 0)
        return;
      this.bankAmount -= this.totalBetAmount;
      (this.ui.getControlByName("BankLabel") as TextBlock).text = `Bank: ${this.bankAmount} €`;

      Object.values(this.Bet.areas).forEach(area => {
        if (area.bet > 0) {
          this.sceneFunctions.addChoosenPlace(area.place);
          area.buttonCleanBet.isVisible = false;
        }
        area.selectBox.onPointerEnterObservable.clear();
      });
      Object.values(this.Bet.coinsButtons).forEach(coin => {
        coin.isActive = false;
        coin.button.isVisible = false;
      });
      button.isVisible = false;

      this.sceneFunctions.endOfBetting();
    });
    this.ui.addControl(button);

    return button;
  }

  private createDealersCardsValue() {
    
    const placeAreaMesh = this.sceneFunctions.getPlaceAreaMesh("dealers");
    if (!placeAreaMesh) {
      console.error(`Place area mesh for Dealers not found`);
      // return;
    }
    const selectableAreaAttachedUI = AdvancedDynamicTexture.CreateForMesh(placeAreaMesh, 240, 240);

    const cardsValue = new TextBlock(`dealersCardsValue`);
    cardsValue.textVerticalAlignment = TextBlock.VERTICAL_ALIGNMENT_BOTTOM;
    cardsValue.top = -30 + "px";
    cardsValue.color = "white";
    cardsValue.fontSize = 24 + "px";
    cardsValue.isVisible = false;
    selectableAreaAttachedUI.addControl(cardsValue);

    return cardsValue;
  }
  
  private createArea(place: string) {
    
    const placeAreaMesh = this.sceneFunctions.getPlaceAreaMesh(place);
    if (!placeAreaMesh) {
      console.error(`Place area mesh for ${place} not found`);
      // return;
    }
    const selectableAreaAttachedUI = AdvancedDynamicTexture.CreateForMesh(placeAreaMesh, 240, 240);

    const selectBox = new Rectangle("selectBox");
    selectBox.thickness = 0;
    selectBox.background = "green";
    selectBox.alpha = 0.2;
    selectBox.onPointerEnterObservable.add(() => {
      selectBox.background = "white";
      selectBox.alpha = 0.1;
    });
    selectBox.onPointerOutObservable.add(() => {
      selectBox.background = "green";
      selectBox.alpha = 0.2;
    });
    selectableAreaAttachedUI.addControl(selectBox);

    const cardsValue = new TextBlock(`cardsValuePlace${place}`);
    cardsValue.textVerticalAlignment = TextBlock.VERTICAL_ALIGNMENT_BOTTOM;
    cardsValue.top = -50 + "px";
    cardsValue.color = "white";
    cardsValue.fontSize = 18 + "px";
    cardsValue.isVisible = false;
    selectableAreaAttachedUI.addControl(cardsValue);

    const coinAreaMesh = this.sceneFunctions.getCoinAreaMesh(place);
    if (!coinAreaMesh) {
      console.error(`Coin area mesh for ${place} not found`);
      // return;
    }
    const coinAreaAttachedUI = AdvancedDynamicTexture.CreateForMesh(coinAreaMesh, 240, 240);
  
    const textBet = new TextBlock(`textBetPlace${place}`);
    textBet.textVerticalAlignment = TextBlock.VERTICAL_ALIGNMENT_BOTTOM;
    textBet.color = "white";
    textBet.fontSize = 46 + "px";
    textBet.isVisible = false;
    coinAreaAttachedUI.addControl(textBet);

    const buttonCleanBet = Button.CreateSimpleButton(`cleanBetPlace${place}`, "❌​​");
    buttonCleanBet.verticalAlignment = Button.VERTICAL_ALIGNMENT_TOP;
    buttonCleanBet.width = 64 + "px";
    buttonCleanBet.height = 58.5 + "px";
    buttonCleanBet.cornerRadius = 20;
    buttonCleanBet.thickness = 0;
    buttonCleanBet.background = "transparent";
    buttonCleanBet.fontSize = 36 + "px";
    buttonCleanBet.isVisible = false;
    buttonCleanBet.onPointerEnterObservable.add(() => {
      buttonCleanBet.background = "white";
      console.log("hover clean bet");
    });
    buttonCleanBet.onPointerOutObservable.add(() => {
      buttonCleanBet.background = "transparent";
    });
    coinAreaAttachedUI.addControl(buttonCleanBet);

    const area = {
      place,
      selectBox,
      cardsValue,
      buttonCleanBet,
      textBet,
      bet: 0,
    };
  
    selectBox.onPointerClickObservable.add(() => {
      let currentValue = 0;
      Object.values(this.Bet.coinsButtons).forEach(coin => {
        if (coin.isActive)
          currentValue = coin.value;
      });
      if (currentValue === 0)
        return;
      if (this.totalBetAmount + currentValue > this.bankAmount)
        return;
      if (area.bet == 0) {
        buttonCleanBet.isVisible = true;
        textBet.isVisible = true;
      }
      area.bet += currentValue;
      this.sceneFunctions.setCoinMaterial(area.place, area.bet);
      textBet.text = area.bet.toString();
      // this.sceneFunctions.setCameraToPlace(area.place);
      this.totalBetAmount += currentValue;
      (this.ui.getControlByName("TotalBetLabel") as TextBlock).text = `Total Bet: ${this.totalBetAmount} €`;
    });
    buttonCleanBet.onPointerClickObservable.add(() => {
      // this.sceneFunctions.setCameraToPlace("default");
      this.sceneFunctions.hideCoinMesh(area.place);
      this.totalBetAmount -= area.bet;
      (this.ui.getControlByName("TotalBetLabel") as TextBlock).text = `Total Bet: ${this.totalBetAmount} €`;
      area.bet = 0;
      buttonCleanBet.isVisible = false;
      textBet.isVisible = false;
    });

    return area;
  }

  private initCardsInteractionGui() {
    // Stand Button
    const stand = Button.CreateSimpleButton("standButton", "STAND");
    stand.verticalAlignment = Button.VERTICAL_ALIGNMENT_BOTTOM;
    stand.top = -150 + "px";
    stand.left = -80 + "px";
    stand.width = 136 + "px";
    stand.height = 60 + "px";
    stand.fontSize = 32 + "px";
    stand.color = "black";
    stand.cornerRadius = 15;
    stand.thickness = 0;
    stand.background = "white";
    stand.alpha = 0.7;
    stand.onPointerClickObservable.add(() => {
      console.log("Player chose to STAND");
      this.cardsInteractionsVisibility(false);
      // BjRequest.stand();
    });
    stand.isVisible = false;
    this.ui.addControl(stand);

    // Hit Button
    const hit = Button.CreateSimpleButton("hitButton", "HIT");
    hit.verticalAlignment = Button.VERTICAL_ALIGNMENT_BOTTOM;
    hit.top = -150 + "px";
    hit.left = 80 + "px";
    hit.width = 136 + "px";
    hit.height = 60 + "px";
    hit.fontSize = 32 + "px";
    hit.color = "black";
    hit.cornerRadius = 15;
    hit.thickness = 0;
    hit.background = "white";
    hit.alpha = 0.7;
    hit.onPointerClickObservable.add(() => {
      console.log("Player chose to HIT");
      // BjRequest.hit();
    });
    hit.isVisible = false;
    this.ui.addControl(hit);

    // Double Down Button
    const doubleDown = Button.CreateSimpleButton("doubleDownButton", "DOUBLE DOWN");
    doubleDown.verticalAlignment = Button.VERTICAL_ALIGNMENT_BOTTOM;
    doubleDown.top = 65 + "px";
    doubleDown.left = -80 + "px";
    doubleDown.width = 288 + "px";
    doubleDown.height = 60 + "px";
    doubleDown.fontSize = 32 + "px";
    doubleDown.color = "black";
    doubleDown.cornerRadius = 15;
    doubleDown.thickness = 0;
    doubleDown.background = "white";
    doubleDown.alpha = 0.7;
    doubleDown.onPointerClickObservable.add(() => {
      console.log("Player chose to DOUBLE DOWN");
      // BjRequest.doubleDown();
      this.cardsInteractionsVisibility(false);
    });
    doubleDown.isVisible = false;
    this.ui.addControl(doubleDown);

    // Split Button
    const split = Button.CreateSimpleButton("splitButton", "SPLIT");
    split.verticalAlignment = Button.VERTICAL_ALIGNMENT_BOTTOM;
    split.top = -65 + "px";
    split.left = 156 + "px";
    split.width = 136 + "px";
    split.height = 60 + "px";
    split.fontSize = 32 + "px";
    split.color = "black";
    split.cornerRadius = 15;
    split.thickness = 0;
    split.background = "white";
    split.alpha = 0.7;
    split.onPointerClickObservable.add(() => {
      console.log("Player chose to SPLIT");
      // BjRequest.split();
    });
    split.isVisible = false;
    this.ui.addControl(split);

    return {stand, hit, doubleDown, split};
  }

  started(): boolean {
    return !this.playButton.isVisible;
  }

  constGuiVisibility(isVisible: boolean) {
    (this.ui.getControlByName("BankLabel") as TextBlock).isVisible = isVisible;
    (this.ui.getControlByName("TotalBetLabel") as TextBlock).isVisible = isVisible;
    (this.ui.getControlByName("helpButton") as Button).isVisible = isVisible;
    (this.ui.getControlByName("quitButton") as Button).isVisible = isVisible;
    (this.ui.getControlByName("volumeButton") as Button).isVisible = isVisible;
  }

  betGuiVisibility(isVisible: boolean) {
    this.Bet.button.isVisible = isVisible;
    Object.values(this.Bet.coinsButtons).forEach(button => {
      button.button.isVisible = isVisible;
    });
    Object.values(this.Bet.areas).forEach(area => {
      area.selectBox.isVisible = isVisible;
    });
  }

  setPlaceCardsValue(place: string, value: string) {
    let cardsValue = this.Bet.areas[place]?.cardsValue;
    if (!cardsValue) {
      if (place == "dealers")
        cardsValue = this.dealersCardsValue;
      else {
        console.error(`Area for place ${place} not found`);
        return;
      }
    }
    cardsValue.text = value;
    cardsValue.isVisible = true;
  }

  hidePlaceCardsValue(place: string) {
    let cardsValue = this.Bet.areas[place]?.cardsValue;
    if (!cardsValue) {
      if (place == "dealers")
        cardsValue = this.dealersCardsValue;
      else {
        console.error(`Area for place ${place} not found`);
        return;
      }
    }
    cardsValue.isVisible = false;
  }

  cardsInteractionsVisibility(isVisible: boolean) {
    this.cardsInteractions.stand.isVisible = isVisible;
    this.cardsInteractions.hit.isVisible = isVisible;
    this.cardsInteractions.doubleDown.isVisible = isVisible;
    this.cardsInteractions.split.isVisible = isVisible;
  }
}