import { Texture } from "pixi.js";

export class UpdatingTexture {
  private ctx: OffscreenCanvasRenderingContext2D;
  public readonly texture: Texture;

  constructor(canvas: OffscreenCanvas, offsetX = 0, offsetY = 0) {
    this.ctx = canvas.getContext("2d")!;
    this.ctx.translate(-offsetX, -offsetY);

    this.texture = Texture.from(canvas);
  }

  update(
    mode: GlobalCompositeOperation,
    fn: (ctx: OffscreenCanvasRenderingContext2D) => void
  ) {
    this.ctx.globalCompositeOperation = mode;
    this.ctx.beginPath();
    fn(this.ctx);
    this.ctx.fill();

    this.texture.source.update();
  }
}
