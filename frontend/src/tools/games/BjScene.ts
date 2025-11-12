import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

interface PlayerState {
  id: string;
  username: string;
  balance: number;
  hands: Record<number, { cards: string[]; value: number }>;
}

interface GameState {
  dealerCard: string;
  players: PlayerState[];
}

export default class BjScene {
  engine: BABYLON.Engine;
  scene: BABYLON.Scene;
  camera: BABYLON.ArcRotateCamera;
  
  // Meshes
  private cardMeshes: Map<string, BABYLON.Mesh[]> = new Map();
  private chipMeshes: Map<string, BABYLON.Mesh[]> = new Map();
  private dealerBackMesh?: BABYLON.Mesh;
  
  // UI Elements
  private uiLayer?: BABYLON.GUI.AdvancedDynamicTexture;
  private messageText?: BABYLON.GUI.TextBlock;
  private betButtons: BABYLON.GUI.Button[] = [];
  private actionButtons: Map<string, BABYLON.GUI.Button> = new Map();
  
  // Game state
  private currentPlayerId?: string;
  private selectedPosition: number = 0;
  private betAmount: number = 10;
  
  // Callbacks (connectés au WebSocket depuis Blackjack.ts)
  public onBet?: (amount: number, position: number) => void;
  public onHit?: () => void;
  public onStand?: () => void;
  public onSplit?: (position: number) => void;
  public onStart?: () => void;

  constructor(canvas: HTMLCanvasElement) {
    this.engine = new BABYLON.Engine(canvas, true);
    this.scene = new BABYLON.Scene(this.engine);

    // Camera
    this.camera = new BABYLON.ArcRotateCamera(
      "cam",
      Math.PI / 2,
      Math.PI / 3,
      15,
      new BABYLON.Vector3(0, 0, 0),
      this.scene
    );
    this.camera.attachControl(canvas, true);
    this.camera.lowerRadiusLimit = 10;
    this.camera.upperRadiusLimit = 25;

    // Lighting
    const light = new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(0, 1, 0),
      this.scene
    );
    light.intensity = 0.8;

    // Table
    this.createTable();
    
    // UI
    this.createUI();
  }

  private createTable() {
    const table = BABYLON.MeshBuilder.CreateGround(
      "table",
      { width: 20, height: 15 },
      this.scene
    );
    const mat = new BABYLON.StandardMaterial("tableMat", this.scene);
    mat.diffuseColor = new BABYLON.Color3(0, 0.4, 0);
    table.material = mat;

    // Position markers (1-5)
    for (let i = 1; i <= 5; i++) {
      const pos = this.getPositionCoordinates(i);
      const marker = BABYLON.MeshBuilder.CreateCylinder(
        `marker_${i}`,
        { height: 0.1, diameter: 1.5 },
        this.scene
      );
      marker.position = new BABYLON.Vector3(pos.x, 0.05, pos.z);
      
      const markerMat = new BABYLON.StandardMaterial(`markerMat_${i}`, this.scene);
      markerMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
      markerMat.alpha = 0.3;
      marker.material = markerMat;

      // Clickable
      marker.actionManager = new BABYLON.ActionManager(this.scene);
      marker.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPickTrigger,
          () => {
            this.selectPosition(i);
          }
        )
      );
    }
  }

  private createUI() {
    this.uiLayer = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    // Message display
    this.messageText = new BABYLON.GUI.TextBlock();
    this.messageText.text = "Connexion au serveur...";
    this.messageText.color = "white";
    this.messageText.fontSize = 24;
    this.messageText.top = "-40%";
    this.uiLayer.addControl(this.messageText);

    // Bet amount selector
    const betPanel = new BABYLON.GUI.StackPanel();
    betPanel.width = "300px";
    betPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    betPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    betPanel.top = "-20px";
    betPanel.left = "20px";
    this.uiLayer.addControl(betPanel);

    [10, 25, 50, 100].forEach(amount => {
      const btn = BABYLON.GUI.Button.CreateSimpleButton(`bet_${amount}`, `${amount}€`);
      btn.width = "70px";
      btn.height = "40px";
      btn.color = "white";
      btn.background = "#0a4a0a";
      btn.onPointerClickObservable.add(() => {
        this.betAmount = amount;
        this.updateBetButtons();
      });
      betPanel.addControl(btn);
      this.betButtons.push(btn);
    });

    // Place Bet button
    const placeBetBtn = BABYLON.GUI.Button.CreateSimpleButton("placeBet", "PLACE BET");
    placeBetBtn.width = "150px";
    placeBetBtn.height = "50px";
    placeBetBtn.color = "white";
    placeBetBtn.background = "#1a7a1a";
    placeBetBtn.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    placeBetBtn.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    placeBetBtn.top = "-100px";
    placeBetBtn.isVisible = false;
    placeBetBtn.onPointerClickObservable.add(() => {
      if (this.selectedPosition > 0 && this.onBet) {
        this.onBet(this.betAmount, this.selectedPosition);
      }
    });
    this.uiLayer.addControl(placeBetBtn);
    this.actionButtons.set("placeBet", placeBetBtn);

    // Start button
    const startBtn = BABYLON.GUI.Button.CreateSimpleButton("start", "START GAME");
    startBtn.width = "150px";
    startBtn.height = "50px";
    startBtn.color = "white";
    startBtn.background = "#d4af37";
    startBtn.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    startBtn.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    startBtn.top = "-100px";
    startBtn.isVisible = false;
    startBtn.onPointerClickObservable.add(() => {
      if (this.onStart) this.onStart();
    });
    this.uiLayer.addControl(startBtn);
    this.actionButtons.set("start", startBtn);

    // Hit button
    const hitBtn = BABYLON.GUI.Button.CreateSimpleButton("hit", "HIT");
    hitBtn.width = "100px";
    hitBtn.height = "50px";
    hitBtn.color = "white";
    hitBtn.background = "#1a7a1a";
    hitBtn.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    hitBtn.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    hitBtn.top = "-100px";
    hitBtn.left = "-60px";
    hitBtn.isVisible = false;
    hitBtn.onPointerClickObservable.add(() => {
      if (this.onHit) this.onHit();
    });
    this.uiLayer.addControl(hitBtn);
    this.actionButtons.set("hit", hitBtn);

    // Stand button
    const standBtn = BABYLON.GUI.Button.CreateSimpleButton("stand", "STAND");
    standBtn.width = "100px";
    standBtn.height = "50px";
    standBtn.color = "white";
    standBtn.background = "#7a1a1a";
    standBtn.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    standBtn.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    standBtn.top = "-100px";
    standBtn.left = "60px";
    standBtn.isVisible = false;
    standBtn.onPointerClickObservable.add(() => {
      if (this.onStand) this.onStand();
    });
    this.uiLayer.addControl(standBtn);
    this.actionButtons.set("stand", standBtn);

    this.updateBetButtons();
  }

  private updateBetButtons() {
    this.betButtons.forEach(btn => {
      const amount = parseInt(btn.name.split('_')[1]);
      if (amount === this.betAmount) {
        btn.background = "#1a7a1a";
      } else {
        btn.background = "#0a4a0a";
      }
    });
  }

  private selectPosition(position: number) {
    this.selectedPosition = position;
    this.showMessage(`Position ${position} sélectionnée - Montant: ${this.betAmount}€`);
  }

  private getPositionCoordinates(position: number): { x: number; z: number } {
    // Positions autour de la table (semi-cercle)
    const angle = (position - 3) * (Math.PI / 6);
    const radius = 6;
    return {
      x: Math.sin(angle) * radius,
      z: Math.cos(angle) * radius + 2
    };
  }

  private getDealerPosition(): { x: number; z: number } {
    return { x: 0, z: -4 };
  }

  // === Public Methods (appelés par les événements WebSocket) ===

  public showMessage(message: string) {
    if (this.messageText) {
      this.messageText.text = message;
    }
  }

  public enableBetting() {
    this.actionButtons.get("placeBet")!.isVisible = true;
    this.actionButtons.get("start")!.isVisible = false;
    this.actionButtons.get("hit")!.isVisible = false;
    this.actionButtons.get("stand")!.isVisible = false;
  }

  public enableStart() {
    this.actionButtons.get("start")!.isVisible = true;
    this.actionButtons.get("placeBet")!.isVisible = false;
  }

  public enableActions() {
    this.actionButtons.get("hit")!.isVisible = true;
    this.actionButtons.get("stand")!.isVisible = true;
    this.actionButtons.get("placeBet")!.isVisible = false;
    this.actionButtons.get("start")!.isVisible = false;
  }

  public disableAllActions() {
    this.actionButtons.forEach(btn => btn.isVisible = false);
  }

  public updateTable(bets: any) {
    // Afficher les jetons placés
    console.log("Table update:", bets);
  }

  public startRound(gameState: GameState) {
    this.clearCards();
    
    // Afficher la carte visible du dealer
    const dealerPos = this.getDealerPosition();
    const dealerCard = this.createCardMesh(gameState.dealerCard);
    dealerCard.position = new BABYLON.Vector3(dealerPos.x, 0.1, dealerPos.z);
    
    // Carte cachée du dealer
    this.dealerBackMesh = this.createCardBack();
    this.dealerBackMesh.position = new BABYLON.Vector3(dealerPos.x + 0.3, 0.1, dealerPos.z);

    // Afficher les cartes des joueurs
    gameState.players.forEach(player => {
      Object.entries(player.hands).forEach(([posStr, hand]) => {
        const position = parseInt(posStr);
        const pos = this.getPositionCoordinates(position);
        
        hand.cards.forEach((cardName, index) => {
          const card = this.createCardMesh(cardName);
          card.position = new BABYLON.Vector3(
            pos.x + index * 0.3,
            0.1,
            pos.z
          );
          
          const key = `${player.id}_${position}`;
          if (!this.cardMeshes.has(key)) {
            this.cardMeshes.set(key, []);
          }
          this.cardMeshes.get(key)!.push(card);
        });
      });
    });
  }

  public drawCard(data: { playerId: string; position: number; card: string; value: number }) {
    const pos = this.getPositionCoordinates(data.position);
    const key = `${data.playerId}_${data.position}`;
    const existingCards = this.cardMeshes.get(key) || [];
    
    const card = this.createCardMesh(data.card);
    card.position = new BABYLON.Vector3(
      pos.x + existingCards.length * 0.3,
      0.1,
      pos.z
    );
    
    if (!this.cardMeshes.has(key)) {
      this.cardMeshes.set(key, []);
    }
    this.cardMeshes.get(key)!.push(card);

    this.showMessage(`Carte tirée: ${data.card} (Total: ${data.value})`);
  }

  public playerStand(data: any) {
    this.showMessage(`${data.username} s'arrête`);
  }

  public revealDealerCards(dealerData: { cards: string[]; value: number }) {
    if (this.dealerBackMesh) {
      this.dealerBackMesh.dispose();
      this.dealerBackMesh = undefined;
    }

    const dealerPos = this.getDealerPosition();
    dealerData.cards.forEach((cardName, index) => {
      if (index > 0) { // La première carte est déjà affichée
        const card = this.createCardMesh(cardName);
        card.position = new BABYLON.Vector3(
          dealerPos.x + index * 0.3,
          0.1,
          dealerPos.z
        );
      }
    });
  }

  private clearCards() {
    this.cardMeshes.forEach(meshes => {
      meshes.forEach(mesh => mesh.dispose());
    });
    this.cardMeshes.clear();
    
    if (this.dealerBackMesh) {
      this.dealerBackMesh.dispose();
      this.dealerBackMesh = undefined;
    }
  }

  private createCardMesh(cardName: string): BABYLON.Mesh {
    const plane = BABYLON.MeshBuilder.CreatePlane(
      `card_${cardName}_${Date.now()}`,
      { width: 1, height: 1.4 },
      this.scene
    );
    plane.rotation.x = Math.PI / 2;

    const mat = new BABYLON.StandardMaterial(`mat_${cardName}`, this.scene);
    mat.diffuseTexture = new BABYLON.Texture(
      `/assets/${cardName.split('_of_')[1]}/${cardName.split('_of_')[0]}.png`,
      this.scene
    );
    mat.backFaceCulling = false;
    plane.material = mat;

    return plane;
  }

  private createCardBack(): BABYLON.Mesh {
    const plane = BABYLON.MeshBuilder.CreatePlane(
      `card_back_${Date.now()}`,
      { width: 1, height: 1.4 },
      this.scene
    );
    plane.rotation.x = Math.PI / 2;

    const mat = new BABYLON.StandardMaterial("mat_back", this.scene);
    mat.diffuseTexture = new BABYLON.Texture(`/assets/cardBackTexture.png`, this.scene);
    mat.backFaceCulling = false;
    plane.material = mat;

    return plane;
  }

  start() {
    this.engine.runRenderLoop(() => this.scene.render());
  }
}