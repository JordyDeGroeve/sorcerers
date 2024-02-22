import { Container, Sprite } from "pixi.js";
import { Level } from "../map/level";
import { AssetsContainer } from "../../util/assets/assetsContainer";
import { SimpleBody } from "../collision/simpleBody";

import { swordTip } from "../collision/precomputed/triangles";
import { FallDamage, Shape } from "../damage/fallDamage";
import { Character } from "../entity/character";
import { StaticBody } from "../collision/staticBody";
import { Manager } from "../network/manager";
import { TurnState } from "../network/types";
import { TickingEntity } from "../entity/types";
import { Element } from "./types";
import { ControllableSound } from "../../sound/controllableSound";
import { Sound } from "../../sound";

const SHAKE_INTENSITY = 8;

export class Sword extends Container implements TickingEntity {
  public readonly body: SimpleBody;
  private sprite!: Sprite;
  private bounces = 40 * Manager.instance.getElementValue(Element.Physical);
  private lastY?: number;
  private lifetime = 150;

  private shakeXOffset = 0;
  private shakeYOffset = 0;
  private fallingSound?: ControllableSound;

  constructor(x: number, y: number) {
    super();

    this.body = new SimpleBody(Level.instance.terrain.characterMask, {
      mask: swordTip,
      onCollide: this.onCollide,
      bounciness: 0.7,
      friction: 0.95,
    });
    this.body.move(Math.round(x), y);

    const atlas = AssetsContainer.instance.assets!["atlas"];

    this.sprite = new Sprite(atlas.textures["spells_sword"]);
    this.sprite.position.set(-55, 105);
    this.sprite.scale.y = -1;

    // const sprite2 = new Sprite(Texture.from(swordTipCanvas));
    // sprite2.anchor.set(0);
    // sprite2.scale.set(6);

    this.addChild(this.sprite);

    this.fallingSound = ControllableSound.fromEntity(
      [x * 6, y * 6],
      Sound.Arrow
    );
  }

  private onCollide = (x: number, y: number) => {
    if (this.lastY && Math.abs(this.lastY - y) < 1) {
      return;
    }

    this.bounces--;
    this.lastY = y;
    this.shakeXOffset = Math.random() * SHAKE_INTENSITY - SHAKE_INTENSITY / 2;
    this.shakeYOffset = Math.random() * SHAKE_INTENSITY - SHAKE_INTENSITY / 2;

    const damage = new FallDamage(
      x,
      y - 4,
      Shape.SwordTip,
      7 * Manager.instance.getElementValue(Element.Arcane)
    );
    Level.instance.damage(damage);
    ControllableSound.fromEntity(
      [this.position.x, this.position.y],
      Sound.Step
    );

    const staticEntity = damage
      .getTargets()
      .getEntities()
      .find((entity) => entity.body instanceof StaticBody);

    if (staticEntity) {
      if (this.position.x + 32 > staticEntity.getCenter()[0]) {
        this.body.addVelocity(1, -3);
      } else {
        this.body.addVelocity(-1, -3);
      }
    }

    if (this.bounces <= 0) {
      this.die();
    }
  };

  tick(dt: number) {
    this.body.tick(dt);

    const [x, y] = this.body.precisePosition;
    this.position.set(x * 6 + this.shakeXOffset, y * 6 + this.shakeYOffset);
    this.fallingSound?.update([this.position.x, this.position.y]);

    this.lifetime -= dt;
    if (this.lifetime <= 0) {
      this.die();
    }
  }

  die() {
    Level.instance.remove(this);
    Manager.instance.setTurnState(TurnState.Ending);
  }

  static cast(x: number, y: number, character: Character) {
    const entity = new Sword(x, y);

    Level.instance.add(entity);
    return entity;
  }
}
