import { AnimatedSprite, Container } from "pixi.js";
import { Level } from "../level";
import { AssetsContainer } from "../../util/assets/assetsContainer";
import { SimpleBody } from "../collision/simpleBody";
import {
  circle32x32,
  circle3x3,
  circle9x9,
} from "../collision/precomputed/circles";

export class Fireball extends Container {
  public readonly body: SimpleBody;
  private sprite!: AnimatedSprite;
  private bounces = 5;

  constructor(x: number, y: number) {
    super();

    this.body = new SimpleBody(Level.instance.terrain.characterMask, {
      mask: circle3x3,
      onCollide: this.onCollide,
      bounciness: -0.9,
      friction: 0.96,
      gravity: 0.25,
    });
    this.body.x = x;
    this.body.y = y;

    const atlas = AssetsContainer.instance.assets!["atlas"];

    this.sprite = new AnimatedSprite(atlas.animations["spells_fireball"]);
    this.sprite.scale.set(3);
    this.sprite.animationSpeed = 0.3;
    this.sprite.play();
    this.sprite.anchor.set(0.25, 0.25);

    // const sprite2 = new Sprite(Texture.fromBuffer(circle3x3Canvas.data, 3, 3));
    // sprite2.anchor.set(0);
    // sprite2.scale.set(6);

    this.addChild(this.sprite);
  }

  private onCollide = (x: number, y: number) => {
    this.bounces--;

    const playerCollision = !Level.instance.terrain.collisionMask.collidesWith(
      this.body.mask,
      x,
      y
    );

    if (this.bounces === 0 || playerCollision) {
      Level.instance.remove(this);
      Level.instance.terrain.subtract(x, y, 16, circle32x32);

      Level.instance.hurt(x * 6, y * 6, 16 * 6, 50);
    } else {
      Level.instance.terrain.subtract(x, y, 4, circle9x9);
    }
  };

  tick(dt: number) {
    this.body.tick(dt);
    this.position.set(this.body.x * 6, this.body.y * 6);
  }

  serialize() {
    return this.body.serialize();
  }

  deserialize(data: any[]) {
    this.body.deserialize(data);
  }
}