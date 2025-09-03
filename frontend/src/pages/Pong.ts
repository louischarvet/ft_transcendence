// Pong.ts
import Victor from "victor";
import Path from "./usePath";

export default function GameCanvas(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'flex justify-center items-center h-screen bg-gray-900';

  const canvas = document.createElement('canvas');
  canvas.className = 'block fixed top-0 left-0 w-full h-full';
  container.appendChild(canvas);

  const keys: Record<string, boolean> = {};

  function init() {
    const ctx = canvas.getContext("2d")!;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.style.width = "100vw";
      canvas.style.height = "100vh";
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

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

    // Dimensions du jeu
    const width = canvas.width;
    const height = canvas.height;

    let lastTime = 0;

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

    const ball: Ball = {
      position: new Victor(width / 2, height / 2 + 8),
      speed: new Victor(0, 0),
      radius: height / 43 / 2, // 21 spawning balls
    };
    const paddleLeft: Paddle = {
      position: new Victor(ball.radius * 1.5, height / 2 - ball.radius * 6),
      width: ball.radius * 1.5,
      height: ball.radius * 12,
      speed: 0,
    };
    const paddleRight: Paddle = {
      position: new Victor(width - ball.radius * 3, height / 2 - ball.radius * 6),
      width: ball.radius * 1.5,
      height: ball.radius * 12,
      speed: 0,
    };

    // balls spawn position
    let ballsSpawn: number[] = [];
    for (let i = ball.radius * 3; i < height; i += ball.radius * 4) {
      ballsSpawn.push(i);
    }

    // Score
    let LeftScore = 0;
    let RightScore = 0;

    function draw() {
      // fond noir
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, width, height);

      // middle font balls
      ctx.fillStyle = "grey";
      ctx.beginPath();
      for (let i of ballsSpawn) {
        ctx.arc(width / 2, i, ball.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "white";
      // score
      ctx.font = `${ball.radius * 15}px 'Consolas'`;
      ctx.textAlign = "center";
      ctx.fillText(`${LeftScore}`, width / 4, ball.radius * 15);
      ctx.fillText(`${RightScore}`, (width * 3) / 4, ball.radius * 15);

      // balle
      ctx.beginPath();
      ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();

      // raquettes
      ctx.fillRect(
        paddleLeft.position.x,
        paddleLeft.position.y,
        paddleLeft.width,
        paddleLeft.height
      );
      ctx.fillRect(
        paddleRight.position.x,
        paddleRight.position.y,
        paddleRight.width,
        paddleRight.height
      );
    }

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
      console.log(`Ball({${path.position.toString()}}, {${path.speed.toString()}})`);
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
        console.log(`collision stuck`)
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
      console.log(collisionKey);
      return newPath;
    }

    // fonction pour générer un entier aléatoire entre min et max
    function getRandomInt(min: number, max: number): number {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const speed = 1.5;

    // calcule les vecteurs de la balle
    function defineBallVectors() {
      const signX = Math.sign(ball.speed.x || Math.random() * 2 - 1); // si vx est 0, on choisit aléatoirement la direction
      const signAngle = Math.sign(Math.random() * 2 - 1);

      ball.speed.y = 0;
      ball.speed.x = speed * signX;
      ball.speed.rotateDeg((Math.random() * 40 + 10) * signAngle);
    }

    function move(deltaTime: number) {
      paddleLeft.speed = 0;
      if (keys["KeyW"]) paddleLeft.speed -= speed;
      if (keys["KeyS"]) paddleLeft.speed += speed;

      paddleRight.speed = 0;
      if (keys["ArrowUp"]) paddleRight.speed -= speed;
      if (keys["ArrowDown"]) paddleRight.speed += speed;


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

    function update(currentTime: number) {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      move(deltaTime);

      // reset ball if out of bounds
      if (ball.position.x - ball.radius < 0 || ball.position.x + ball.radius > width) {
        if (ball.position.x - ball.radius < 0)
          RightScore++;
        else
          LeftScore++;
        ball.position.x = width / 2, ball.position.y = ballsSpawn[getRandomInt(0, ballsSpawn.length - 1)];
        defineBallVectors();
      }

      draw();
      requestAnimationFrame(update);
    }

    defineBallVectors();
    requestAnimationFrame(update);

    const cleanup = () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };

    cleanup();
  }

  init();
  return container;
}
