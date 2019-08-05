import * as _ from 'lodash'
import * as JMBL from "../JMBL";

export class FlyingText extends PIXI.Text{
	constructor(s:string,style:PIXI.TextStyleOptions,x:number,y:number,parent?:PIXI.Container){
		super(s,_.defaults(style,{fontSize:15,fontWeight:'bold',dropShadow:true,fill:0xffffff,dropShadowDistance:2}));
		this.anchor.set(0.5,0.5);

    this.position.set(x,y);
    
		if (parent) parent.addChild(this);
		
		JMBL.tween.to(this,60,{delay:20,alpha:0});
		JMBL.tween.to(this,80,{y:(this.y-20)},{onComplete:()=>this.destroy()});
	}
}