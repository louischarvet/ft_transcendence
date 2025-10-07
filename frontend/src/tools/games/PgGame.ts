// import Path from "./PgPath";
import Victor from "victor";

export default class PgGame {

  width = 30;
  height = 20;

  fps = 1000/60;

  keys: { [key: string]: boolean };

  sceneFunctions: any;
  againstAI: boolean;
  aiLevel = 1;

  leftScore = 0;
  rightScore = 0;

  started: boolean = false;

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

  constructor(keys: { [key: string]: boolean }, sceneFunctions: any, frontAddedObjects: any = {}, againstAI: boolean = false) {
    this.keys = keys;
    this.sceneFunctions = sceneFunctions;
    this.frontAddedObjects = frontAddedObjects; // tqt
    this.againstAI = againstAI;

    this.initBallDirection();
  }

  private initBallDirection() {
    const signX = Math.sign(this.ball.direction.x || Math.random() * 2 - 1); // si vx est 0, on choisit aléatoirement la direction
    const signAngle = Math.sign(Math.random() * 2 - 1);

    this.ball.direction.y = 0;
    this.ball.direction.x = signX;
    this.ball.direction.rotateDeg((Math.random() * 40 + 10) * signAngle);
  }

  private delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  async start() {
    let timer = 0;
    this.started = true;

    while (this.started) {
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

  private async gameLoop(timer: number) {

    // Move IA every 1000ms
    if (this.againstAI && timer % 1000 < this.fps)
      this.aiMovement(this.currentSpeed, this.ball, this.paddleRight, this.aiLevel);

    // Move paddles
    this.paddlesMovement();

    // Move ball
    this.ball.position.add(this.ball.direction.clone().multiplyScalar(this.currentSpeed));

    this.collidedDirection = undefined;
    // increase speed if collision with paddle, decrease if with frontAddedObjects
    if (this.handleCollision(this.paddleLeft)) {
      const oldSpeed = this.currentSpeed;
      this.currentSpeed = Math.abs(this.paddleLeft.speedInertia) * this.speedInertiaTransfert;
      if (this.currentSpeed < oldSpeed)
        this.currentSpeed = oldSpeed - this.speedInertiaTransfert;
    } else if (this.handleCollision(this.paddleRight)) {
      const oldSpeed = this.currentSpeed;
      this.currentSpeed = Math.abs(this.paddleRight.speedInertia) * this.speedInertiaTransfert;
      if (this.currentSpeed < oldSpeed)
        this.currentSpeed = oldSpeed - this.speedInertiaTransfert;
    } else {
      for (const objKey in this.frontAddedObjects) {
        if (this.handleCollision(this.frontAddedObjects[objKey])) {
          this.currentSpeed -= this.speedInertiaTransfert * 2;
          break;
        }
      }
    }
    if (this.currentSpeed < this.speed)
      this.currentSpeed = this.speed;
    // if (this.currentSpeed > this.speed * 3)
    //   this.currentSpeed = this.speed * 3;

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
      else if (this.againstAI && (this.leftScore - this.rightScore) >= 5)
        this.aiLevel++;
      this.initBallDirection();
      this.currentSpeed = this.speed;
    }
  }

  private async aiMovement(speed: number, ball: { position: Victor, direction: Victor }, paddleRight: { position: Victor, width: number, height: number }, lvl: number) {
    if (ball.direction.x > 0 && ball.position.x < paddleRight.position.x) {
      let steps = 0;
      while (ball.position.x + ball.direction.x * speed * steps < paddleRight.position.x) {
        steps++;
      }
      const predictedY = ball.position.y + ball.direction.y * speed * steps;
      let distYBySpeed = (predictedY - (paddleRight.position.y + paddleRight.height / 2)) / speed;

      for (let i = 0; i < Math.abs(distYBySpeed) && i < 60; i++) {
        if (distYBySpeed > 0) {
          console.log('AI down');
          this.keys["AIUp"] = true;
          this.keys["AIDown"] = false;
        } else {
          console.log('AI up');
          this.keys["AIDown"] = true;
          this.keys["AIUp"] = false;
        }
        await this.delay(this.fps);
      }
    } else if (lvl > 1) { // return to center
      this.aiMovement(speed, { position: new Victor(this.width / 2, this.height / 2), direction: new Victor(1, 0) }, paddleRight, 1);
    }
    this.keys["AIUp"] = false;
    this.keys["AIDown"] = false;
  }

  private paddlesMovement() {
    this.handlePaddle("KeyW", "KeyS", this.paddleLeft);
    if (this.againstAI) {
      this.handlePaddle("AIUp", "AIDown", this.paddleRight);
    } else {
      this.handlePaddle("ArrowUp", "ArrowDown", this.paddleRight);
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

  private handleCollision(obj: { position: Victor, width: number, height: number }): boolean {
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

      this.ball.position = stepPos.subtract(this.ball.direction.clone().multiplyScalar(this.speed * 0.1));
      step--;

      if (Math.abs(ballCollisionOffset.x) > Math.abs(ballCollisionOffset.y) &&
        (ballCollisionOffset.x > 0 && this.ball.direction.x > 0 ||
          ballCollisionOffset.x < 0 && this.ball.direction.x < 0)) {
        this.collidedDirection = this.ball.direction.clone();
        this.ball.direction.x *= -1;
      } else if (Math.abs(ballCollisionOffset.y) > Math.abs(ballCollisionOffset.x) &&
        (ballCollisionOffset.y > 0 && this.ball.direction.y > 0 ||
          ballCollisionOffset.y < 0 && this.ball.direction.y < 0)) {
        this.collidedDirection = this.ball.direction.clone();
        this.ball.direction.y *= -1;
      }
      this.ball.position.add(this.ball.direction.clone().multiplyScalar((stepRatio - step) * this.speed * 0.1));

      return true;
    }
    return false;
  }

  private reset() {
    this.aiLevel = 1;
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