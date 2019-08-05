import { ColorGradient } from '../others/Colors';

export class Charge extends PIXI.Graphics{
  count:number=-1;
  gradient1:ColorGradient;
  gradient2:ColorGradient;
  callback:()=>void;
  running:boolean=false;

  constructor(public endRadius:number=10,public time:number=30,color:number=0xff0000){
    super();
    this.gradient1=new ColorGradient(0,color);
    this.gradient2=new ColorGradient(0xffffff,color);
  }

  startCharge(callback?:()=>void){
    this.count=0;
    this.callback=callback;
    this.redraw();
    this.running=true;
  }

  update(speed:number){
    if (this.count===-1) return;

    if (this.count<this.time){
      this.count+=speed;
      this.redraw();
    }else{
      this.endCharge();
    }
  }

  redraw=()=>{
    // let color=this.gradient.getColorAt(Math.random()*0.5+0.5);
    if (Math.random()<0.5){
      var color=this.gradient1.getColorAt(Math.random()*0.5+0.5);
    }else{
      color=this.gradient2.getColorAt(Math.random()*0.5+0.5);
    }
    this.clear();
    this.beginFill(color);
    this.drawCircle(0,0,this.endRadius*this.count/this.time);
  }

  endCharge=()=>{
    if (this.callback) this.callback();
    this.callback=null;
    this.count=-1;
    this.clear();
    this.running=false;
  }
}