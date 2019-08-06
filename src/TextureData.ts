export class TextureData {
    public static cache: any = {};

    public static circle: PIXI.Texture;
    public static square: PIXI.Texture;
    public static smallCircle: PIXI.Texture;
    public static mediumCircle: PIXI.Texture;
    public static clearCircle: PIXI.Texture;
    public static bullet: PIXI.Texture;
    public static wall: PIXI.Texture;
    public static nova: PIXI.Texture;
    public static genericShadow: PIXI.Texture;
    public static itemRect: PIXI.Texture;
    public static medal: PIXI.Texture;

    public static init(_renderer: any) {
        let _graphic: PIXI.Graphics = new PIXI.Graphics();
        _graphic.beginFill(0xffffff);
        _graphic.drawCircle(-25, -25, 25);
        this.circle = _renderer.generateTexture(_graphic);

        _graphic = new PIXI.Graphics();
        _graphic.beginFill(0xffffff);
        _graphic.drawCircle(-5, -5, 5);
        this.smallCircle = _renderer.generateTexture(_graphic);

        _graphic = new PIXI.Graphics();
        _graphic.beginFill(0xcccccc);
        _graphic.drawRoundedRect(0, 0, 30, 30, 5);
        this.itemRect = _renderer.generateTexture(_graphic);

        _graphic = new PIXI.Graphics();
        _graphic.beginFill(0, 0.3);
        _graphic.drawEllipse(0, 0, 5, 2);
        this.genericShadow = _renderer.generateTexture(_graphic);

        _graphic = new PIXI.Graphics();
        _graphic.beginFill(0xffffff, 0.5);
        _graphic.lineStyle(2, 0xffffff, 0.7);
        _graphic.drawCircle(0, 0, 25);
        this.clearCircle = _renderer.generateTexture(_graphic);

        _graphic = new PIXI.Graphics();
        _graphic.beginFill(0xffffff);
        _graphic.drawRect(0, 0, 28, 28);
        _graphic.beginFill(0x333333);
        _graphic.drawCircle(14, 14, 14);
        _graphic.beginFill(0xffffff);
        _graphic.drawCircle(14, 14, 7);
        this.mediumCircle = _renderer.generateTexture(_graphic);

        _graphic = new PIXI.Graphics();
        _graphic.beginFill(0xffffff);
        _graphic.drawRect(0, 0, 28, 28);
        _graphic.endFill();
        _graphic.lineStyle(5, 0x333333);
        _graphic.moveTo(2, 2);
        _graphic.lineTo(26, 26);
        _graphic.moveTo(26, 2);
        _graphic.lineTo(2, 26);
        this.wall = _renderer.generateTexture(_graphic);

        _graphic = new PIXI.Graphics();
        _graphic.beginFill(0xffffff);
        _graphic.drawRect(0, 0, 28, 28);
        _graphic.endFill();
        _graphic.lineStyle(5, 0x333333);
        _graphic.moveTo(13, 2);
        _graphic.lineTo(26, 13);
        _graphic.lineTo(13, 26);
        _graphic.lineTo(2, 13);
        _graphic.lineTo(13, 2);
        this.nova = _renderer.generateTexture(_graphic);

        _graphic.clear();
        _graphic.beginFill(0xffffff);
        _graphic.drawRect(0, 0, 30, 30);
        this.square = _renderer.generateTexture(_graphic);

        _graphic.clear();
        _graphic.beginFill(0xffffff);
        _graphic.drawCircle(0, 0, 2);
        this.bullet = _renderer.generateTexture(_graphic);

        _graphic.clear();
        _graphic.beginFill(0xffffff);
        _graphic.moveTo(-5, 0);
        _graphic.lineTo(-10, 20);
        _graphic.lineTo(10, 20);
        _graphic.lineTo(5, 0);
        _graphic.lineTo(-5, 0);
        _graphic.drawCircle(0, 0, 10);
        this.medal = _renderer.generateTexture(_graphic);
    }
}
