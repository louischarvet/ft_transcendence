import { Engine, Scene, FreeCamera,
  Vector3, Color3, GlowLayer,
  StandardMaterial, MeshBuilder,
  ParticleSystem, Texture
} from "@babylonjs/core";
import Victor from "victor";
import Path from "../tools/games/PgPath";
import { AdvancedDynamicTexture, Button, InputText, TextBlock } from "@babylonjs/gui";

export default function Pong3D(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'flex justify-center items-center h-screen bg-gray-900';

  const canvas = document.createElement('canvas');
  canvas.className = 'block fixed w-full h-full';

  let width = window.innerWidth;
  let height = window.innerHeight;
  const resizeCanvas = () => {
    if (window.innerHeight / window.innerWidth > 0.5) {
      canvas.width = window.innerWidth;
      canvas.height = canvas.width * 0.5;
    } else {
      canvas.height = window.innerHeight;
      canvas.width = canvas.height / 0.5;
    }
    width = canvas.width;
    height = canvas.height;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  };
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  container.appendChild(canvas);

  
  function init() {
    const keys: Record<string, boolean> = {};
    
    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
    };
    const handleBlur = () => {
      Object.keys(keys).forEach(key => keys[key] = false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    // Dimensions du terrain
    const width = 30;
    const height = 20;

    // Vitesse globale
    const speed = 0.02;

    // Score
    let LeftScore = 0;
    let RightScore = 0;

    // Éléments du jeu
    type Ball = {
      position: Victor;
      speed: Victor;
      radius: number;
    };
    type Paddle = {
      position: Victor;
      width: number;
      height: number;
	    speed: number;
    };

    // calcule les vecteurs de la balle
    function defineBallVectors(ball: Ball) {
      const signX = Math.sign(ball.speed.x || Math.random() * 2 - 1); // si vx est 0, on choisit aléatoirement la direction
      const signAngle = Math.sign(Math.random() * 2 - 1);

      ball.speed.y = 0;
      ball.speed.x = speed * signX;
      ball.speed.rotateDeg((Math.random() * 40 + 10) * signAngle);
    }

    // Initialisation de la balle et des raquettes
    function initializeGameElements() {
      const ballRadius = height / 43 / 2; // 21 spawning balls
      // Init paddles
      const paddleLeft: Paddle = {
        position: new Victor(ballRadius * 1.5, height / 2 - ballRadius * 6),
        width: ballRadius * 1.5,
        height: ballRadius * 12,
        speed: 0,
      };
      const paddleRight: Paddle = {
        position: new Victor(width - ballRadius * 3, height / 2 - ballRadius * 6),
        width: ballRadius * 1.5,
        height: ballRadius * 12,
        speed: 0,
      };
      // Init ball
      const ball: Ball = {
        radius: ballRadius,
        position: new Victor(0, 0),
        speed: new Victor(0, 0),
      };
      defineBallVectors(ball);
      if (ball.speed.x < 0) {
        ball.position.x = width - paddleRight.width - ball.radius;
        ball.position.y = paddleRight.position.y + paddleRight.height / 2;
      } else {
        ball.position.x = ball.radius + paddleLeft.width;
        ball.position.y = paddleLeft.position.y + paddleLeft.height / 2;
      }

      return { ball, paddleLeft, paddleRight };
    }

    // Déplace les éléments du jeu et gère les collisions
    function move(deltaTime: number) {
      paddleLeft.speed = 0;
      if (keys["KeyW"]) paddleLeft.speed += speed;
      if (keys["KeyS"]) paddleLeft.speed -= speed;

      paddleRight.speed = 0;
      if (keys["ArrowUp"]) paddleRight.speed += speed;
      if (keys["ArrowDown"]) paddleRight.speed -= speed;

      const paddleLeftPath = new Path(
        paddleLeft.position.clone(),
        new Victor(0, paddleLeft.speed),
        deltaTime
      );
      const paddleRightPath = new Path(
        paddleRight.position.clone(),
        new Victor(0, paddleRight.speed),
        deltaTime
      );

      function paddleCollision(
        path: Path,
        paddleHeight: number,
        terrainUpperBound: number,
        terrainLowerBound: number
      ): Path {
        // moving up (negative y)
        if (
          path.speed.y < 0 &&
          path.speed.y * path.deltaTime < terrainUpperBound - path.position.y
        )
          return new Path(new Victor(path.position.x, terrainUpperBound));
        // moving down (positive y)
        else if (
          path.speed.y > 0 &&
          path.speed.y * path.deltaTime >
            terrainLowerBound - (path.position.y + paddleHeight)
        )
          return new Path(
            new Victor(path.position.x, terrainLowerBound - paddleHeight)
          );
        // no collision
        else
          return new Path(
            new Victor(
              path.position.x,
              path.position.y + path.speed.y * path.deltaTime
            )
          );
      }

      function ballCollision(
        path: Path,
        ballRadius: number,
        terrainUpperBound: number,
        terrainLowerBound: number,
        paddleLeft: Paddle,
        paddleRight: Paddle
      ): Path {
        const trajectory = path.speed.clone().multiplyScalar(path.deltaTime);
        const validTrajectoryPortions: { [key: string]: number } = {};

        // Find all the possible collisions

        // Terrain
        const distUpperBound = terrainUpperBound - (path.position.y - ballRadius);
        const distLowerBound = terrainLowerBound - (path.position.y + ballRadius);
        const portionUpperBound = distUpperBound / trajectory.y;
        const portionLowerBound = distLowerBound / trajectory.y;
        if (path.speed.y < 0 && portionUpperBound >= 0 && portionUpperBound <= 1)
          validTrajectoryPortions["terrainUpperBound"] = portionUpperBound;
        else if (
          path.speed.y > 0 &&
          portionLowerBound >= 0 &&
          portionLowerBound <= 1
        )
          validTrajectoryPortions["terrainLowerBound"] = portionLowerBound;

        // Paddles
        const distLeftPaddle =
          paddleLeft.position.x +
          paddleLeft.width -
          (path.position.x - ballRadius);
        const distRightPaddle =
          paddleRight.position.x - (path.position.x + ballRadius);
        const portionLeftPaddle = distLeftPaddle / trajectory.x;
        const portionRightPaddle = distRightPaddle / trajectory.x;
        if (
          path.speed.x < 0 &&
          portionLeftPaddle >= 0 &&
          portionLeftPaddle <= 1
        ) {
          // vertical bounds
          const yCollision = path.position.y + trajectory.y * portionLeftPaddle;
          if (
            yCollision >= paddleLeft.position.y &&
            yCollision <= paddleLeft.position.y + paddleLeft.height
          )
            validTrajectoryPortions["paddleLeft"] = portionLeftPaddle;
        } else if (
          path.speed.x > 0 &&
          portionRightPaddle >= 0 &&
          portionRightPaddle <= 1
        ) {
          // vertical bounds
          const yCollision = path.position.y + trajectory.y * portionRightPaddle;
          if (
            yCollision >= paddleRight.position.y &&
            yCollision <= paddleRight.position.y + paddleRight.height
          )
            validTrajectoryPortions["paddleRight"] = portionRightPaddle;
        }

        // Find the smalles delta
        let collisionKey: string | null = null;
        let minimumPortion = 1;

        for (const key in validTrajectoryPortions) {
          if (validTrajectoryPortions[key] < minimumPortion) {
            minimumPortion = validTrajectoryPortions[key];
            collisionKey = key;
          }
        }

        if (collisionKey === null) return new Path(path).move();

        // if (collisionMagnitude === 0) return new Path(path.position.clone()); //! POTENTIALLY WRONG
        if (minimumPortion === 0) {
          const newPath = new Path(path);
          newPath.deltaTime = 0;
          return newPath;
        } //! POTENTIALLY WRONG

        const newPath = new Path(path).move(
          validTrajectoryPortions[collisionKey]
        );
        if (newPath.deltaTime < 1e-6) {
          newPath.deltaTime = 0;
        }
        switch (collisionKey) {
          case "terrainUpperBound":
          case "terrainLowerBound":
            // newPath.speed.invertY();
            newPath.speed.y = -newPath.speed.y;
            break;
          case "paddleLeft":
          case "paddleRight":
            // newPath.speed.invertX();
            newPath.speed.x = -newPath.speed.x;
            break;
          default:
        }
        return newPath;
      }

      paddleLeftPath.extend(paddleCollision, paddleLeft.height, 0, height);
      paddleLeft.position.copy(paddleLeftPath.last().position);
      paddleRightPath.extend(paddleCollision, paddleRight.height, 0, height);
      paddleRight.position.copy(paddleRightPath.last().position);

      const ballPath = new Path(
        ball.position.clone(),
        ball.speed.clone(),
        deltaTime
      );
      ballPath.extend(
        ballCollision,
        ball.radius,
        0,
        height,
        paddleLeft,
        paddleRight
      );
      ball.position.copy(ballPath.last().position);
      ball.speed.copy(ballPath.last().speed);
    }
    
    const { ball, paddleLeft, paddleRight } = initializeGameElements();
    
    // Offset positions to match the 3D scene
    const ballOffset = new Vector3(-width / 2, 0.5, -height / 2);
    const paddleOffset = new Vector3(-width / 2 + paddleLeft.width / 2, 0.5, -height / 2 + paddleLeft.height / 2);

    // Position de l'emitter du fond
    const fontEmitterPosition = new Vector3(0, -25, 0);
    // Camera position and target
    const cinematicPosition = new Vector3(0, -20, 0);
    const cinematicTarget = new Vector3(0, -25, 0);
    // vue de dessus (local)
    const cameraPositionTop = new Vector3(0, 28, 0);
    const cameraTargetTop = new Vector3(0, 0, 0);
    const cameraRotationTop = new Vector3(Math.PI * 2, Math.PI * 2, 0);
    // // vue de côté (remote)
    // const cameraPositionSide = new Vector3(width / 1.3, 15, 0);
    // const cameraTargetSide = new Vector3(0, -5, 0);
    // vue de face (watch)
    // const cameraPositionFront = new Vector3(0, 20, 15);
    // const cameraTargetFront = new Vector3(0, 0, 2);

    // Création de la scène Babylon.js
    function createScene() {
      // Initialisation de la scène
      const engine = new Engine(canvas, true);
      const scene = new Scene(engine);
      scene.clearColor = new Color3(0.035, 0.02, 0.05).toColor4(); // Couleur de fond

      // Camera
      const camera = new FreeCamera("camera", cinematicPosition, scene);
      camera.setTarget(cinematicTarget);
      camera.rotation = cameraRotationTop;

      // Bouger la caméra
      // camera.attachControl(canvas, true);

      // Lumière
      // new HemisphericLight("light", new Vector3(0, 1, 0), scene);

      // Glow layer
      const gl = new GlowLayer("glow", scene);
      gl.intensity = 2;

      // Score
      // const score = new TextBlock("score");
      // score.fontSize = 72;
      // score.fontFamily = "Consolas";
      // score.color = "purple";
      // score.shadowColor = "indigo";
      // score.shadowOffsetX = 4;
      // score.shadowOffsetY = 4;
      // score.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
      // score.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
      // score.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
      // score.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
      // const guiTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
      // guiTexture.addControl(score);

      // Bords
      const boundColor = new Color3(0.2, 0.2, 0.2);
      const boundMat = new StandardMaterial("boundMat", scene);
      boundMat.diffuseColor = boundColor;
      boundMat.emissiveColor = boundColor;

      const boundUp = MeshBuilder.CreateBox("boundUp", {
        height: 0.2, width: width - 2, depth: 0.2
      }, scene);
      boundUp.material = boundMat;
      boundUp.position.set(0, 0.5, -height / 2);

      const boundDown = MeshBuilder.CreateBox("boundDown", {
        height: 0.2, width: width - 2, depth: 0.2
      }, scene);
      boundDown.material = boundMat;
      boundDown.position.set(0, 0.5, height / 2);

      // Raquettes
      const paddleColor = new Color3(0.35, 0, 0.5);
      const paddleMat = new StandardMaterial("paddleMat", scene);
      paddleMat.diffuseColor = paddleColor;
      paddleMat.emissiveColor = paddleColor;

      const paddleLeft3D = MeshBuilder.CreateBox("paddleLeft3D", {
        height: paddleLeft.width, width: 0.3, depth: paddleLeft.height
      }, scene);
      paddleLeft3D.material = paddleMat;
      paddleLeft3D.position.copyFrom(new Vector3(paddleLeft.position.x, 0, paddleLeft.position.y).addInPlace(paddleOffset));

      const paddleRight3D = MeshBuilder.CreateBox("paddleRight3D", {
        height: paddleRight.width, width: 0.3, depth: paddleRight.height
      }, scene);
      paddleRight3D.material = paddleMat;
      paddleRight3D.position.copyFrom(new Vector3(paddleRight.position.x, 0, paddleRight.position.y).addInPlace(paddleOffset));

      // Balle
      const ballColor = new Color3(0, 0.8, 0);
      const ball3D = MeshBuilder.CreateSphere("ball3D", { diameter: ball.radius * 2 }, scene);
      const ballMat = new StandardMaterial("ballMat", scene);
      ballMat.diffuseColor = ballColor;
      ballMat.emissiveColor = ballColor;
      ball3D.material = ballMat;
      // ball3D.position.copyFrom(new Vector3(ball.position.x, 0, ball.position.y).addInPlace(ballOffset));
      ball3D.position.set(width, 0.5, height); // Out of view

      // urlTexture
      const urlTexture = "https://playground.babylonjs.com/textures/flare.png";

      // Particules pour la balle
      const ballParticules = new ParticleSystem("ballParticles", 500, scene);
      ballParticules.particleTexture = new Texture(urlTexture, scene);
      ballParticules.emitter = ball3D;
      ballParticules.minEmitBox = new Vector3(0, 0, 0);
      ballParticules.maxEmitBox = new Vector3(0, 0, 0);
      ballParticules.color1 = ballColor.toColor4(1);
      ballParticules.minLifeTime = speed * 10;
      ballParticules.maxLifeTime = speed * 10;
      ballParticules.emitRate = 500;
      ballParticules.addSizeGradient(0, ball.radius * 4);
      ballParticules.addSizeGradient(1, ball.radius * 2);
      ballParticules.start();

      // Particules pour le font
      const fontParticles = new ParticleSystem("fontParticles",5000, scene);
      fontParticles.particleTexture = new Texture(urlTexture, scene);
      fontParticles.emitter = fontEmitterPosition;
      fontParticles.minEmitBox = new Vector3(0, 0, 0);
      fontParticles.maxEmitBox = new Vector3(0, 0, 0);
      fontParticles.minEmitPower = speed * 200;
      fontParticles.maxEmitPower = speed * 500;
      fontParticles.direction1 = new Vector3(-1, 1, -1);
      fontParticles.direction2 = new Vector3(1, 1, 1);
      fontParticles.color1 = paddleColor.toColor4(1);
      fontParticles.addColorGradient(0, Color3.Black().toColor4());
      fontParticles.addColorGradient(0.2, new Color3(0.7, 0, 1).toColor4(), Color3.White().toColor4());
      fontParticles.minSize = 0.03;
      fontParticles.maxSize = 0.03;
      fontParticles.minLifeTime = 10;
      fontParticles.maxLifeTime = 10;
      fontParticles.emitRate = 300;
      fontParticles.start();

      // Particules pour les collisions
      const collisionParticles = new ParticleSystem("collisionParticles",3000, scene);
      collisionParticles.particleTexture = new Texture(urlTexture, scene);
      collisionParticles.emitter = ball3D;
      collisionParticles.minEmitBox = new Vector3(0, 0, 0);
      collisionParticles.maxEmitBox = new Vector3(0, 0, 0);
      collisionParticles.minEmitPower = speed * 400;
      collisionParticles.maxEmitPower = speed * 1000;
      collisionParticles.color1 = ballColor.toColor4();
      // collisionParticles.colorDead = new Color3(0, 0, 0).toColor4();
      collisionParticles.minSize = 0.1;
      collisionParticles.maxSize = 0.1;
      collisionParticles.minLifeTime = speed * 50;
      collisionParticles.maxLifeTime = speed * 100;
      collisionParticles.manualEmitCount = 0;
      collisionParticles.disposeOnStop = false;
      collisionParticles.start();

      return {
        engine,
        scene,
        camera,
        ball3D,
        paddleLeft3D,
        paddleRight3D,
        fontParticles,
        collisionParticles
      };
    }

    const { engine, scene, camera, ball3D, paddleLeft3D, paddleRight3D, fontParticles, collisionParticles } = createScene();

    // Gui
    const ui = AdvancedDynamicTexture.CreateFullscreenUI("UI");

    function initGui() {
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
        buttonPlay.isVisible = false; // Hide the button
      });
      ui.addControl(buttonPlay);

      return {
        buttonPlay
      };
    }

    const { buttonPlay } = initGui();

    function triggerCollisionEffect(direction: Vector3) {
      collisionParticles.direction1 = new Vector3(-1, 1, -1);
      collisionParticles.direction2 = new Vector3(1, -1, 1);
      collisionParticles.direction1.addInPlace(direction);
      collisionParticles.direction2.addInPlace(direction);
      collisionParticles.manualEmitCount = 100; // nombre de particules par collision
      collisionParticles.start();
    }

    let cinematicEndUp = false;
    let cinematicElapsedTime = 0;
    const cinematicDuration = 3000; // Durée de la cinématique en ms

    const initFontParticlesMinSize = fontParticles.minSize;
    const initFontParticlesMaxSize = fontParticles.maxSize;

    let gameStarted = false;
    let gameStartTime = 2000;

    scene.onBeforeRenderObservable.add(() => {
      const deltaTime = engine.getDeltaTime(); // en millisecondes

      // Cinematic
      if (buttonPlay.isVisible)
        return; // If the button is visible, skip all
      if (!cinematicEndUp) {
        cinematicElapsedTime += deltaTime;
        const t = Math.min(cinematicElapsedTime / cinematicDuration, 1); // progression de 0 à 1
        camera.position.copyFrom(Vector3.Lerp(camera.position, cameraPositionTop, t / 20));
        camera.setTarget(Vector3.Lerp(camera.getTarget(), cameraTargetTop, t / 20));
        fontParticles.minSize = initFontParticlesMinSize + t * 0.1;
        fontParticles.maxSize = initFontParticlesMaxSize + t * 0.1;
        if (cinematicElapsedTime >= cinematicDuration) {
          cinematicEndUp = true;
          // fontParticles.color1 = new Color3(0, 0, 0).toColor4();
          // fontParticles.color2 = new Color3(0, 0, 0).toColor4();
          // fontParticles.colorDead = new Color3(0.7, 0, 1).toColor4();
        }
        return;
      } else if (!gameStarted) { //! must add a gui count from 3 to 0
        gameStartTime -= deltaTime;
        if (gameStartTime <= 0) {
          gameStarted = true;
          // camera.rotation = cameraRotationTop; // reset camera rotation
          ball3D.position.copyFrom(new Vector3(ball.position.x, 0, ball.position.y).addInPlace(ballOffset));
        }
        return;
      }
      // Update positions with collisions
      const tmpBallSpeed = ball.speed.clone();
      move(deltaTime);

      // Trigger collision effect if ball speed changed
      if (Math.sign(tmpBallSpeed.x) != Math.sign(ball.speed.x) || Math.sign(tmpBallSpeed.y) != Math.sign(ball.speed.y))
        triggerCollisionEffect(new Vector3(tmpBallSpeed.x * 100, 0, tmpBallSpeed.y * 100));

      // reset ball (at winner's paddle) if out of bounds || In Back-Side ?
      if (ball.position.x - ball.radius < -width / 2 || ball.position.x + ball.radius > width * 1.5) {
        if (ball.position.x - ball.radius < 0) {
          RightScore++;
          ball.position.x = width - paddleRight.width - ball.radius;
          ball.position.y = paddleRight.position.y + paddleRight.height / 2;
        } else {
          LeftScore++;
          ball.position.x = ball.radius + paddleLeft.width;
          ball.position.y = paddleLeft.position.y + paddleLeft.height / 2;
        }
        defineBallVectors(ball);
      }

      // Update text score
      // score.text = `${LeftScore}   ${RightScore}`;

      // Update positions
      ball3D.position.copyFrom(new Vector3(ball.position.x, 0, ball.position.y).addInPlace(ballOffset));
      paddleLeft3D.position.copyFrom(new Vector3(paddleLeft.position.x, 0, paddleLeft.position.y).addInPlace(paddleOffset));
      paddleRight3D.position.copyFrom(new Vector3(paddleRight.position.x, 0, paddleRight.position.y).addInPlace(paddleOffset));
    });

    engine.runRenderLoop(() => {
      scene.render();
    });

    const resize = () => engine.resize();
    window.addEventListener("resize", resize);
    
    const cleanup = () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };

    // return cleanup;
  }

  init();
  return container;
};