import * as JMBL from './JMGE/JMBL';
import { TextureData } from './TextureData';
import { CONFIG } from './Config';
import { SaveData } from './utils/SaveData';
import { MenuUI } from './menus/MenuUI';

export class Facade {
    public static app: PIXI.Application;
    public static stageBorders;

    public static navTo(o: PIXI.Container) {
        Facade.instance.updateCurrentModule(o);
    }

    public static navBack() {
        Facade.instance.navToPreviousModule();
    }

    private static instance: Facade;

    public currentModule: any;

    private app: PIXI.Application;
    private _Resolution = CONFIG.INIT.RESOLUTION;
    private previousModules: PIXI.Container[] = [];

    // windowToLocal=(e:any):PIXI.Point=>{
    //   return new PIXI.Point((e.x+Facade.stageBorders.x)*this._Resolution,(e.y+Facade.stageBorders.y)*this._Resolution);
    // }

    // disableGameInput(b:Boolean=true){
    // 	if (b){
    // 		this.inputM.mouseEnabled=false;
    // 	}else{
    // 		this.inputM.mouseEnabled=true;
    // 	}
    // }

    constructor() {
        if (Facade.instance) throw new Error('Cannot instatiate more than one Facade Singleton.');

        Facade.instance = this;

        try {
            document.createEvent('TouchEvent');
            JMBL.setInteractionMode('mobile');
        } catch (e) { }

        Facade.stageBorders = new JMBL.Rect(0, 0, CONFIG.INIT.STAGE_WIDTH / this._Resolution, CONFIG.INIT.STAGE_HEIGHT / this._Resolution);
        this.app = new PIXI.Application(Facade.stageBorders.width, Facade.stageBorders.height, {
            backgroundColor: 0xff0000,
            antialias: true,
            resolution: this._Resolution,
            roundPixels: true,
        });
        Facade.app = this.app;
        (document.getElementById('game-canvas') as any).append(this.app.view);

        // if (this.app){
        // 	let test=PIXI.Sprite.fromImage('./Bitmaps/a ship sprite sheet.png')
        // 	this.app.stage.addChild(test);
        // 	return;
        // }
        Facade.stageBorders.width *= this._Resolution;
        Facade.stageBorders.height *= this._Resolution;

        this.app.stage.scale.x = 1 / this._Resolution;
        this.app.stage.scale.y = 1 / this._Resolution;
        Facade.stageBorders.x = this.app.view.offsetLeft;
        Facade.stageBorders.y = this.app.view.offsetTop;
        this.app.stage.interactive = true;

        let _background = new PIXI.Graphics();
        _background.beginFill(CONFIG.INIT.BACKGROUND_COLOR);
        _background.drawRect(0, 0, Facade.stageBorders.width, Facade.stageBorders.height);
        this.app.stage.addChild(_background);

        // window.addEventListener('resize',()=>{
        // 	Facade.stageBorders.left=this.app.view.offsetLeft;
        // 	Facade.stageBorders.top=this.app.view.offsetTop;
        // });

        JMBL.init(this.app);
        TextureData.init(this.app.renderer);
        window.setTimeout(this.init, 10);
    }

    private  init = () => {
        // this will happen after 'preloader'

        initializeDatas();
        SaveData.init();
        // new ScoreTracker();

        this.currentModule = new MenuUI();
        this.currentModule.navOut = this.updateCurrentModule;
        this.app.stage.addChild(this.currentModule);
    }

    private updateCurrentModule(nextModule: PIXI.Container) {
        this.previousModules.push(this.currentModule);
        this.currentModule.parent.removeChild(this.currentModule);
        this.currentModule = nextModule;

        SaveData.saveExtrinsic(() => {
            this.app.stage.addChild(this.currentModule);
        });
    }

    private navToPreviousModule() {
        if (this.previousModules.length > 0) {
            let nextModule = this.previousModules.pop();
            if (this.currentModule.dispose) {
                this.currentModule.dispose();
            } else {
                this.currentModule.destroy();
            }
            this.currentModule = nextModule;

            SaveData.saveExtrinsic(() => {
                this.app.stage.addChild(this.currentModule);
            });
        }
    }
}

new Facade();

function initializeDatas() {
}
