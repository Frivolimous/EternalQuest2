import * as JMBL from "../JMBL";

interface IFirework{
	x?:number;
	y?:number;
	color?:number;
	gravity?:number;
	fade?:number;
	startVX?:number;
	startVY?:number;
	numParts?:number;
	size?:number;
}

export class Firework{
	static TEXTURE:PIXI.Texture;
	static particles:Array<FireworkParticle>=[];
	static initialized:Boolean=false;
	

	static initialize(){
		if (!this.initialized){
			let firework:PIXI.Graphics=new PIXI.Graphics;
			firework.beginFill(0xffffff);
			firework.drawCircle(0,0,5);
			Firework.TEXTURE=JMBL.textures.addTextureFromGraphic(firework);
			JMBL.events.ticker.add(this.onTick.bind(this));
			this.initialized=true;
		}
	}

	static onTick(){
		for (var i=0;i<this.particles.length;i+=1){
			this.particles[i].update();
			if (this.particles[i].alpha<0.1){
				this.particles[i].destroy();
				this.particles.splice(i,1);
				i-=1;
			}
		}
		//if (this.particles.length>0) console.log(this.particles[0].x+" "+this.particles[0].y);
	}

	constructor(stage:PIXI.Container,x:number,y:number,count:number){
		if (!Firework.initialized) Firework.initialize();

		for (let i=0;i<count;i+=1){
			let particle:FireworkParticle=new FireworkParticle(x,y);
			Firework.particles.push(particle);
			stage.addChild(particle);
		}
	}
}

class FireworkParticle extends PIXI.Sprite{
	fade:number=0.01;
	vX:number=0.6;
	vY:number=0.6;

	constructor(x:number,y:number){
		super(Firework.TEXTURE);
		this.x=x;
		this.y=y;
		this.vX=Math.random()*this.vX-this.vX/2;
		this.vY=Math.random()*this.vY-this.vY/2;
		this.alpha=1+Math.random()*0.5;
		let size=2+Math.random()*8;
		this.width=size;
		this.height=size;
		this.tint=0xcccccc;
	}

	update=()=>{
		this.x+=this.vX;
		this.y+=this.vY;
		this.alpha-=this.fade;
	}
}