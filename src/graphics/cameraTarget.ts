import { Viewport } from "pixi-viewport";
import { KeyboardController } from "../data/controller/keyboardController";
import { Key } from "../data/controller/controller";
import { HurtableEntity } from "../data/entity/types";
import { getDistance } from "../util/math";

export class CameraTarget {
  static maxScale = 1.5;
  static minScale = 0.4;
  static zoomSpeed = 0.01;

  static maxSpeed = 50;
  static damping = 50;
  static acc = 0.1;

  static shakeAmount = 10;
  static shakeIntensity = 12;
  static shakeInterval = 25;

  private controller: KeyboardController | undefined;
  private target?: HurtableEntity;
  private position: [number, number];

  private attached = true;
  private oldMouse: [number, number] = [0, 0];
  private oldCDown = false;
  private followMouse = false;
  private intervalId = -1;

  private speed = CameraTarget.acc;
  private scale = 1;

  constructor(private viewport: Viewport) {
    this.position = [
      this.viewport.worldWidth / 2,
      this.viewport.worldHeight / 2,
    ];
  }

  tick(dt: number) {
    if (!this.controller || this.intervalId !== -1) {
      return;
    }

    let position: [number, number] | undefined;

    if (this.target && this.attached) {
      position = this.target.getCenter();
    } else {
      if (this.target?.body.velocity !== 0) {
        this.attached = true;
        this.speed = 0;
      }

      position = this.controller.getLocalMouse();
    }

    if (this.controller.isKeyDown(Key.C)) {
      position = this.controller.getLocalMouse();

      if (!this.oldCDown) {
        this.oldCDown = true;
        this.oldMouse = position;
      }

      if (
        !this.followMouse &&
        getDistance(...position, ...this.oldMouse!) > 20
      ) {
        this.followMouse = true;
        this.attached = false;
        this.speed = 0;
      }
    } else if (this.oldCDown) {
      if (!this.followMouse) {
        this.attached = true;
        this.speed = 0;
      }

      this.followMouse = false;
      this.oldCDown = false;
    }

    // Clamp position to world edges
    position = [
      Math.max(
        Math.min(
          position[0],
          this.viewport.worldWidth - this.viewport.screenWidth / 2 / this.scale
        ),
        this.viewport.screenWidth / 2 / this.scale
      ),
      Math.max(
        Math.min(
          position[1],
          this.viewport.worldHeight -
            this.viewport.screenHeight / 2 / this.scale
        ),
        this.viewport.screenHeight / 2 / this.scale
      ),
    ];

    const dx = (position[0] - this.position[0]) * this.scale;
    const dy = (position[1] - this.position[1]) * this.scale;
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);

    const speed = this.speed * dt;
    const sum = adx + ady;

    const sx = sum ? (speed * adx) / sum : 0;
    const sy = sum ? (speed * ady) / sum : 0;

    if (adx > sx) {
      this.position[0] += Math.sign(dx) * sx;
    } else {
      this.position[0] = position[0];
    }

    if (ady > sy) {
      this.position[1] += Math.sign(dy) * sy;
    } else {
      this.position[1] = position[1];
    }

    const [x, y] = this.controller.getLocalMouse();
    this.controller.mouseMove(
      x + (this.position[0] - this.viewport.center.x),
      y + (this.position[1] - this.viewport.center.y)
    );
    this.viewport.moveCenter(...this.position);

    if (
      (sx * CameraTarget.damping < adx || sy * CameraTarget.damping < ady) &&
      (this.attached || this.followMouse)
    ) {
      this.speed = Math.min(
        CameraTarget.maxSpeed,
        this.speed + Math.pow(CameraTarget.acc, dt)
      );
    } else {
      this.speed = Math.max(
        CameraTarget.acc,
        this.speed - Math.pow(CameraTarget.acc, dt)
      );
    }
  }

  setTarget(target?: HurtableEntity) {
    this.target = target;
  }

  connect(controller: KeyboardController) {
    this.controller = controller;

    controller.addScrollListener((event) => {
      const minScale = this.viewport.screenHeight / this.viewport.worldHeight;
      this.scale = Math.min(
        CameraTarget.maxScale,
        Math.max(minScale, this.scale - event.deltaY * CameraTarget.zoomSpeed)
      );

      const oldWidth = this.viewport.width;
      this.viewport.setZoom(this.scale, true);

      const [x, y] = controller.getLocalMouse();
      const center = this.viewport.center;
      const dx = x - center.x;
      const dy = y - center.y;

      const delta = 1 - oldWidth / this.viewport.width;
      controller.mouseMove(x - dx * delta, y - dy * delta);

      this.clamp();
    });
  }

  private clamp() {
    const oldPosition = [...this.position];

    this.position = [
      Math.max(
        Math.min(
          this.position[0],
          this.viewport.worldWidth - this.viewport.screenWidth / 2 / this.scale
        ),
        this.viewport.screenWidth / 2 / this.scale
      ),
      Math.max(
        Math.min(
          this.position[1],
          this.viewport.worldHeight -
            this.viewport.screenHeight / 2 / this.scale
        ),
        this.viewport.screenHeight / 2 / this.scale
      ),
    ];

    const dx = this.position[0] - oldPosition[0];
    const dy = this.position[1] - oldPosition[1];

    if (dx !== 0 || dy !== 0) {
      const [x, y] = this.controller!.getLocalMouse();
      this.controller!.mouseMove(x + dx, y + dy);
      this.viewport.moveCenter(...this.position);
    }
  }

  shake() {
    window.clearInterval(this.intervalId);

    const center = this.viewport.center;

    let shakes = CameraTarget.shakeAmount;
    this.intervalId = window.setInterval(() => {
      this.viewport!.animate({
        time: CameraTarget.shakeInterval,
        position: {
          x:
            center.x +
            Math.random() * CameraTarget.shakeIntensity -
            CameraTarget.shakeIntensity / 2,
          y:
            center.y +
            Math.random() * CameraTarget.shakeIntensity -
            CameraTarget.shakeIntensity / 2,
        },
      });

      shakes--;
      if (shakes <= 0) {
        window.clearInterval(this.intervalId);
        this.intervalId = -1;
      }
    }, CameraTarget.shakeInterval);
  }
}
