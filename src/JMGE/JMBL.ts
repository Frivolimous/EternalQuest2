export let initialized:boolean=false;
export let interactionMode:string='desktop';

export function setInteractionMode(s:string){
	this.interactionMode=s;
}
export function init(app:PIXI.Application){
	app.ticker.add(events.onTick);
	textures.renderer=app.renderer;
	inputManager.init(app);
	initialized=true;
}

export const textures = new class {
	private cache:{[key:string]:PIXI.Texture}={};
	renderer:any;

	addTextureFromGraphic(graphic:PIXI.Graphics,id?:string):PIXI.Texture{
		let m:PIXI.Texture=this.renderer.generateTexture(graphic);
		if (id){
			this.cache[id]=m;
		}
		return m;
	}

	getTexture(id:string):PIXI.Texture{
		if (this.cache[id]){
			return this.cache[id];
		}else{
			return PIXI.Texture.WHITE;
		}
	}
}

export const utils = new class {
	clone<T>(obj:T):T{
		if (Array.isArray(obj)){
			let m:any=[];
			for (let i:number=0;i<obj.length;i++){
				m.push(obj[i]);
			}
			return m;
		}else if (obj === Object(obj)){
			let m:any={};
			for (var v in obj){
				m[v]=obj[v];
			}
			return m;
		}
		return obj;
	}

	deep<T>(obj:T):T{
		if (Array.isArray(obj)){
			let m:any=[]; 	
			for (var i:number=0;i<obj.length;i+=1){
				m.push(this.deep(obj[i]));
			}
			return m;
		}else if (obj === Object(obj)){
			let m:any={};
			for (var v in obj){
				m[v]=this.deep(obj[v]);
			}
			return m;
		}
		return obj;
	}

	default<T>(options:T,defaults:T):T{
		let op:any=options
		for (var v in defaults){
			op[v]=(op[v] || op[v]===0 || op[v]===false)?op[v]:defaults[v];
		}
	
		return op;
	}

	pull<T>(element:T,array:T[]):T[]{
		for (var i:number=0;i<array.length;i+=1){
			if (array[i]===element){
				array.splice(i,1);
				return array;
			}
		}
	
		return array;
	}

	find<T>(array:T[],condition:(e:T)=>boolean):T{
		for (let i:number=0;i<array.length;i++){
			if (condition(array[i])){
				return array[i];
			}
		}
		return null;
	}

	diminish(n:number,p:number,i:number):number{
		return n*Math.pow(1-p,i-1);
	}

	compound(n:number,p:number,i:number):number{
		return n*Math.pow(1+p,i-1);
	}

	mult(n1:number,n2:number):number{
		return (1-(1-n1)*(1-n2));
	}

	div(n1:number,n2:number):number{
		return (1-(1-n1)/(1-n2));
	}

	toPercent(n:number,precision:number=0):string{
		let tens = Math.pow(10,precision);
		return String(Math.round(n*100*tens)/tens)+"%";
	}

	hitTestPolygon(point:{x:number,y:number},polygon:{x:number,y:number}[]):boolean{
		let numCrosses=0;

		let i=0;
		let j=polygon.length-1;

		if (polygon[i].x===polygon[j].x && polygon[i].y===polygon[j].y){
			i=1;
			j=0;
		}
		for (i=i;i<polygon.length;i+=1){
			if (point.x>=Math.min(polygon[i].x,polygon[j].x) && point.x<=Math.max(polygon[i].x,polygon[j].x)){
				let dx = polygon[i].x-polygon[j].x;
				let dy = polygon[i].y-polygon[j].y;
				let ratio=dy/dx;
				let d2x=point.x-polygon[j].x;
				let d2y=ratio*d2x;
				let yAtX=polygon[j].y+d2y;

				if (yAtX>point.y){
					numCrosses+=1;
				}
			}
			j=i;
		}
		return (numCrosses%2===1);
	}
}

export interface ITween{
	onComplete?:(object:any)=>void;
	onUpdate?:(object:any)=>void;
}

export const tween = new class Tween{
	wait = (object:any,ticks:number,config:ITween={}) => {
		let cTicks:number=0;
		function _tickThis(){
			cTicks+=1;
			if (config.onUpdate) config.onUpdate(object);
			if (cTicks>ticks){
				events.ticker.remove(_tickThis);
				if (config.onComplete) config.onComplete(object);
			}
		}
		events.ticker.add(_tickThis);
	}

	to = (object:any,ticks:number,props:{[key:string]:number},config:ITween={}) => {
		if (props==null) return;
		let properties:any={};
		let cTicks:number=0;

		for (let v in props){
			if (v=="delay"){
				cTicks=-props[v];
			}else{
				properties[v]={start:object[v],end:props[v],inc:(props[v]-object[v])/ticks};
			}
		}
		function _tickThis(){
			cTicks+=1;
			if (config.onUpdate) config.onUpdate(object);
			if (cTicks>ticks){
				for (let v in properties){
					object[v]=properties[v].end;
				}
				events.ticker.remove(_tickThis);
				if (config.onComplete) config.onComplete(object);
			}else if (cTicks>=0){
				for (let v in properties){
					object[v]=properties[v].start+properties[v].inc*cTicks;
				}
			}
		}
		events.ticker.add(_tickThis);
	}
	from = (object:any,ticks:number,props:{[key:string]:number},config:ITween={}) => {
		if (props==null) return;

		let newProps:any={};

		for (var v in props){
			if (v=="delay"){
				newProps[v]=props[v];
			}else{
				newProps[v]=object[v];
				object[v]=props[v];
			}
		}
	
		this.to(object,ticks,props,config);
	}

	colorTo = (object:any,ticks:number,props:{[key:string]:number},config:ITween={}) => {
		if (!props) return;
		let properties:any={};
		let cTicks:number=0;
	
		for (var v in props){
			if (v=="delay"){
				cTicks=-props[v];
			}else{
				properties[v]={start:object[v],end:props[v],
					incR:Math.floor(props[v]/0x010000)-Math.floor(object[v]/0x010000)/ticks,
					incG:Math.floor((props[v]%0x010000)/0x000100)-Math.floor((object[v]%0x010000)/0x000100)/ticks,
					incB:Math.floor(props[v]%0x000100)-Math.floor(object[v]%0x000100)/ticks,
				};
			}
		}
		
		function _tickThis(){
			cTicks+=1;
			if (config.onUpdate) config.onUpdate(object);
			if (cTicks>ticks){
				for (let v in properties){
					object[v]=properties[v].end;
				}
				events.ticker.remove(_tickThis);
				if (config.onComplete) config.onComplete(object);
			}else if (cTicks>=0){
				for (var v in properties){
					object[v]=properties[v].start+Math.floor(properties[v].incR*cTicks)*0x010000+Math.floor(properties[v].incG*cTicks)*0x000100+Math.floor(properties[v].incB*cTicks);
				}
			}
		}
		events.ticker.add(_tickThis);
	}
}

export enum EventType{
	MOUSE_MOVE='mouseMove',
	MOUSE_DOWN='mouseDown',
	MOUSE_UP='mouseUp',
	MOUSE_CLICK='mouseClick',
	MOUSE_WHEEL='mouseWheel',

	KEY_DOWN='keyDown',
	KEY_UP='keyUp',

	UI_OVER='uiOver',
	UI_OFF='uiOff'
}

export const events = new class {
	private registry:{[key:string]:JMERegister}={};
	private activeRegistry:JMERegister[]=[];
	private tickEvents:Array<()=>void>=[];

	public clearAllEvents(){
		this.registry={};
		this.activeRegistry=[];
		this.tickEvents=[];
	}
	public ticker = {
		add:(output:()=>void)=>events.tickEvents.push(output),
		addOnce: (output: () => void) => {
			let m = () => {
				utils.pull(m, events.tickEvents);
				output();
			}
			events.tickEvents.push(m);
		},
		remove:(output:()=>void)=>utils.pull(output,events.tickEvents)
	}

	private createRegister(type:string){
		this.registry[type]=new JMERegister;
	}

	add (type:string,output:(event:any)=>void){
		if (!this.registry[type]) this.createRegister(type);

		this.registry[type].listeners.push(output);
	}

	addOnce (type:string,output:(event:any)=>void){
		if (!this.registry[type]) this.createRegister(type);

		this.registry[type].once.push(output);
	}

	remove (type:string,output:(event:any)=>void){
		if (this.registry[type]){
			utils.pull(output,this.registry[type].listeners);
		}
	}

	publish (type:string,event?:any){
		if (!this.registry[type]) this.createRegister(type);
		this.registry[type].events.push(event);

		if (!this.registry[type].active){
			this.registry[type].active=true;
			this.activeRegistry.push(this.registry[type]);
		}
	}

	selfPublish (register:JMERegister, event?:any, replaceCurrent?:boolean){
		if (replaceCurrent){
			register.events=[event];
		}else{
			register.events.push(event);
		}
		if (!register.active){
			register.active=true;
			this.activeRegistry.push(register);
		}
	}

	onTick=()=>{
		while (this.activeRegistry.length>0){
			let register=this.activeRegistry.shift();
			register.active=false;

			while (register.events.length>0){
				let event=register.events.shift();
				register.listeners.forEach(output=>output(event));

				while (register.once.length>0){
					register.once.shift()(event);
				}
			}
		}

		this.tickEvents.forEach(output=>output());
	}
}

class JMERegister{
	listeners:Array<Function>=[];
	once:Array<Function>=[];

	events:Array<any>=[];
	active:Boolean=false;
}

export class SelfRegister<T> extends JMERegister{
	constructor(private onlyLastListener?: boolean, private onlyLastEvent?:boolean){
		super();
	}

	addListener(output:(event:T)=>void){
		if (this.onlyLastListener) {
			this.listeners = [output];
		} else {
			this.listeners.push(output);
		}
	}

	removeListener(output:(event:T)=>void){
		utils.pull(output,this.listeners);
	}

	addOnce(output:(event:T)=>void){
		this.once.push(output);
	}

	publish(event?:T){
		events.selfPublish(this,event,this.onlyLastEvent);
	}
}

export class Rect extends PIXI.Rectangle{
	setLeft(n:number){
		this.width+=this.x-n;
		this.x=n;
	}

	setRight(n:number){
		this.width+=n-this.right;
	}

	setTop(n:number){
		this.height-=n-this.y;
		this.y=n;
	}

	setBot(n:number){
		this.height+=n-this.top;
	}
}

export const inputManager = new class {
	MOUSE_HOLD:number=200;
	mouse:MouseObject;
	app:PIXI.Application;

	public init (app:PIXI.Application) {
		this.app=app;
		this.mouse=new MouseObject();
		this.mouse.addCanvas(app.stage);

		window.addEventListener("keydown",this.onKeyDown);
		window.addEventListener("keyup",this.onKeyUp);

		window.addEventListener("mousewheel",this.onWheel);
	}

	onWheel=(e:WheelEvent)=>{
		events.publish(EventType.MOUSE_WHEEL,{mouse:this.mouse,deltaY:e.deltaY});
	}

	onKeyDown=(e:any)=>{
		//if (external keyboard override) dothat;
		switch(e.key){
			case "a": case "A": break;
			case "Control": this.mouse.ctrlKey=true; break;
		}

		events.publish(EventType.KEY_DOWN,{key:e.key});
	}

	onKeyUp=(e:any)=>{
		switch(e.key){
			case "Control": this.mouse.ctrlKey=false; break;
		}

		events.publish(EventType.KEY_UP,{key:e.key});
	}
}

export class MouseObject extends PIXI.Point{
	static HOLD:number=200;
	//x,y;
	clickMode:boolean=false;
	down:boolean=false;
	ctrlKey:boolean=false;
	drag:DragObject;
	timerRunning:boolean=false;
	onUI:boolean=false;

	id:number;
	disabled:boolean=false;
	touchMode=false;
	target:any;

	private canvas:PIXI.Container;

    locationFilter:Function;

	constructor(config:IMouseObject={}){
		super(config.x,config.y);
		this.down=config.down || false;
		this.drag=config.drag || null;
		this.id=config.id || 0;
	}

	addCanvas(canvas:PIXI.Container){
		
		// if (this.canvas){
		// 	this.removeCanvas();
		// }
		this.canvas=canvas;
		// canvas.on("mousedown",this.onDown);
		// canvas.on("mouseup",this.onUp);
		// if (interactionMode=="desktop"){
		// 	window.addEventListener("pointerup",this.onMouseUp);
		// }else{
		// 	window.addEventListener("touchend",this.onMouseUp);
		// }
		// canvas.on("mouseupoutside",this.onUp);
		// canvas.on("mousemove",this.onMove);
		canvas.addListener("touchstart",this.enableTouchMode);
		canvas.addListener("pointerdown",this.onDown);
		canvas.addListener("pointermove",this.onMove);
		canvas.addListener("pointerup",this.onUp);
		canvas.addListener("pointerupoutside",this.onUp);
	}

	// removeCanvas(){
	// 	this.canvas.off("mousedown",this.onDown);
	// 	this.canvas.off("mouseup",this.onUp);
	// 	this.canvas.off("mouseupoutside",this.onUp);
	// 	this.canvas.off("mousemove",this.onMove);
	// }

enableTouchMode=()=>{
	this.touchMode=true;
	this.canvas.removeListener("touchstart",this.enableTouchMode);
	this.canvas.addListener("mousedown",this.disableTouchMode);
	this.canvas.removeListener("pointerup",this.onUp);
	this.canvas.addListener("touchend",this.onUp);
}

disableTouchMode=()=>{
	this.touchMode=false;
	this.canvas.removeListener("mousedown",this.disableTouchMode);
	this.canvas.addListener("touchstart",this.enableTouchMode);
	this.canvas.removeListener("touchend",this.onUp);
	this.canvas.addListener("pointerup",this.onUp);
}


	startDrag=(target:any,onMove?:Function,onRelease?:Function,onDown?:Function,offset?:PIXI.Point)=>{
			target.selected=true;
			this.drag=new DragObject(target,onMove,onRelease,onDown,offset);
	}

	endDrag=()=>{
			if (this.drag){
					if (this.drag.release(this)){
							this.drag=null;
					}
			}
	}

	public onDown = (e) =>{
			this.onMove(e);

		this.down=true;
		if (this.disabled || this.timerRunning){
			return;
		}

		if (this.drag){
					if (this.drag.down && this.drag.down(this)){
						this.drag=null;
					}
				}else{
			if (this.clickMode){
				this.timerRunning=true;
				setTimeout(()=>{
					this.timerRunning=false;
					if (this.down){
						events.publish(EventType.MOUSE_DOWN,this);
					}
				},MouseObject.HOLD);
			}else{
				events.publish(EventType.MOUSE_DOWN,this);
			}
		}
	}

	public onUp = (e) =>{
    this.onMove(e);
		this.down=false;

		if (this.disabled){
      return;
		}
		if (this.drag){
			this.endDrag();
		}else{
			if (this.clickMode && this.timerRunning){
				events.publish(EventType.MOUSE_CLICK,this);
			}else{
				events.publish(EventType.MOUSE_UP,this);	
			}
		}
  }

  public onMove = (e) =>{
		this.target=e.target;
    if (e.target && e.target.isUI){
			this.onUI=true;
		}else{
			this.onUI=false;
		}
		
		let point:PIXI.Point=e.data.getLocalPosition(this.canvas);
		if (this.locationFilter){
			point=this.locationFilter(point,this.drag?this.drag.object:null);
		}
		this.set(point.x,point.y);
		
		if (this.disabled){
      return;
		}

		if (this.drag!=null){
			if (this.drag.move){
				this.drag.move(this);
			}
		}
		
		events.publish(EventType.MOUSE_MOVE,this);
  }
}

export class DragObject{
	object:any;
	private onRelease:Function;
	private onDown:Function;
	private onMove:Function;
	public offset:PIXI.Point;

	constructor(object:any,onMove?:Function,onRelease?:Function,onDown?:Function,offset?:PIXI.Point){
		this.object=object;
		this.onRelease=onRelease || this.nullFunc;
		this.onDown=onDown || this.nullFunc;
		this.onMove=onMove || this.nullFunc;
		this.offset=offset;
	}
	
	setOffset(x:number,y:number){
		this.offset=new PIXI.Point(x,y);
	}

	nullFunc(object:any,e:MouseObject){
		return true;
	};

	release(e:MouseObject):boolean{
		let m:boolean=this.onRelease(this.object,e);
		this.object.selected=!m;
		return m
	}
	
	move(e:MouseObject):boolean{
		return this.onMove(this.object,e);
	}

	down(e:MouseObject):boolean{
		let m:boolean=this.onDown(this.object,e);
		this.object.selected=!m;
		return m;
	}
}


export interface IMouseObject{
	x?:number,
	y?:number,
	down?:boolean,
	drag?:DragObject,
	id?:number,
}

export interface IKeyboardEvent{
	key:string;
}