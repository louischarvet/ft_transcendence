// PgPath.tsx
import Victor from "victor";

export default class PgPath {
  next: PgPath | null = null;
  position: Victor;
  speed: Victor;
  deltaTime: number;

  constructor(position: Victor, direction?: Victor, deltaTime?: number);
  constructor(copyFrom: PgPath);

  constructor(arg1: Victor | PgPath, arg2?: Victor, arg3?: number) {
    if (arg1 instanceof Victor) {
      // Regular constructor
      this.position = arg1.clone();
      this.speed = arg2?.clone() ?? new Victor(0, 0);
      this.deltaTime = arg3 ?? 0;
    } else {
      // Copy constructor
      this.position = arg1.position.clone();
      this.speed = arg1.speed.clone();
      this.deltaTime = arg1.deltaTime;
    }
  }

  last(): PgPath {
    if (this.next === null) return this;
    else return this.next.last();
  }

  move(factor: number = 1): PgPath {
    const time = this.deltaTime * factor;
    this.position.add(this.speed.clone().multiplyScalar(time));
    this.deltaTime -= time;
    if (this.deltaTime < 1e-6) this.deltaTime = 0;
    return this;
  }

  extend(): void;
  extend<T extends any[]>(
    collisionFunc: (path: PgPath, ...args: T) => PgPath,
    ...args: T
  ): void;

  extend<T extends any[]>(
    collisionFunc?: (path: PgPath, ...args: T) => PgPath,
    ...args: T
  ): void {
    const lastPath = this.last();

    // if (lastPath.deltaTime === 0) return;
    if (lastPath.deltaTime < 1e-6) return;

    if (!collisionFunc) {
      lastPath.next = new PgPath(lastPath).move();
      return;
    } else {
      lastPath.next = collisionFunc(lastPath, ...args);
      return lastPath.next.extend(collisionFunc, ...args);
    }
  }
}