import { Engine, Scene,
  HemisphericLight,
  Vector3, Color3, GlowLayer,
  StandardMaterial, AssetsManager,
  ArcRotateCamera, MeshBuilder,
  ParticleSystem, Mesh,
  Texture, Color4, Vector2,
  AbstractMesh, BaseTexture
} from "@babylonjs/core";
import { AdvancedDynamicTexture,
  Button, InputText,
  Rectangle, TextBlock
} from "@babylonjs/gui";
import "@babylonjs/gui";
import "@babylonjs/loaders/glTF"; // nécessaire pour le support GLTF/GLB
import { navigate } from '../router';

export default function BlackjackScene(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'flex justify-center items-center h-screen bg-gray-900';

  const canvas = document.createElement('canvas');
  canvas.className = 'block fixed top-0 left-0 w-full h-full';
  const resizeCanvas = () => {
    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
  };
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  container.appendChild(canvas);

  function init() {

    function createScene() {
      const engine = new Engine(canvas, true, { adaptToDeviceRatio: true });
      const scene = new Scene(engine);
      scene.clearColor = new Color4(0.035, 0.02, 0.05, 1); // Couleur de fond

      // Camera
      const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2, 2, new Vector3(0, 1.5, 1.2), scene);
      camera.attachControl(canvas, true);

      // Lights
      const light1 = new HemisphericLight("light1", new Vector3(0, 2, -1), scene);
      light1.intensity = 0.1;
      const light2 = new HemisphericLight("light2", new Vector3(-3, 1, 1), scene);
      light2.intensity = 0.2;
      const light3 = new HemisphericLight("light3", new Vector3(3, 1, 1), scene);
      light3.intensity = 0.3;

      // Glow
      const glow = new GlowLayer("glow", scene);
      glow.intensity = 0.5; // Intensité de l'effet de glow

      const colorPurple = new Color3(0.5, 0.2, 0.5); // Purple

      // Places
      type Place = {
        name: string;
        placeMesh: Mesh;
        coinMesh?: Mesh | null;
        direction: Vector3;
        positonCards: Vector3;
        positionCoins: Vector3;
      }
      // Ratio based on direction
      const placeCards = 10;
      const placeCoins = 12;

      // Array to hold places
      let placesTab: Place[] = [];

      // Material for places
      const MatPurple = new StandardMaterial("MatPurple", scene);
      MatPurple.diffuseColor = colorPurple;
      MatPurple.emissiveColor = colorPurple;
      // Material for places coins
      const MatWhite = new StandardMaterial("MatWhite", scene);
      MatWhite.diffuseColor = Color3.White();
      MatWhite.emissiveColor = Color3.White();
      // MatWhite.text
      MatWhite.alpha = 0.1; // Semi-transparent for coins

      // Initialize places
      function initPlace(name: string, direction: Vector3, positionRatio?: number) {
        const place: Place = {
          name: name,
          placeMesh: MeshBuilder.CreateSphere(name, { diameter: 0.02 }, scene),
          coinMesh: positionRatio ? null : MeshBuilder.CreateDisc(name + "Coin", { radius: 0.06, tessellation: 32 }, scene),
          direction: direction,
          positonCards: positionRatio ? direction.scale(positionRatio) : direction.scale(placeCards), // Position for cards
          positionCoins: direction.scale(placeCoins)
        };
        place.positonCards.y = 1; // Set height for cards position
        place.placeMesh.position = place.positonCards;
        place.placeMesh.material = MatPurple;
        place.positionCoins.y = 1; // Set height for coins position
        if (place.coinMesh) {
          place.coinMesh.position = place.positionCoins;
          place.coinMesh.rotation.x = Math.PI / 2; // Rotate coin mesh to lie flat
          place.coinMesh.material = MatWhite;
          place.coinMesh.isVisible = false; // Initially hidden
        }
        placesTab.push(place);
      }

      initPlace("Place1", new Vector3(0.07, 1, 0.04));
      initPlace("Place2", new Vector3(0.04, 1, 0.07));
      initPlace("Place3", new Vector3(0, 1, 0.08));
      initPlace("Place4", new Vector3(-0.04, 1, 0.07));
      initPlace("Place5", new Vector3(-0.07, 1, 0.04));
      initPlace("DealersPlace", new Vector3(0, 1, 0.08), 4);

      // urlTexture
      const urlTexture = "https://playground.babylonjs.com/textures/flare.png";

      // Particules pour le fond
      const fontParticulesColor = colorPurple.toColor4(); // Purple color
      const fontParticles = new ParticleSystem("fontParticles",50000, scene);
      fontParticles.particleTexture = new Texture(urlTexture, scene);
      fontParticles.emitter = new Vector3(0, 0, -10); // Position de l'émetteur
      fontParticles.minEmitBox = new Vector3(0, 0, 0);
      fontParticles.maxEmitBox = new Vector3(0, 0, 0);
      fontParticles.minEmitPower = 10;
      fontParticles.maxEmitPower = 10;
      fontParticles.direction1 = new Vector3(1, 1, 1);
      fontParticles.direction2 = new Vector3(-1, -1, -1);
      fontParticles.color1 = fontParticulesColor;
      fontParticles.addColorGradient(0, Color3.Black().toColor4());
      fontParticles.addColorGradient(0.1, fontParticulesColor, Color3.White().toColor4());
      fontParticles.addColorGradient(0.9, Color3.Black().toColor4());
      fontParticles.minSize = 0.02;
      fontParticles.maxSize = 0.02;
      fontParticles.minLifeTime = 10;
      fontParticles.maxLifeTime = 10;
      fontParticles.emitRate = 1000;
      fontParticles.start();

      // Add Blackjack Table from a .glb file
      const assetsManager = new AssetsManager(scene);
      
      // MatCoinTab
      const MatCoinTab: StandardMaterial[] = [];

      function createCoinMaterials(textureName: string): StandardMaterial {
        const MatCoinTexture = new Texture(`assets/${textureName}.png`, scene);
        MatCoinTexture.uOffset = 0.04; // Adjust texture offset for better alignment
        const MatCoin = new StandardMaterial(`MatCoin${textureName}`, scene);
        MatCoin.hasTexture(MatCoinTexture);
        MatCoin.diffuseTexture = MatCoinTexture;
        MatCoin.emissiveTexture = MatCoinTexture;
        return MatCoin;
      }

      MatCoinTab.push(createCoinMaterials("5"));
      MatCoinTab.push(createCoinMaterials("10"));
      MatCoinTab.push(createCoinMaterials("20"));
      MatCoinTab.push(createCoinMaterials("50"));
      MatCoinTab.push(createCoinMaterials("100"));

      function createCoinMesh(
        material: StandardMaterial,
        position: Vector3,
        onReady?: (meshes: AbstractMesh[]) => void
      ): AbstractMesh[] {
        const taskCoin = assetsManager.addContainerTask("loadGLB", "", "models/", "Coin5.glb");

        let coinMeshes: AbstractMesh[] = [];

        taskCoin.onSuccess = (taskCoin) => {
          taskCoin.loadedContainer.addAllToScene();
          coinMeshes = taskCoin.loadedContainer.meshes;
          coinMeshes.forEach(mesh => mesh.material = material);

          coinMeshes[0].scaling = new Vector3(0.03, 0.03, 0.03);
          coinMeshes[0].position = position;
          coinMeshes[0].rotation = new Vector3(0, 0, Math.PI);

          if (onReady) onReady(coinMeshes);
        };

        taskCoin.onError = (taskCoin, message, exception) => {
          console.error(`Erreur de chargement des pièces :`, message, exception);
        };

        return coinMeshes;
      }

      const taskTable = assetsManager.addContainerTask("loadGLB", "", "models/", "floatingBlackjackTable.glb");

      const colorWood = new Color3(119/255, 70/255, 52/255); // Wood

      let armRest;
      let dealersBand;

      taskTable.onSuccess = (taskTable) => {
        taskTable.loadedContainer.addAllToScene();
        // Container elements: Table, ArmRest, DealersBand
        // Principal material
        const material = new StandardMaterial("material", scene);
        material.diffuseColor = colorWood;

        // ArmRest
        armRest = taskTable.loadedContainer.meshes.find(mesh => mesh.name === "ArmRest");
        if (armRest) {
          armRest.material = material;
          // armRest.scaling = new Vector3(0.5, 0.5, 0.5); // Adjust size
        } else
          console.warn("ArmRest mesh not found in the loaded GLB file.");
        // DealersBand
        dealersBand = taskTable.loadedContainer.meshes.find(mesh => mesh.name === "DealersBand");
        if (dealersBand) {
          dealersBand.material = material;
        } else
        console.warn("DealersBand mesh not found in the loaded GLB file.");
      };

      taskTable.onError = (taskTable, message, exception) => {
          console.error("Erreur de chargement :", message, exception);
      };

      // Particules pour les reacteurs
      function createReactor(position: Vector3, name: string) {
        // Reactor
        const reactor = MeshBuilder.CreateSphere(name, { diameter: 0.15, arc: 0.5 }, scene);
        reactor.position = position;
        reactor.material = MatPurple;
        const cap = MeshBuilder.CreateDisc("cap", {radius: 0.075, tessellation: 32 }, scene);
        cap.parent = reactor;
        cap.rotation.x = Math.PI; // à ajuster selon l'orientation
        cap.material = MatPurple; // autre matériau (par exemple rouge)

        // Reactor Particles
        const rp = new ParticleSystem(name, 500, scene);
        rp.particleTexture = new Texture(urlTexture, scene);
        rp.emitter = position; // Position de l'émetteur
        rp.minEmitBox = new Vector3(0, 0, 0);
        rp.maxEmitBox = new Vector3(0, 0, 0);
        rp.direction1 = new Vector3(0, 0, 1);
        rp.direction2 = new Vector3(0, 0, 1);
        rp.minLifeTime = 1;
        rp.maxLifeTime = 1;
        rp.emitRate = 100;
        rp.minEmitPower = 1.5;
        rp.maxEmitPower = 1.5;
        rp.minSize = 0.2;
        rp.maxSize = 0.2;
        rp.addSizeGradient(0, 0.2);
        rp.addSizeGradient(0.5, 0.1);
        rp.addSizeGradient(1, 0);
        rp.addColorGradient(0, colorPurple.toColor4(1));
        rp.addColorGradient(0.9, Color3.Black().toColor4(1));
        rp.start();

        return {reactor, rp};
      }

      const {reactor: reactorLeft, rp: rpLeft} = createReactor(new Vector3(-1.2, 0.985, 0), "ReactorLeftParticles");
      const {reactor: reactorRight, rp: rpRight} = createReactor(new Vector3(1.2, 0.985, 0), "ReactorRightParticles");

      return {
        engine,
        scene,
        camera,
        placesTab,
        fontParticles,
        assetsManager,
        MatCoinTab,
        createCoinMesh,
        reactorLeft, rpLeft,
        reactorRight, rpRight,
      }
    }

    const { engine, scene, camera, placesTab, fontParticles, assetsManager, MatCoinTab, createCoinMesh, reactorLeft, rpLeft, reactorRight, rpRight } = createScene();

    function createGUI() {
      // GUI
      const ui = AdvancedDynamicTexture.CreateFullscreenUI("UI");
      
      // nickname input
      let nickname = "Player";
      const inputNickname = new InputText("nicknameInput")
      inputNickname.width = "150px";
      inputNickname.height = "30px";
      inputNickname.placeholderText = nickname + "...";
      inputNickname.thickness = 1;
      inputNickname.color = "grey";
      inputNickname.background = "black";
      ui.addControl(inputNickname);

      // Play Button for nickname input
      const buttonPlay = Button.CreateSimpleButton("playButton", "PLAY");
      buttonPlay.top = "50px";
      buttonPlay.width = "120px";
      buttonPlay.height = "30px";
      buttonPlay.color = "grey";
      buttonPlay.cornerRadius = 15;
      buttonPlay.thickness = 1;
      buttonPlay.background = "black";
      buttonPlay.onPointerEnterObservable.add(() => {
        buttonPlay.color = "white"; // Change color on hover
      });
      buttonPlay.onPointerOutObservable.add(() => {
        buttonPlay.color = "grey"; // Change color back on hover out
      });
      buttonPlay.onPointerClickObservable.add(() => {
        // get Input nickname
        nickname = inputNickname.text || nickname;
        console.log("nickname: ", nickname);
        inputNickname.isVisible = false; // Hide the input
        buttonPlay.isVisible = false; // Hide the button
      });
      ui.addControl(buttonPlay);

      // Bank label
      let bankAmount = 1000;
      const labelBank = new TextBlock("BankLabel");
      labelBank.text = `Bank: ${bankAmount} €`;
      labelBank.verticalAlignment = TextBlock.VERTICAL_ALIGNMENT_BOTTOM;
      labelBank.horizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
      labelBank.width = "150px";
      labelBank.height = "40px";
      labelBank.color = "white";
      labelBank.isVisible = false; // Initially hidden
      ui.addControl(labelBank);

      // Total Bet label
      let totalBetAmount = 0;
      const labelTotalBet = new TextBlock("TotalBetLabel");
      labelTotalBet.text = `Total Bet: ${totalBetAmount} €`;
      labelTotalBet.verticalAlignment = TextBlock.VERTICAL_ALIGNMENT_BOTTOM;
      labelTotalBet.horizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
      labelTotalBet.left = "150px";
      labelTotalBet.width = "150px";
      labelTotalBet.height = "40px";
      labelTotalBet.color = "white";
      labelTotalBet.isVisible = false; // Initially hidden
      ui.addControl(labelTotalBet);

      // Help Button
      const buttonHelp = Button.CreateSimpleButton("helpButton", "?");
      buttonHelp.horizontalAlignment = Button.HORIZONTAL_ALIGNMENT_LEFT;
      buttonHelp.verticalAlignment = Button.VERTICAL_ALIGNMENT_TOP;
      buttonHelp.top = 20;
      buttonHelp.left = 20;
      buttonHelp.width = "40px";
      buttonHelp.height = "40px";
      buttonHelp.fontSize = 24;
      buttonHelp.color = "white";
      buttonHelp.cornerRadius = 20;
      buttonHelp.thickness = 0;
      buttonHelp.background = "black";
      buttonHelp.onPointerEnterObservable.add(() => {
        buttonHelp.thickness = 0.5; // Change thickness on hover
      });
      buttonHelp.onPointerOutObservable.add(() => {
        buttonHelp.thickness = 0; // Change thickness back on hover out
      });
      buttonHelp.onPointerClickObservable.add(() => {
        // Pop-up help dialog
        const fontHelp = new Rectangle("helpFontBox");
        fontHelp.width = "100%";
        fontHelp.height = "100%";
        fontHelp.thickness = 0;
        fontHelp.background = "black";
        fontHelp.alpha = 0.1;
        const boxHelp = new Rectangle("helpBox");
        boxHelp.horizontalAlignment = Button.HORIZONTAL_ALIGNMENT_LEFT;
        boxHelp.verticalAlignment = Button.VERTICAL_ALIGNMENT_TOP;
        boxHelp.top = 70;
        boxHelp.left = 20;
        boxHelp.width = "500px";
        boxHelp.height = "600px";
        boxHelp.color = "white";
        boxHelp.background = "black";
        boxHelp.alpha = 0.8;
        boxHelp.cornerRadius = 20;
        boxHelp.thickness = 0;
        const textHelp = new TextBlock("helpText", "This is the help message.");
        textHelp.parent = boxHelp;
        textHelp.color = "white";
        textHelp.fontSize = 20;
        boxHelp.addControl(textHelp);
        fontHelp.onPointerClickObservable.add(() => {
          // Close the quit confirmation box
          ui.removeControl(fontHelp);
          ui.removeControl(boxHelp);
        });
        ui.addControl(fontHelp);
        ui.addControl(boxHelp);
      });
      buttonHelp.isVisible = false; // Initially hidden
      ui.addControl(buttonHelp);

      // Quit Button
      const buttonQuit = Button.CreateSimpleButton("quitButton", "🚪");
      buttonQuit.horizontalAlignment = Button.HORIZONTAL_ALIGNMENT_LEFT;
      buttonQuit.verticalAlignment = Button.VERTICAL_ALIGNMENT_BOTTOM;
      buttonQuit.top = -40;
      buttonQuit.left = 20;
      buttonQuit.width = "40px";
      buttonQuit.height = "40px";
      buttonQuit.fontSize = 24;
      buttonQuit.color = "white";
      buttonQuit.cornerRadius = 20;
      buttonQuit.thickness = 0;
      buttonQuit.background = "black";
      buttonQuit.onPointerEnterObservable.add(() => {
        buttonQuit.thickness = 0.5; // Change thickness on hover
      });
      buttonQuit.onPointerOutObservable.add(() => {
        buttonQuit.thickness = 0; // Change thickness back on hover out
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
        boxQuit.width = "600px";
        boxQuit.height = "300px";
        boxQuit.color = "white";
        boxQuit.background = "black";
        boxQuit.alpha = 1;
        boxQuit.cornerRadius = 20;
        boxQuit.thickness = 0;
        const textQuit = new TextBlock("quitMessageText", "Are you sure you want to quit?");
        textQuit.color = "white";
        textQuit.top = "-50px";
        textQuit.fontSize = 20;
        boxQuit.addControl(textQuit);
        const buttonQuitConfirmation = Button.CreateSimpleButton("quitConfirmationButton", "Quit");
        buttonQuitConfirmation.width = "100px";
        buttonQuitConfirmation.height = "40px";
        buttonQuitConfirmation.color = "grey";
        buttonQuitConfirmation.cornerRadius = 20;
        buttonQuitConfirmation.thickness = 1;
        buttonQuitConfirmation.background = "black";
        buttonQuitConfirmation.top = "50px";
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
          ui.removeControl(boxQuit);
          ui.removeControl(fontQuit);
        });
        boxQuit.addControl(buttonQuitConfirmation);
        // fontQuit.addControl(boxQuit);
        ui.addControl(fontQuit);
        ui.addControl(boxQuit);
      });
      buttonQuit.isVisible = false; // Initially hidden
      ui.addControl(buttonQuit);

      // Volume button
      const buttonVolume = Button.CreateSimpleButton("volumeButton", "🔊");
      buttonVolume.horizontalAlignment = Button.HORIZONTAL_ALIGNMENT_LEFT;
      buttonVolume.verticalAlignment = Button.VERTICAL_ALIGNMENT_BOTTOM;
      buttonVolume.top = -90;
      buttonVolume.left = 20;
      buttonVolume.width = "40px";
      buttonVolume.height = "40px";
      buttonVolume.fontSize = 24;
      buttonVolume.color = "white";
      buttonVolume.cornerRadius = 20;
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
      buttonVolume.isVisible = false; // Initially hidden
      ui.addControl(buttonVolume);

      // Coins (5, 10, 25, 50, 100)
      type CoinButtonStruct = {
        coinButton: Button;
        value: number;
        isActive: boolean;
      }
      const coinsButtonTab: CoinButtonStruct[] = [];

      // Create coins buttons
      function createCoinButton(value: number, color: string, position: Vector2): CoinButtonStruct {
        const coinButton = Button.CreateSimpleButton(`coinButton${value}`, value.toString());
        coinButton.verticalAlignment = Button.VERTICAL_ALIGNMENT_BOTTOM;
        coinButton.left = position.x;
        coinButton.top = position.y;
        coinButton.width = "50px";
        coinButton.height = "50px";
        coinButton.cornerRadius = 25;
        coinButton.thickness = 0;
        coinButton.background = color;
        coinButton.color = "black";
        coinButton.fontSize = 24;

        const coin: CoinButtonStruct = {
          coinButton,
          value,
          isActive: false
        };

        coinButton.onPointerEnterObservable.add(() => {
          coinButton.thickness = 1;
          coinButton.color = "white"; // Change color on hover
        });
        coinButton.onPointerOutObservable.add(() => {
          if (coin.isActive)
            return;
          coinButton.thickness = 0;
          coinButton.color = "black"; // Change color back on hover out
        });
        coinButton.onPointerClickObservable.add(() => {
          coin.isActive = !coin.isActive;
          if (coin.isActive) {
            coinsButtonTab.forEach(otherCoin => {
              if (otherCoin.isActive && otherCoin !== coin) {
                otherCoin.isActive = false;
                otherCoin.coinButton.thickness = 0;
                otherCoin.coinButton.color = "black";
              }
            });
          }
        });

        coinButton.isVisible = false; // Initially hidden
        ui.addControl(coinButton);
        return coin;
      }

      coinsButtonTab.push(createCoinButton(5, "green", new Vector2(-110, -140)));
      coinsButtonTab.push(createCoinButton(10, "blue", new Vector2(-65, -190)));
      coinsButtonTab.push(createCoinButton(20, "yellow", new Vector2(0, -205)));
      coinsButtonTab.push(createCoinButton(50, "orange", new Vector2(65, -190)));
      coinsButtonTab.push(createCoinButton(100, "red", new Vector2(110, -140)));

      // Create area of selectable place for coins
      type SelectableArea = {
        selectBox: Rectangle;
        buttonCleanBet: Button | null;
        textBet: TextBlock | null;
        bet: number;
        currentCoin: AbstractMesh[];
      }

      // transparent Mat
      const MatCoinTransparent = new StandardMaterial("MatCoinTransparent", scene);
      MatCoinTransparent.diffuseColor = Color3.White();
      MatCoinTransparent.alpha = 0;

      const selectableAreas: SelectableArea[] = [];

      function createSelectableArea(position: Vector2, index: number): SelectableArea {
        const selectBox = new Rectangle("selectBox");
        selectBox.left = position.x;
        selectBox.top = position.y;
        selectBox.width = "130px";
        selectBox.height = "120px";
        selectBox.thickness = 0;
        //selectBox.background = "transparent";
         selectBox.background = "black";
         selectBox.alpha = 0.5;
        selectBox.isVisible = false;
        const selectableArea: SelectableArea = {
          selectBox,
          buttonCleanBet: null,
          textBet: null,
          bet: 0,
          currentCoin: []
        };
        selectableArea.currentCoin = createCoinMesh(MatCoinTransparent, placesTab[index].positionCoins, (meshes) => {
          selectableArea.currentCoin = meshes;
        });
        // Create a button to clean the bet for this place
        const buttonCleanBetPlace = Button.CreateSimpleButton(`cleanBetPlace${index}`, "❌​​");
        buttonCleanBetPlace.horizontalAlignment = Button.HORIZONTAL_ALIGNMENT_RIGHT;
        buttonCleanBetPlace.verticalAlignment = Button.VERTICAL_ALIGNMENT_TOP;
        buttonCleanBetPlace.width = "35px";
        buttonCleanBetPlace.height = "35px";
        buttonCleanBetPlace.cornerRadius = 20;
        buttonCleanBetPlace.thickness = 0;
        buttonCleanBetPlace.background = "transparent";
        buttonCleanBetPlace.isVisible = false; // Initially hidden
        buttonCleanBetPlace.onPointerEnterObservable.add(() => {
          buttonCleanBetPlace.textBlock!.text = "✖️";
          buttonCleanBetPlace.background = "black"; // Change background on hover
        });
        buttonCleanBetPlace.onPointerOutObservable.add(() => {
          buttonCleanBetPlace.textBlock!.text = "❌​";
          buttonCleanBetPlace.background = "transparent"; // Change background back on hover out
        });
        buttonCleanBetPlace.onPointerClickObservable.add(() => {
          selectableArea.currentCoin.forEach(coin => coin.material = MatCoinTransparent); // Hide the coin mesh
          totalBetAmount -= selectableArea.bet; // Subtract bet amount from total bet
          labelTotalBet.text = `Total Bet: ${totalBetAmount} €`;
          selectableArea.bet = 0; // Reset bet amount for this area
          buttonCleanBetPlace.isVisible = false; // Hide the clean bet button
          selectableArea.textBet!.isVisible = false; // Show the bet text
        });
        selectableArea.buttonCleanBet = buttonCleanBetPlace;
        // Bet Text block
        const textBet = new TextBlock(`textBetPlace${index}`, selectableArea.bet.toString());
        textBet.textVerticalAlignment = TextBlock.VERTICAL_ALIGNMENT_BOTTOM;
        textBet.top = -50;
        textBet.color = "white";
        textBet.fontSize = 16;
        textBet.isVisible = false; // Initially hidden
        selectableArea.textBet = textBet;
        selectableArea.selectBox.addControl(textBet);
        selectableArea.selectBox.addControl(buttonCleanBetPlace);
        selectBox.onPointerClickObservable.add(() => {
          let currentValue = 0;
          coinsButtonTab.forEach(coin => {
            if (coin.isActive)
              currentValue = coin.value; // Get the value of the selected coin
          });
          if (currentValue === 0)
            return;
          if (totalBetAmount + currentValue > bankAmount)
            return;
          if (selectableArea.bet == 0) {
            selectableArea.buttonCleanBet!.isVisible = true; // Show the clean bet button
            selectableArea.textBet!.isVisible = true; // Show the bet text
          }
          selectableArea.bet += currentValue; // Add bet amount
          let matIndex = 0;
          if (selectableArea.bet >= 100) matIndex = 4;
          else if (selectableArea.bet >= 50) matIndex = 3;
          else if (selectableArea.bet >= 20) matIndex = 2;
          else if (selectableArea.bet >= 10) matIndex = 1;
          selectableArea.currentCoin.forEach(coin => coin.material = MatCoinTab[matIndex]);
          selectableArea.textBet!.text = selectableArea.bet.toString(); // Update bet text
          // Add bet to total bet amount
          totalBetAmount += currentValue;
          labelTotalBet.text = `Total Bet: ${totalBetAmount} €`;
          return;
        });
        ui.addControl(selectableArea.selectBox);
        return selectableArea;
      }

      selectableAreas.push(createSelectableArea(new Vector2(-837, -210), 0));
      selectableAreas.push(createSelectableArea(new Vector2(-560, 70), 1));
      selectableAreas.push(createSelectableArea(new Vector2(0, 185), 2));
      selectableAreas.push(createSelectableArea(new Vector2(560, 70), 3));
      selectableAreas.push(createSelectableArea(new Vector2(837, -210), 4));

      // Bet Button
      const buttonBet = Button.CreateSimpleButton("betButton", "BET");
      buttonBet.verticalAlignment = Button.VERTICAL_ALIGNMENT_BOTTOM;
      buttonBet.top = -20;
      buttonBet.width = "170px";
      buttonBet.height = "170px";
      buttonBet.fontSize = 40;
      buttonBet.color = "grey";
      buttonBet.cornerRadius = 85;
      buttonBet.thickness = 0;
      buttonBet.background = "black";
      buttonBet.onPointerEnterObservable.add(() => {
        buttonBet.thickness = 0.5; // Change thickness on hover
        buttonBet.color = "white"; // Change color on hover
      });
      buttonBet.onPointerOutObservable.add(() => {
        buttonBet.thickness = 0; // Change thickness back on hover out
        buttonBet.color = "grey"; // Change color back on hover out
      });
      buttonBet.onPointerClickObservable.add(() => {
        // Handle play bet button click
        console.log("Play Bet clicked");
      });
      buttonBet.isVisible = false; // Initially hidden
      ui.addControl(buttonBet);

      return {
        buttonPlay,
        labelBank,
        labelTotalBet,
        buttonHelp,
        buttonQuit,
        buttonVolume,
        buttonBet,
        coinsButtonTab,
        selectableAreas
      }
    }

    const {buttonPlay, labelBank, labelTotalBet, buttonHelp, buttonQuit, buttonVolume, buttonBet, coinsButtonTab, selectableAreas } = createGUI();
    // Start loading all previously registered asset tasks (table + any coin tasks added by createSelectableArea)
    // This must be called after createGUI so that createCoinMesh tasks are registered on assetsManager before loading.
    assetsManager.load();

    let cinematicEndUp = false;
    let cinematicElapsedTime = 0;
    // const cinematicDuration = 3000; // Durée de la cinématique en ms
    const cinematicDuration = 1; // Durée de la cinématique en ms
    const initCameraBeta = camera.beta;
    const initCameraRadius = camera.radius;
    const initFontParticlesMinEmitPower = fontParticles.minEmitPower;
    const initFontParticlesMaxEmitPower = fontParticles.maxEmitPower;

    scene.onBeforeRenderObservable.add(() => {
      const deltaTime = engine.getDeltaTime(); // en millisecondes

      if (buttonPlay.isVisible)
        return;
      
      // Cinematic
      if (!cinematicEndUp) {
        cinematicElapsedTime += deltaTime;
        const t = Math.min(cinematicElapsedTime / cinematicDuration, 1); // progression de 0 à 1
        // Camera
        camera.beta = initCameraBeta + t * -(Math.PI / 3.7); // Réduction de l'angle de la caméra
        camera.radius = initCameraRadius + t * -1.2; // Réduction de la distance de la caméra
        // Font particles
        fontParticles.minEmitPower = initFontParticlesMinEmitPower + t * -3;
        fontParticles.maxEmitPower = initFontParticlesMaxEmitPower + t * -3;
        // Reactors
        reactorLeft.position.x = -1.2 + t * 0.08; // Déplacement du réacteur gauche
        reactorRight.position.x = 1.2 + t * -0.08; // Déplacement du réacteur droit
        // Reactors particles
        rpLeft.minLifeTime = 1 + t * -1;
        rpLeft.maxLifeTime = 1 + t * -1;
        rpRight.minLifeTime = 1 + t * -1;
        rpRight.maxLifeTime = 1 + t * -1;
        if (cinematicElapsedTime >= cinematicDuration) {
          cinematicEndUp = true;
          rpLeft.stop();
          rpRight.stop();
          placesTab.forEach(place => {
            if (place.coinMesh)
              place.coinMesh.isVisible = true;
          });
          // Show GUI elements
          labelBank.isVisible = true;
          labelTotalBet.isVisible = true;
          buttonHelp.isVisible = true;
          buttonQuit.isVisible = true;
          buttonVolume.isVisible = true;
          buttonBet.isVisible = true;
          coinsButtonTab.forEach(coinsButton => coinsButton.coinButton.isVisible = true);
          selectableAreas.forEach(area => area.selectBox.isVisible = true);
        }
        return;
      }
    });

    // Start rendering the scene
    engine.runRenderLoop(() => {
      scene.render();
    });

    return () => {
      engine.dispose();
      scene.dispose();
    };
  }

  init();
  return container;
}
