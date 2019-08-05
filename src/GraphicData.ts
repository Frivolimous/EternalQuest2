export class ImageRepo{
	static sm="./Bitmaps/Separate/sm.png";
	static mm="./Bitmaps/Separate/mm.png";
	static lm="./Bitmaps/Separate/lm.png";
	static sl="./Bitmaps/Separate/sl.png";
	static ml="./Bitmaps/Separate/ml.png";
	static ll="./Bitmaps/Separate/ll.png";
	static ss="./Bitmaps/Separate/ss.png";
	static ms="./Bitmaps/Separate/ms.png";
	static ls="./Bitmaps/Separate/ls.png";
	static turret="./Bitmaps/Separate/turret.png";
	static superman="./Bitmaps/Separate/superman.png";
	static player="./Bitmaps/Separate/player/red 1.png";
	static playerMissile="./Bitmaps/Separate/missiles/p mi.png";
	static enemyMissile="./Bitmaps/Separate/missiles/me ship 1.png";
	static boss0="./Bitmaps/Separate/boss/boss0.png";
	static boss1="./Bitmaps/Separate/boss/boss1.png";
	static boss2="./Bitmaps/Separate/boss/boss2.png";
	static boss0Over0="./Bitmaps/doors2.png";
	static boss0Over1="./Bitmaps/doors3.png";
	static boss0Over2="./Bitmaps/doors4.png";
}

export class TextureData{
	static cache:any={};
	
	static circle:PIXI.Texture;
	static square:PIXI.Texture;
	static smallCircle:PIXI.Texture;
	static mediumCircle:PIXI.Texture;
	static clearCircle:PIXI.Texture;
	static bullet:PIXI.Texture;
	static wall:PIXI.Texture;
	static nova:PIXI.Texture;
	static genericShadow:PIXI.Texture;
	static itemRect:PIXI.Texture;
	static medal:PIXI.Texture;

	static init(_renderer:any){
		let _graphic:PIXI.Graphics=new PIXI.Graphics;
		_graphic.beginFill(0xffffff);
		_graphic.drawCircle(-25,-25,25);
		this.circle=_renderer.generateTexture(_graphic);

		_graphic=new PIXI.Graphics;
		_graphic.beginFill(0xffffff);
		_graphic.drawCircle(-5,-5,5);
		this.smallCircle=_renderer.generateTexture(_graphic);

		_graphic=new PIXI.Graphics;
		_graphic.beginFill(0xcccccc);
		_graphic.drawRoundedRect(0,0,30,30,5);
		this.itemRect=_renderer.generateTexture(_graphic);

		_graphic=new PIXI.Graphics;
		_graphic.beginFill(0,0.3);
		_graphic.drawEllipse(0,0,5,2);
		this.genericShadow=_renderer.generateTexture(_graphic);

		_graphic=new PIXI.Graphics;
		_graphic.beginFill(0xffffff,0.5);
		_graphic.lineStyle(2,0xffffff,0.7);
		_graphic.drawCircle(0,0,25);
		this.clearCircle=_renderer.generateTexture(_graphic);

		_graphic=new PIXI.Graphics;
		_graphic.beginFill(0xffffff);
		_graphic.drawRect(0,0,28,28);
		_graphic.beginFill(0x333333);
		_graphic.drawCircle(14,14,14);
		_graphic.beginFill(0xffffff);
		_graphic.drawCircle(14,14,7);
		this.mediumCircle=_renderer.generateTexture(_graphic);

		_graphic=new PIXI.Graphics;
		_graphic.beginFill(0xffffff);
		_graphic.drawRect(0,0,28,28);
		_graphic.endFill();
		_graphic.lineStyle(5,0x333333);
		_graphic.moveTo(2,2);
		_graphic.lineTo(26,26);
		_graphic.moveTo(26,2);
		_graphic.lineTo(2,26);
		this.wall=_renderer.generateTexture(_graphic);

		_graphic=new PIXI.Graphics;
		_graphic.beginFill(0xffffff);
		_graphic.drawRect(0,0,28,28);
		_graphic.endFill();
		_graphic.lineStyle(5,0x333333);
		_graphic.moveTo(13,2);
		_graphic.lineTo(26,13);
		_graphic.lineTo(13,26);
		_graphic.lineTo(2,13);
		_graphic.lineTo(13,2);
		this.nova=_renderer.generateTexture(_graphic);

		_graphic.clear();
		_graphic.beginFill(0xffffff);
		_graphic.drawRect(0,0,30,30);
		this.square=_renderer.generateTexture(_graphic);

		_graphic.clear();
		_graphic.beginFill(0xffffff);
		_graphic.drawCircle(0,0,2);
		this.bullet=_renderer.generateTexture(_graphic);

		_graphic.clear();
		_graphic.beginFill(0xffffff);
		_graphic.moveTo(-5,0);
		_graphic.lineTo(-10,20);
		_graphic.lineTo(10,20);
		_graphic.lineTo(5,0);
		_graphic.lineTo(-5,0);
		_graphic.drawCircle(0,0,10);
		this.medal=_renderer.generateTexture(_graphic);
	}
}