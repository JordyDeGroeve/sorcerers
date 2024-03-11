import { Catastravia } from "../spells/catastravia";
import { CatastraviaMissile } from "../spells/catastraviaMissile";
import { Fireball } from "../spells/fireball";
import { GateOfBabylon } from "../spells/gateOfBabylon";
import { MagicMissile } from "../spells/magicMissile";
import { Nephtear } from "../spells/nephtear";
import { Reelseiden } from "../spells/reelseiden";
import { Shield } from "../spells/shield";
import { SmallSword } from "../spells/smallSword";
import { Element } from "../spells/types";
import { Zoltraak } from "../spells/zoltraak";
import { Character } from "./character";
import { MagicScroll } from "./magicScroll";
import { Potion } from "./potion";
import { PotionType } from "./potionData";
import { EntityType, Item, Spawnable } from "./types";

let id = 0;

export const setId = (value: number) => (id = value);

export const getId = () => id++;

export const ENTITIES: Record<
  EntityType,
  { create: (data: any) => Spawnable }
> = {
  [EntityType.Shield]: Shield,
  [EntityType.Zoltraak]: Zoltraak,
  [EntityType.Fireball]: Fireball,
  [EntityType.Character]: Character,
  [EntityType.MagicScroll]: MagicScroll,
  [EntityType.Potion]: Potion,
  [EntityType.Catastravia]: Catastravia,
  [EntityType.CatastraviaMissile]: CatastraviaMissile,
  [EntityType.MagicMissile]: MagicMissile,
  [EntityType.GateOfBabylon]: GateOfBabylon,
  [EntityType.SmallSword]: SmallSword,
  [EntityType.Reelseiden]: Reelseiden,
  [EntityType.Nephtear]: Nephtear,
};

interface SpawnRateData {
  spawn: (x: number, y: number) => Item;
  weight: number;
}

const SPAWN_RATES: SpawnRateData[] = [
  {
    spawn: (x: number, y: number) =>
      new Potion(x, y, false, PotionType.HealthPotion),
    weight: 1,
  },
  {
    spawn: (x: number, y: number) =>
      new Potion(x, y, false, PotionType.SmallHealthPotion),
    weight: 2,
  },
  {
    spawn: (x: number, y: number) =>
      new Potion(x, y, false, PotionType.ManaPotion),
    weight: 2,
  },
  {
    spawn: (x: number, y: number) =>
      new Potion(x, y, false, PotionType.SmallManaPotion),
    weight: 3,
  },
  {
    spawn: (x: number, y: number) =>
      new MagicScroll(x, y, false, Element.Arcane),
    weight: 1,
  },
  {
    spawn: (x: number, y: number) =>
      new MagicScroll(x, y, false, Element.Elemental),
    weight: 1,
  },
  {
    spawn: (x: number, y: number) => new MagicScroll(x, y, false, Element.Life),
    weight: 1,
  },
  {
    spawn: (x: number, y: number) =>
      new MagicScroll(x, y, false, Element.Physical),
    weight: 1,
  },
];

const totalWeight = SPAWN_RATES.reduce(
  (sum, spawnRate) => sum + spawnRate.weight,
  0
);

export const getRandomItem = (x: number, y: number) => {
  const rnd = Math.random() * totalWeight;

  let weight = 0;
  for (let spawnRate of SPAWN_RATES) {
    weight += spawnRate.weight;

    if (weight >= rnd) {
      return spawnRate.spawn(x, y);
    }
  }

  throw new Error("Should not happen!");
};
