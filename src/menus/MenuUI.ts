import * as JMBUI from '../JMGE/JMBUI';
import { CONFIG } from '../Config';
import { MuterOverlay } from './muterOverlay';
import { Facade } from '../index';
import { GameUI } from '../game/GameUI';

export class MenuUI extends PIXI.Container{
	constructor(){
		super();
		let background = new JMBUI.BasicElement({width:CONFIG.INIT.STAGE_WIDTH,height:CONFIG.INIT.STAGE_HEIGHT,bgColor:0x666666,label:"Eternal\n  Quest",labelStyle:{fontSize:30,fill:0x3333ff}});
		background.label.x+=50;
		this.addChild(background);
		let _button:JMBUI.Button=new JMBUI.Button({width:100,height:30,x:200,y:200,label:"Start",output:this.startGame});
		this.addChild(_button);
		_button=new JMBUI.Button({width:100,height:30,x:200,y:240,label:"High Score",output:this.nullFunc});
		this.addChild(_button);
		_button=new JMBUI.Button({width:100,height:30,x:200,y:280,label:"View Badges",output:this.navBadges});
		this.addChild(_button);
		_button=new JMBUI.Button({width:100,height:30,x:200,y:320,label:"More Games",output:this.nullFunc});
		this.addChild(_button);
		_button=new JMBUI.Button({width:100,height:30,x:200,y:360,label:"Credits",output:this.nullFunc});
		this.addChild(_button);

		let muter=new MuterOverlay();
		muter.x=CONFIG.INIT.STAGE_WIDTH-muter.getWidth();
		muter.y=CONFIG.INIT.STAGE_HEIGHT-muter.getHeight();
		this.addChild(muter);
	}

	nullFunc=()=>{}

	startGame=()=>{
		Facade.navTo(new GameUI());
		// this.navForward(new LevelSelectUI);
		// this.navForward(new GameManager());
	}

	navBadges=()=>{
		// this.navForward(new BadgesUI);
	}
}