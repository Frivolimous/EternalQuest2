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
      // let m = PIXI.Texture.from(url, {crossorigin: true});
      let m = PIXI.Texture.WHITE;
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
}
