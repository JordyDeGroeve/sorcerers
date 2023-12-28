import { DisplayObject } from "pixi.js";
import { Range } from "./range";
import { Fireball } from "./fireball";
import { Controller } from "../controller/controller";
import { Character } from "../character";
import { Sword } from "./sword";
import { ArrowDown } from "./downArrow";
import { PhysicsBody } from "../collision";

export interface Cursor extends DisplayObject {
  update(controller: Controller): void;
  remove(): void;
}

export interface Projectile extends DisplayObject {
  body: PhysicsBody;

  tick(dt: number): void;
  serialize(): any;
  deserialize(data: any): void;
}

export interface Spell {
  name: string;
  description?: string;
  cursor: new (character: Character, spell: Spell) => Cursor;
  data: any;
}

export const SPELLS: Spell[] = [
  {
    name: "Fireball",
    description: "Generic fireball",
    cursor: Range,
    data: {
      projectile: Fireball,
      xOffset: 7,
      yOffset: 10.5,
    },
  },
  {
    name: "Arthur's sword",
    description: "Giant sword from the sky",
    cursor: ArrowDown,
    data: {
      projectile: Sword,
      xOffset: -5.5,
      yOffset: 0,
    },
  },
];
