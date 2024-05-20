import { Ticker, TickerCallback, UPDATE_PRIORITY } from "pixi.js";

import { Server } from "./server";
import { Level } from "../map/level";
import { KeyboardController } from "../controller/keyboardController";
import { Manager } from "./manager";
import { Map } from "../map";

export const PEER_ID_PREFIX = "sorcerers-";
export const FIXED_INTERVAL = 1000 / 20;

export const connect = async (
  target: HTMLElement,
  map: Map,
  onBack: () => void
) => {
  const level = new Level(target, map);
  const controller = new KeyboardController(level.viewport);

  const ticker: TickerCallback<null> = (ticker) => {
    Manager.instance.tick(ticker.deltaTime);
  };

  let fixedTick = window.setInterval(
    () => Manager.instance.fixedTick(FIXED_INTERVAL),
    FIXED_INTERVAL
  );

  const handleBack = () => {
    Ticker.shared.remove(ticker, null);
    window.clearInterval(fixedTick);
    onBack();
  };

  Manager.instance.connect(controller, handleBack);
  await Server.instance?.start();

  Ticker.shared.add(ticker, null, UPDATE_PRIORITY.LOW);

  return controller;
};
