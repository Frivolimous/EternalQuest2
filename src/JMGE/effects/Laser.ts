import * as JMBL from "../JMBL";
import * as Colors from "../others/Colors";

export class Laser extends PIXI.Graphics{
  constructor(origin:{x:number,y:number},target:{x:number,y:number},color:number=0xffffff,thickness:number=1,parent?:PIXI.Container){
    super();
    if (parent) parent.addChild(this);
    this.lineStyle(thickness*2,Colors.adjustLightness(color,0.3));
    this.moveTo(origin.x,origin.y);
    this.lineTo(target.x,target.y);
    this.lineStyle(thickness,color);
    this.lineTo(origin.x,origin.y);
    this.alpha=2;

    JMBL.tween.to(this,30,{alpha:0},{onComplete:()=>this.destroy()});
  } 
}