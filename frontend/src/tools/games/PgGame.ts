// import Path from "./PgPath";
import Victor from "victor";

export default class PgGame {

  width = 30;
  height = 20;

  gameMode: string | null = null;

  fps = 1000/60;

  keys: { [key: string]: boolean };

  sceneFunctions: any;
  aiMode: "restless" | "normal" | "smart" = "normal";

  leftScore = 0;
  rightScore = 0;

  started: boolean = false;

  paused: boolean = false;

  speed = 0.2;
  speedInertiaTransfert = this.speed / 40;
  currentSpeed = this.speed;

  collidedDirection?: Victor;

  ball = {
    position: new Victor(15, 10),
    direction: new Victor(0, 0),
    radius: 0.25
  };

  paddleLeft = {
    position: new Victor(0.3, 8.5),
    speedInertia: 0,
    width: 0.3,
    height: 3
  };

  paddleRight = {
    position: new Victor(29.25, 8.5),
    speedInertia: 0,
    width: 0.3,
    height: 3
  };

  frontAddedObjects: { [obj: string]: {
    position: Victor,
    width: number,
    height: number
  }} = {};

  constructor(keys: { [key: string]: boolean }, sceneFunctions: any, frontAddedObjects: any = {}) {
    this.keys = keys;
    this.sceneFunctions = sceneFunctions;
    this.frontAddedObjects = frontAddedObjects; // tqt

    this.initBallDirection();
  }

  private initBallDirection() {
    const signX = Math.sign(this.ball.direction.x || Math.random() * 2 - 1); // si vx est 0, on choisit aléatoirement la direction
    const signAngle = Math.sign(Math.random() * 2 - 1);

    this.ball.direction.y = 0;
    this.ball.direction.x = signX;
    this.ball.direction.rotateDeg((Math.random() * 40 + 10) * signAngle).normalize();
  }

  private delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  async start(gameMode: string) {
    let timer = 0;
    this.reset();
    this.gameMode = gameMode;
    this.started = true;

    while (this.started) {
      while (this.paused) await this.delay(this.fps);
      this.sceneFunctions.update({
        ball: this.ball.position.clone(),
        paddleLeft: this.paddleLeft.position.clone(),
        paddleRight: this.paddleRight.position.clone()
      }, this.currentSpeed,{
        left: this.leftScore,
        right: this.rightScore
      }, this.collidedDirection?.clone());
      this.gameLoop(timer);
      await this.delay(this.fps);
      timer += this.fps;
    }
    this.sceneFunctions.showResult(this.leftScore, this.rightScore);
    this.reset();
  }

  pause() {
    this.paused = true;
  }

  restart() {
    this.reset();
    if (this.gameMode) {
      this.start(this.gameMode);
      return this.gameMode;
    }
    return "";
  }

  resume() {
    this.paused = false;
  }

  private async gameLoop(timer: number) {

    // Move IA every 1000ms
    if (timer % 1000 < this.fps) {
      if (this.gameMode === "vsAI" || this.gameMode === "watchAI") {
        this.aiMovement("Right", this.currentSpeed, this.ball, new Victor(this.paddleRight.position.x + (this.paddleRight.width / 2), this.paddleRight.position.y + (this.paddleRight.height / 2)), this.aiMode);
      }
      if (this.gameMode === "watchAI") {
        this.aiMovement("Left", this.currentSpeed, this.ball, new Victor(this.paddleLeft.position.x + (this.paddleLeft.width / 2), this.paddleLeft.position.y + (this.paddleLeft.height / 2)), "restless");
      }
    }

    // Move paddles
    this.paddlesMovement();

    // Move ball
    this.ball.position.add(this.ball.direction.clone().multiplyScalar(this.currentSpeed));

    this.collidedDirection = undefined;
    this.handleCollision(this.paddleLeft, this.paddleLeft.speedInertia);
    this.handleCollision(this.paddleRight, this.paddleRight.speedInertia);
    for (const objKey in this.frontAddedObjects) {
      if (this.handleCollision(this.frontAddedObjects[objKey]))
        break;
    }

    // reset this.ball (at winner's paddle) if out of bounds
    if (this.ball.position.x < -this.width / 2 || this.ball.position.x > this.width * 1.5) {
      if (this.ball.position.x < 0) {
        this.rightScore++;
        this.ball.position.x = this.width - this.paddleRight.width - this.ball.radius * 3;
        this.ball.position.y = this.paddleRight.position.y + this.paddleRight.height / 2;
      } else {
        this.leftScore++;
        this.ball.position.x = this.ball.radius * 3 + this.paddleLeft.width;
        this.ball.position.y = this.paddleLeft.position.y + this.paddleLeft.height / 2;
      }
      if (this.leftScore == 10 || this.rightScore == 10)
        this.started = false;
      // else if (this.againstAI && (this.leftScore - this.rightScore) >= 5)
      //   this.aiMode++;
      this.initBallDirection();
      this.currentSpeed = this.speed;
    }
  }

  private async aiMovement(side: "Left" | "Right", speed: number, ball: { position: Victor, direction: Victor }, paddlePos: Victor, mode: "restless" | "normal" | "smart") {
    if ((side == "Right" && ball.direction.x > 0 && ball.position.x < paddlePos.x) ||
      (side == "Left" && ball.direction.x < 0 && ball.position.x > paddlePos.x)) {
      let predictedY = ball.position.y + (paddlePos.x - ball.position.x) / ball.direction.x * ball.direction.y;

      if (mode === "smart") { // preshot the collision with edges
        if (predictedY < 0) {
          predictedY = -predictedY;
        } else if (predictedY > this.height) {
          predictedY = this.height - (predictedY - this.height);
        }
      }

      if (mode !== "restless" && Math.abs(predictedY - paddlePos.y) < 1.5) // don't move if close enough
        return;

      const distYBySpeed = (predictedY - paddlePos.y) / speed;
      for (let i = 0; i < Math.abs(distYBySpeed) && i < 60; i++) {
        if (distYBySpeed > 0) {
          this.keys[side + "AIUp"] = true;
          this.keys[side + "AIDown"] = false;
        } else {
          this.keys[side + "AIDown"] = true;
          this.keys[side + "AIUp"] = false;
        }
        while (this.paused) await this.delay(this.fps);
        await this.delay(this.fps);
      }
    } else if (mode === "restless") { // return to center
      this.aiMovement(side, speed, { position: new Victor(this.width / 2, this.height / 2), direction: new Victor(side === "Right" ? 1 : -1, 0) }, paddlePos, mode);
    }
    this.keys[side + "AIUp"] = false;
    this.keys[side + "AIDown"] = false;
  }

  private paddlesMovement() {
    if (this.gameMode === "watchAI") {
      this.handlePaddle("LeftAIUp", "LeftAIDown", this.paddleLeft);
    } else {
      this.handlePaddle("KeyW", "KeyS", this.paddleLeft);
    } if (this.gameMode !== "vsAI" && this.gameMode !== "watchAI") {
      this.handlePaddle("ArrowUp", "ArrowDown", this.paddleRight);
    } else {
      this.handlePaddle("RightAIUp", "RightAIDown", this.paddleRight);
    }
  }

  private handlePaddle(keyUp: string, keyDown: string, paddle: { position: Victor, speedInertia: number, width: number, height: number }) {
    if (this.keys[keyUp]) {
      paddle.position.y += this.currentSpeed;
      if (paddle.speedInertia < 0)
        paddle.speedInertia = 0;
      if (paddle.position.y + paddle.height > this.height)
        paddle.position.y = this.height - paddle.height;
      else
        paddle.speedInertia++;
    } else if (this.keys[keyDown]) {
      paddle.position.y -= this.currentSpeed;
      if (paddle.speedInertia > 0)
        paddle.speedInertia = 0;
      if (paddle.position.y < 0)
        paddle.position.y = 0;
      else
        paddle.speedInertia--;
    }
  }

  private handleCollision(obj: { position: Victor, width: number, height: number }, speedInertia: number = 0): boolean {
    const ballPreviousPos = this.ball.position.clone().subtract(this.ball.direction.clone().multiplyScalar(this.currentSpeed));
    const stepRatio = this.currentSpeed / (this.speed * 0.1);
    const ballVerticesTotal = 16; // 2^4
    const ballStepVerticesDegree = 360 / ballVerticesTotal;

    for (let step = 1; step <= stepRatio; step++) {
      const stepPos = ballPreviousPos.clone().add(this.ball.direction.clone().multiplyScalar(step * this.speed * 0.1));

      // check 16 vertices of the ball's bounding box
      let ballCollisionOffset = new Victor(0, 0);
      for (let i = 0; i < ballVerticesTotal; i++) {
        const angle = ballStepVerticesDegree * i;
        const offset = new Victor(Math.cos(angle), Math.sin(angle)).multiplyScalar(this.ball.radius);
        const vertex = stepPos.clone().add(offset);
        if (vertex.x > obj.position.x && vertex.x < obj.position.x + obj.width &&
          vertex.y > obj.position.y && vertex.y < obj.position.y + obj.height)
          ballCollisionOffset.add(offset);
      }
      if (ballCollisionOffset.x == 0 && ballCollisionOffset.y == 0)
        continue;

      // collision position found, return to previous position
      this.ball.position = stepPos.subtract(this.ball.direction.clone().multiplyScalar(this.speed * 0.1));
      step--;

      // reflect ball direction
      if (Math.abs(ballCollisionOffset.x) > Math.abs(ballCollisionOffset.y) &&
        (ballCollisionOffset.x > 0 && this.ball.direction.x > 0 ||
          ballCollisionOffset.x < 0 && this.ball.direction.x < 0)) {
        this.collidedDirection = this.ball.direction.clone();
        this.ball.direction.x *= -1;
        this.ball.direction.y += speedInertia * this.speedInertiaTransfert; // add some inertia to the ball direction
        this.ball.direction.normalize();
      } else if (Math.abs(ballCollisionOffset.y) > Math.abs(ballCollisionOffset.x) &&
        (ballCollisionOffset.y > 0 && this.ball.direction.y > 0 ||
          ballCollisionOffset.y < 0 && this.ball.direction.y < 0)) {
        this.collidedDirection = this.ball.direction.clone();
        this.ball.direction.y *= -1;
        this.ball.direction.x += speedInertia * this.speedInertiaTransfert; // add some inertia to the ball direction
        this.ball.direction.normalize();
      }

      // increase ball speed depending on speedInertia
      const speed = Math.abs(speedInertia) * this.speedInertiaTransfert;
      if (this.currentSpeed < speed)
        this.currentSpeed = speed;
      else if (this.currentSpeed - this.speedInertiaTransfert >= this.speed)
        this.currentSpeed -= this.speedInertiaTransfert;

      // move ball the remaining distance of the step
      this.ball.position.add(this.ball.direction.clone().multiplyScalar((stepRatio - step) * this.speed * 0.1));

      return true;
    }
    return false;
  }

  private reset() {
    // this.aiMode = 1;
    this.leftScore = 0;
    this.rightScore = 0;
    this.paddleLeft.position.y = 8.5;
    this.paddleRight.position.y = 8.5;
    this.ball.position.x = 15;
    this.ball.position.y = 10;
    this.initBallDirection();
    this.currentSpeed = this.speed;
  }
}