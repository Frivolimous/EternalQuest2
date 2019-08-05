import * as JMBL from './JMBL';

export enum DisplayState{
	NORMAL,
	DARKENED,
	BLACKENED,
	GREYED,
	BRIGHTENED,
}

export const UICONFIG={
	CLICK_DELAY:200,
}

export class BasicElement extends PIXI.Container{
	isUI:boolean=true;
	graphics:PIXI.Graphics=new PIXI.Graphics;
	baseTint:number=0xffffff;
	label:PIXI.Text;

	constructor(public options:GraphicOptions){
		super();
		options=options || {};

		this.addChild(this.graphics);
		if (options.width!=null){
			this.graphics.beginFill(options.fill || 0xffffff);
			if (options.rounding!=null){
				this.graphics.drawRoundedRect(0,0,options.width,options.height,options.rounding);
			}else{
				this.graphics.drawRect(0,0,options.width,options.height);
			}
			this.graphics.alpha=options.alpha==null?1:options.alpha;
			this.graphics.tint=this.baseTint=options.bgColor || 0x808080;
		}
		
		this.x=options.x || 0;
		this.y=options.y || 0;

		if (options.label!=null){
			this.addLabel(options.label,options.labelStyle);
		}
	}

	addLabel(s:string,style?:PIXI.TextStyleOptions){
		if (this.label){
			this.label.text=s;
			if (style) this.label.style=new PIXI.TextStyle(style);
			this.label.scale.set(1,1);
		}else{
			this.label=new PIXI.Text(s,style || {});
			this.addChild(this.label);
		}
		if (this.label.width>this.graphics.width*0.9){
			this.label.width=this.graphics.width*0.9;
		}
		this.label.scale.y=this.label.scale.x;
		this.label.x=(this.getWidth()-this.label.width)/2;
		this.label.y=(this.getHeight()-this.label.height)/2;
	}

	getWidth=():number=>{
		return this.graphics.width;
	}

	getHeight=():number=>{
		return this.graphics.height;
	}

	flashing:boolean;
	colorFlash(color:number,ticksUp:number,wait:number,ticksDown:number){
		if (this.flashing) return;
		this.flashing=true;
		JMBL.tween.colorTo(this.graphics,ticksUp,{tint:color},{onComplete:()=>JMBL.tween.colorTo(this.graphics,ticksDown,{delay:wait,tint:this.baseTint},{onComplete:()=>(this.flashing=false)})});
	}
}

export class InteractiveElement extends BasicElement{
	downFunction:Function;
	overlay:PIXI.Graphics;
	displayState:DisplayState;
	disabled:boolean;
	draggable:boolean;
	selectRect:PIXI.Graphics;
	protected _Selected:boolean;

	constructor(options:GraphicOptions){
		super(options);
		this.overlay=new PIXI.Graphics();
		this.overlay.beginFill(0xffffff);
		this.overlay.drawRect(0,0,this.graphics.width,this.graphics.height);
		options=options || {};
		this.interactive=true;
		if (options.downFunction!=null){
			this.downFunction=options.downFunction;
			this.on("pointerdown",this.downFunction);
		}
		options.displayState=options.displayState || DisplayState.NORMAL;
		this.setDisplayState(options.displayState);
	}

	setDisplayState=(_state:DisplayState)=>{
		if (this.displayState==_state) return;
		this.displayState=_state;

		switch(_state){
			case DisplayState.DARKENED:
				this.overlay.tint=0;
				this.overlay.alpha=0.5;
				this.addChild(this.overlay);
				break;
			case DisplayState.BLACKENED:
				this.overlay.tint=0;
				this.overlay.alpha=0.8;
				this.addChild(this.overlay);
				break;
			case DisplayState.GREYED:
				this.overlay.tint=0x999999;
				this.overlay.alpha=0.5;
				this.addChild(this.overlay);
				break;
			case DisplayState.BRIGHTENED:
				this.overlay.tint=0xffffff;
				this.overlay.alpha=0.3;
				this.addChild(this.overlay);
				break;
			case DisplayState.NORMAL: 
			default:
				this.overlay.alpha=0;
		}
	}

	get selected():boolean{
		return this._Selected;
	}

	set selected(b:boolean){
		if (b){
			if (this.selectRect==null){
				this.selectRect=new PIXI.Graphics;
				this.selectRect.lineStyle(3,0xffff00);
				this.selectRect.drawRect(this.graphics.x,this.graphics.y,this.graphics.width,this.graphics.height);
			}
			this.addChild(this.selectRect);
		}else{
			if (this.selectRect!=null && this.selectRect.parent!=null) this.selectRect.parent.removeChild(this.selectRect);
		}
		this._Selected=b;
	}
}

export class Button extends InteractiveElement{
	output:Function;
	onOver:Function;
	onOut:Function;
	downOnThis:boolean=false;
	timeout:boolean=null;
	protected _Disabled:boolean;

	constructor(options:GraphicOptions){
		super(JMBL.utils.default(options,{
			x:50, y:50, width:200, height:50, bgColor:0x8080ff,
		}));
		this.output=options.output;
		this.onOut=options.onOut;
		this.onOver=options.onOver;
		this.buttonMode=true;

		if (JMBL.interactionMode==="desktop"){
			this.addListener("pointerover",(e:any)=>{
				if (!this.disabled){
					this.setDisplayState(DisplayState.DARKENED);
					if (this.onOver){
						this.onOver();
					}
				}
			});

			this.addListener("pointerout",(e:any)=>{
				if (!this.disabled){
					this.setDisplayState(DisplayState.NORMAL);
					if (this.onOut){
						this.onOut();
					}
				}
				this.downOnThis=false;
			});

			//JMBL.events.add(JMBL.EventType.MOUSE_DOWN,(e:any)=>{
			this.addListener("pointerdown",()=>{
				if (!this.disabled) this.setDisplayState(DisplayState.BRIGHTENED);
				this.downOnThis=true;
				if (this.timeout===false){
					this.timeout=true;
					
					window.setTimeout(()=>{this.timeout=false},UICONFIG.CLICK_DELAY);
				}
			});
			//JMBL.events.add(JMBL.EventType.MOUSE_UP,(e:any)=>{
			this.addListener("pointerup",()=>{
				if (!this.disabled) this.setDisplayState(DisplayState.DARKENED);
				if (this.downOnThis && !this.disabled && this.output!=null && this.timeout!==false) this.output();
				this.downOnThis=false;
			});
		}else{
			//JMBL.events.add(JMBL.EventType.MOUSE_UP,(e:any)=>{
			this.addListener("touchend",()=>{
				if (!this.disabled && this.output!=null) this.output();
			});
		}
	}
	get disabled():boolean{
		return this._Disabled;
	}

	set disabled (b:boolean){
		this._Disabled=b;
		if (b){
			this.setDisplayState(DisplayState.BLACKENED);
		}else{
			this.setDisplayState(DisplayState.NORMAL);
		}
	}
}

export class HorizontalStack extends PIXI.Container{
	padding:number=5;

	constructor(width:number=-1){
		super();
	}

	addElement(v:PIXI.DisplayObject){
		this.addChild(v);
	}

	alignAll(){
		let children = this.children as BasicElement[];
		// let totalWidth:number=-this.padding;
		// for (let i=0;i<children.length;i++){
		// 	totalWidth+=children[i].getWidth();
		// 	totalWidth+=this.padding;
		// }
		let cX=0;
		for (let i=0;i<children.length;i++){
			children[i].x=cX;
			cX+=children[i].width+this.padding;
		}
	}
}

export class ClearButton extends InteractiveElement{
	constructor (options:GraphicOptions){
		super(JMBL.utils.default(options,{
			bgColor:0x00ff00,
			alpha:0.01,
			width:190,
			height:50,
			x:0,
			y:0,
		}));

		this.buttonMode=true;
	}
}

export class SelectButton extends Button{
	index:number;
	myList:Array<SelectButton>;
	selectFunction:Function;

	constructor(index:number,selectList:Array<SelectButton>,selectFunction:(n:number)=>void,options:GraphicOptions=null){
		super(options);
		this.index=index;
		this.myList=selectList;
		this.output=this.selectThis;
		this.selectFunction=selectFunction;
	}

	selectThis(){
		if (this.selected) return;

		for (var i=0;i<this.myList.length;i+=1){
			this.myList[i].selected = this.myList[i]===this;
		}
		this.selectFunction(this.index);
	}
}

export class MaskedWindow extends BasicElement{
	mask:PIXI.Graphics=new PIXI.Graphics;
	objects:Array<any>=[];
	autoSort:boolean;
	offset:number=0;
	goalY:number=1;
	scrollbar:Scrollbar=null;
	container:PIXI.Container;
	vY:number=0;
	sortMargin:number=5;
	dragging:boolean=false;
	scrollHeight:number=0;
	horizontal:boolean=false;

	constructor(container?:PIXI.Container,options?:MaskedWindowOptions){
		super(options);
		options=options||{};
		if (container){
			this.container=container;
		}else{
			this.container=new PIXI.Sprite;
		}
		this.addChild(this.container);
		this.addChild(this.mask);
		this.mask.beginFill(0);
		this.mask.drawRect(0,0,options.width||50,options.height||100);
		this.autoSort=options.autoSort||false;
		this.interactive=true;
		this.sortMargin=options.sortMargin||5;
		this.horizontal=options.horizontal;
		
		this.on("mousedown",(e:PIXI.interaction.InteractionEvent) => {
			if (e.target!==this){
				return;
			}
			let point:PIXI.Point=e.data.getLocalPosition(this);
			if (this.horizontal){
				this.offset=point.x-this.x-this.container.x;
			}else{
				this.offset=point.y-this.y-this.container.y;
			}
			this.dragging=true;
		});

		this.on("mouseup",() => {
			this.goalY=1;
			this.dragging=false;
		});

		this.on("mouseupoutside",() => {
			this.goalY=1;
			this.dragging=false;
		});

		this.on("mousemove",(e:PIXI.interaction.InteractionEvent) => {
			let point:PIXI.Point=e.data.getLocalPosition(this);
			if (this.dragging){
				if (this.horizontal){
					this.goalY=point.x-this.x-this.offset;
					this.vY=(this.goalY-this.container.x)/4;
				}else{
					this.goalY=point.y-this.y-this.offset;
					this.vY=(this.goalY-this.container.y)/4;
				}
			}
		});
		
		JMBL.events.ticker.add(this.update);
		//JMBL.events.add(JMBL.EventType.MOUSE_WHEEL,this.onWheel);
	}
	addScrollbar=(_scrollbar:Scrollbar)=>{
		this.scrollbar=_scrollbar;
		_scrollbar.output=this.setScroll;
	}

	onWheel=(e:any)=>{
		if (e.mouse.x>this.x && e.mouse.x<this.x+this.mask.width && e.mouse.y>this.y && e.mouse.y<this.y+this.mask.height){
			this.vY-=e.delta*0.008;
		}
	}

	setScroll=(p:number)=>{
		if (this.horizontal){
			if (this.scrollHeight>this.mask.width){
				this.container.x=p*(this.mask.width-this.scrollHeight);
				if (this.container.x>0) this.container.x=0;
				if (this.container.x<this.mask.width-this.scrollHeight) this.container.x=this.mask.width-this.scrollHeight;
			}else{
				this.container.x=0;
			}
		}else{
			if (this.scrollHeight>this.mask.height){
				this.container.y=p*(this.mask.height-this.scrollHeight);
				if (this.container.y>0) this.container.y=0;
				if (this.container.y<this.mask.height-this.scrollHeight) this.container.y=this.mask.height-this.scrollHeight;
			}else{
				this.container.y=0;
			}
		}
	}
	getRatio=():number=>{
		if (this.horizontal){
			return Math.min(1,this.mask.width/this.scrollHeight);
		}else{
			return Math.min(1,this.mask.height/this.scrollHeight);
		}
	}

	update=()=> {
		if (this.horizontal){
			if (this.goalY<=0){
				this.vY=(this.goalY-this.container.x)/4;
			}
			if (this.vY!=0){
				if (Math.abs(this.vY)<0.1) this.vY=0;
				else{
					let _y:number=this.container.x+this.vY;
					_y=Math.min(0,Math.max(_y,this.mask.width-this.scrollHeight));
					this.vY*=0.95;	
					if (this.scrollbar!=null) this.scrollbar.setPosition(_y/(this.mask.width-this.scrollHeight));
					else this.setScroll(_y/(this.mask.width-this.scrollHeight));
				}	
			}
		}else{
			if (this.goalY<=0){
				this.vY=(this.goalY-this.container.y)/4;
			}
			if (this.vY!=0){
				if (Math.abs(this.vY)<0.1) this.vY=0;
				else{
					let _y:number=this.container.y+this.vY;
					_y=Math.min(0,Math.max(_y,this.mask.height-this.scrollHeight));
					this.vY*=0.95;	
					if (this.scrollbar!=null) this.scrollbar.setPosition(_y/(this.mask.height-this.scrollHeight));
					else this.setScroll(_y/(this.mask.height-this.scrollHeight));
				}	
			}
		}
	}

	addObject=(_object:any)=>{
		this.objects.push(_object);
		_object.x-=this.x-this.container.x;
		_object.y-=this.y-this.container.y;
		this.container.addChild(_object);
		if (this.autoSort) this.sortObjects();
	}

	removeObject=(_object:any)=>{
		for (var i=0;i<this.objects.length;i+=1){
			if (this.objects[i]==_object){
				this.removeObjectAt(i);
				return;
			}
		}
	}

	removeObjectAt=(i:number)=>{
		this.container.removeChild(this.objects[i]);
		this.objects.splice(i,1);
		if (this.autoSort) this.sortObjects();
	}

	sortObjects=()=>{
		this.scrollHeight=this.sortMargin;
		for (var i:number=0;i<this.objects.length;i+=1){
			if (this.horizontal){
				this.objects[i].x=this.scrollHeight;
				//this.objects[i].x=this.objects[i].graphics.width/2;
				this.objects[i].timeout=false;
				this.objects[i].y=0;
				this.scrollHeight+=this.objects[i].graphics.width+this.sortMargin;
			}else{
				this.objects[i].y=this.scrollHeight;
				//this.objects[i].x=this.objects[i].graphics.width/2;
				this.objects[i].timeout=false;
				this.objects[i].x=0;
				this.scrollHeight+=this.objects[i].graphics.height+this.sortMargin;
			}
 		}
	}

	updateScrollHeight(){
		if (this.horizontal){
			this.scrollHeight=(this.container as any).getWidth();
			
		}else{
			this.scrollHeight=(this.container as any).getHeight();
		}
	}
}

export class Gauge extends BasicElement{
	value:number;
	max:number;
	percent:number;
	front:PIXI.Graphics;

	constructor(color:number=0x00ff00,options:GraphicOptions={}){
		super(JMBL.utils.default(options,{
			width:100,height:20,bgColor:0x101010}));
		this.front=new PIXI.Graphics();
		this.front.beginFill(color);
		this.front.drawRect(this.graphics.x,this.graphics.y,this.graphics.width,this.graphics.height);
		this.addChild(this.front);
	}

	setValue(value:number,max:number=-1){
		if (max>=1) this.max=max;
		this.value=value;
		this.percent=this.value/this.max;
		this.front.width=Math.floor(Math.max(1,Math.min(this.percent*this.graphics.width,this.graphics.width)));
	}

	setMax(max:number){
		if (max>=1) this.max=max;
		this.percent=this.value/this.max;
		this.front.width=Math.floor(Math.max(1,Math.min(this.percent*this.graphics.width,this.graphics.width)));
	}
}

export class Scrollbar extends BasicElement{
	mover:PIXI.Graphics=new PIXI.Graphics();
	output:Function;
	topY:number=0;
	bottomY:number=40;
	dragging:boolean;
	moverColor:number;
	offset:number=0;
	ratio:number;
	horizontal:boolean=false;

	constructor(options:ScrollbarOptions){
		super(JMBL.utils.default(options,{
			x:100, y:50, width:10, height:100, rounding:5,bgColor:0x404080, horizontal:false,
		}));
		this.addChild(this.mover);
		this.output=options.output;
		this.horizontal=options.horizontal;
		this.interactive=true;
		this.buttonMode=true;
		this.moverColor=options.moverColor || 0x333333;
		this.ratio=options.ratio || 0.5;
		this.drawMover(this.ratio);
		this.setPosition(options.position || 0);
		
		this.on("mousedown",(e:PIXI.interaction.InteractionEvent) => {
			let point:PIXI.Point=e.data.getLocalPosition(this);
			this.dragging=true;
			if (this.horizontal){
				this.offset=point.x-this.x-this.mover.x;
			}else{
				this.offset=point.y-this.y-this.mover.y;
			}
		});

		this.on("mouseup",() => {
			this.dragging=false;
		});

		this.on("mouseupoutside",() => {
			this.dragging=false;
		});

		this.on("mousemove",(e) => {
			if (this.dragging){
				//this.mover.y=e.mouse.y-this.y-this.offsetY;
				let point:PIXI.Point=e.data.getLocalPosition(this);
				if (this.horizontal){
					let _x:number=point.x-this.x-this.offset;
					_x=Math.max(_x,this.topY);
					_x=Math.min(_x,this.bottomY);
					this.mover.x=_x;
				}else{
					let _y:number=point.y-this.y-this.offset;
					_y=Math.max(_y,this.topY);
					_y=Math.min(_y,this.bottomY);
					this.mover.y=_y;
				}
				if (this.output) this.output(this.getPosition());
			}
		});
	}

	drawMover=(p:number)=>{
		//p = 0-1
		p=Math.min(1,Math.max(0,p));
		if (p>=1) this.visible=false;
		else this.visible=true;

		this.mover.clear();
		this.mover.beginFill(this.moverColor);
		if (this.horizontal){
			this.mover.drawRoundedRect(0,0,p*this.graphics.width,this.graphics.height,this.graphics.height/2);
			this.bottomY=this.graphics.width-this.mover.width;
		}else{
			this.mover.drawRoundedRect(0,0,this.graphics.width,p*this.graphics.height,this.graphics.width/2);
			this.bottomY=this.graphics.height-this.mover.height;
		}
	}

	setPosition=(p:number)=>{
		if (this.horizontal){
			let _x:number=p*(this.bottomY-this.topY)+this.topY;
			this.mover.x=_x;
		}else{
			let _y:number=p*(this.bottomY-this.topY)+this.topY;
			this.mover.y=_y;
		}
 		if (this.output!=null) this.output(p);
	}

	getPosition=()=>{
		//returns 0-1
		if (this.horizontal){
			return (this.mover.x-this.topY)/(this.bottomY-this.topY);
		}else{
			return (this.mover.y-this.topY)/(this.bottomY-this.topY);
		}
	}


	startMove=(e:any)=>{
		if (this.horizontal){
			this.offset=e.x-this.x-this.mover.x;
		}else{
			this.offset=e.y-this.y-this.mover.y;
		}
		
		this.dragging=true;
	}
}

export interface GraphicOptions{
	width?:number,
	height?:number,
	x?:number,
	y?:number,
	bgColor?:number,
	fill?:number,
	rounding?:number,
	alpha?:number,
	label?:string,
	labelStyle?:PIXI.TextStyleOptions,

	output?:Function,
	downFunction?:Function,
	onOver?:Function,
	onOut?:Function,
	displayState?:DisplayState,
}

export interface MaskedWindowOptions extends GraphicOptions{
	maskHeight?:number,
	maskWidth?:number,
	autoSort?:boolean,
	sortMargin?:number,
	horizontal?:boolean,
}

export interface ScrollbarOptions extends GraphicOptions{
	output?:Function,
	moverColor?:number,
	ratio?:number,
	position?:number,
	horizontal?:boolean,
}