export class Starfield extends PIXI.Container{
  public stars:Star[]=[]
  public objects:any[]=[]
  public nebTick:number;
  public back:PIXI.Graphics;

  constructor(private canvasWidth:number,private canvasHeight:number){
    super();
    this.back=new PIXI.Graphics();
    this.setBack(0);
    this.addChild(this.back);
    for (let i=0;i<40;i+=1){
      this.stars.push(new Star(1+Math.random()*1,Math.floor(Math.random()*this.canvasWidth),Math.random()*this.canvasHeight));
    }
    this.nebTick=9000;
  }
  
  public setBack(i:number){
    //back.bitmapData=new BitmapData(Facade.stage.stageWidth,Facade.stage.stageHeight,false,0);
    // back.bitmapData=SpriteSheets.back[Math.floor(i/4)];
  }

  public spawnStar(){
    let newStar=new Star(1+Math.random()*3,Math.floor(Math.random()*this.canvasWidth))
    this.stars.push(newStar);
    
    this.addChild(newStar);
  }

  public spawnNebula(){
    //this.objects.push(new Nebula());
    //this.addChildAt(this.objects[this.objects.length-1],1); 
  }
  
  public update(speed:number){
    let spawn=speed*0.3;
    while(spawn>1){
      spawn-=1;
      this.spawnStar();
    }
    if (Math.random()<spawn){
      this.spawnStar();
    }
    if (this.nebTick>10000/speed){
      this.spawnNebula();
      this.nebTick=0;
    }else{
      this.nebTick+=1;
    }
    let i=0;
    while (i<this.stars.length){
      this.stars[i].y+=this.stars[i].v*speed;
      if (this.stars[i].y>this.canvasHeight){
        this.removeChild(this.stars[i]);
        this.stars.splice(i,1);
      }else{
        i+=1;
      }
    }
    i=0;
    while(i<this.objects.length){
      this.objects[i].y+=speed*0.6;
      if (this.objects[i].y>this.canvasHeight){
        this.objects[i].parent.removeChild(this.objects[i]);
        this.objects.splice(i,1);
      }else{
        i+=1;
      }
    }
    i=0;
    // while (i<particles.length){
    //   particles[i].update(wpm);
    //   if (particles[i].timer>particles[i].life){
    //     gameV.removeChild(particles[i]);
    //     particles.splice(i,1);
    //   }else{
    //     i+=1;
    //   }
    // }
  }
  
  // public function explosion(_x:Number=-1,_y:Number=-1,_c:int=50){
  //   if (_c>20){
  //     soundC.sound(SoundControl.EXPLODE_B);
  //   }else{
  //     soundC.sound(SoundControl.EXPLODE_S);
  //   }

  //   var temp:uint=0xcccccc;
  //   if (_x==-1){
  //     var _point:Point=new Point(Math.random()*this.canvasWidth,Math.random()*this.canvasWidth);
  //   }else{
  //     _point=new Point(_x,_y);
  //   }
  //   for (var i:int=0;i<_c;i++){
  //     var _shape:Particle=new Particle(temp,_point.x,_point.y,1+Math.random()*4,Math.random()*2*Math.PI,Math.random()*0.5,200+Math.random()*100);
      
  //     gameV.addChildAt(_shape,0);
  //     particles.push(_shape);
      
  //   }
  // }
}

class Star extends PIXI.Graphics{
  constructor(public v:number,x:number,y:number=0) {
    super();
    this.x=x;
    this.y=y;

    this.beginFill(0xffffff);
    this.drawCircle(0,0,v/2);
  }
}