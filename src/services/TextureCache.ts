import * as PIXI from 'pixi.js';
import { Colors } from '../data/Colors';

type TextureName = 'circle' | 'medal' | 'firework';

export const enum TextureUrl {
  GHOST = 'www.nowhere.com/ghost.png',
}

export class TextureCache {
  public static initialize(app: PIXI.Application) {
    TextureCache.renderer = app.renderer;
    createGraphicTextures();
  }

  public static addTextureFromGraphic = (id: TextureName, graphic: PIXI.Graphics): PIXI.Texture => {
    if (TextureCache.cache[id]) {
      console.warn('overwriting texture', id);
    }

    let m: PIXI.Texture = TextureCache.renderer.generateTexture(graphic, PIXI.SCALE_MODES.LINEAR, 1);
    TextureCache.cache[id] = m;
    return m;
  }

  public static getTextureFromUrl = (url: TextureUrl | string): PIXI.Texture => {
    if (TextureCache.cache[url]) {
      return TextureCache.cache[url];
    } else {
      let m = PIXI.Texture.from(url);
      TextureCache.cache[url] = m;
      return m;
    }
  }

  public static getGraphicTexture = (id: TextureName): PIXI.Texture => {
    if (TextureCache.cache[id]) {
      return TextureCache.cache[id];
    } else {
      return PIXI.Texture.WHITE;
    }
  }

  public static addTextureBackgrounds(i: number, a: string[]) {
    if (!TextureCache.backgrounds[i]) {
      TextureCache.backgrounds[i] = [];
    }

    for (let j = 0; j < a.length; j++) {
      let texture = TextureCache.getTextureFromUrl(a[j]);
      TextureCache.backgrounds[i][j] = texture;
    }
  }

  public static addTextureParalax(i: number, s: string) {
    TextureCache.paralaxes[i] = TextureCache.getTextureFromUrl(s);
  }

  public static getTextureBackgrounds(zone: number) {
    return TextureCache.backgrounds[zone];
  }

  public static getTextureParalax(zone: number) {
    return TextureCache.paralaxes[zone];
  }

  private static renderer: PIXI.Renderer;
  private static cache: { [key: string]: PIXI.Texture } = {};
  private static backgrounds: PIXI.Texture[][] = [];
  private static paralaxes: PIXI.Texture[] = [];
}

function createGraphicTextures() {
    let graphic = new PIXI.Graphics();
    graphic.beginFill(0xffffff);
    graphic.moveTo(-5, 0);
    graphic.lineTo(-10, 20);
    graphic.lineTo(10, 20);
    graphic.lineTo(5, 0);
    graphic.lineTo(-5, 0);
    graphic.drawCircle(0, 0, 10);
    TextureCache.addTextureFromGraphic('medal', graphic);

    graphic = new PIXI.Graphics();
    graphic.clear().beginFill(0xffffff);
    graphic.drawCircle(50, 50, 100);
    TextureCache.addTextureFromGraphic('circle', graphic);

    graphic = new PIXI.Graphics();
    graphic.beginFill(0xffffff);
    graphic.drawCircle(0, 0, 5);
    TextureCache.addTextureFromGraphic('firework', graphic);

    // graphic.clear();
    // graphic.beginFill(0xffffff);
    // graphic.moveTo(40, 0);
    // graphic.lineTo(60, 0);
    // graphic.lineTo(60, 40);
    // graphic.lineTo(100, 40);
    // graphic.lineTo(100, 60);
    // graphic.lineTo(60, 60);
    // graphic.lineTo(60, 100);
    // graphic.lineTo(40, 100);
    // graphic.lineTo(40, 60);
    // graphic.lineTo(0, 60);
    // graphic.lineTo(0, 40);
    // graphic.lineTo(40, 40);
    // graphic.lineTo(40, 0);
    // TextureData.health = TextureData.cache.addTextureFromGraphic('health', graphic);

    // graphic.clear();
    // graphic.beginFill(0xffffff);
    // graphic.drawCircle(50, 50, 50);
    // TextureData.kills = TextureData.cache.addTextureFromGraphic('kills', graphic);

    // graphic.clear();
    // graphic.beginFill(0xffffff, 0.2);
    // graphic.drawCircle(50, 50, 50);
    // graphic.beginFill(0xffff00);
    // graphic.drawRect(20, 0, 20, 100);
    // graphic.drawRect(60, 0, 20, 100);
    // TextureData.pause = TextureData.cache.addTextureFromGraphic('pause', graphic);

    // graphic.clear();
    // graphic.beginFill(0xffffff, 0.2);
    // graphic.drawCircle(50, 50, 50);
    // graphic.beginFill(0xffff00);
    // graphic.moveTo(20, 10);
    // graphic.lineTo(80, 50);
    // graphic.lineTo(20, 90);
    // graphic.lineTo(20, 10);
    // TextureData.play = TextureData.cache.addTextureFromGraphic('play', graphic);

    // graphic.clear();
    // graphic.beginFill(0xffffff, 0.2);
    // graphic.drawCircle(50, 50, 50);
    // graphic.beginFill(0xffff00);
    // graphic.drawCircle(10, 80, 10);
    // graphic.drawCircle(60, 80, 10);
    // graphic.drawRect(13, 0, 6, 80);
    // graphic.drawRect(63, 0, 6, 80);
    // graphic.drawRect(13, 0, 56, 20);
    // TextureData.sound = TextureData.cache.addTextureFromGraphic('sound', graphic);

    // graphic.endFill();
    // graphic.lineStyle(3, 0xff0000);
    // graphic.drawCircle(50, 50, 50);
    // graphic.moveTo(0, 100);
    // graphic.lineTo(100, 0);
    // TextureData.noSound = TextureData.cache.addTextureFromGraphic('noSound', graphic);

    // graphic.clear();
    // graphic.beginFill(0xff0000);
    // // graphic.drawRect(40, 0, 20, 100);
    // graphic.moveTo(5, 0);
    // graphic.lineTo(50, 45);
    // graphic.lineTo(95, 0);
    // graphic.lineTo(100, 5);
    // graphic.lineTo(55, 50);
    // graphic.lineTo(100, 95);
    // graphic.lineTo(95, 100);
    // graphic.lineTo(50, 55);
    // graphic.lineTo(5, 100);
    // graphic.lineTo(0, 95);
    // graphic.lineTo(45, 50);
    // graphic.lineTo(0, 5);
    // graphic.lineTo(5, 0);
    // // graphic.drawRect(0, 40, 100, 20);
    // // graphic.rotation = Math.PI / 4;
    // TextureData.bigX = TextureData.cache.addTextureFromGraphic('bigX', graphic);
    // graphic.rotation = 0;
}
