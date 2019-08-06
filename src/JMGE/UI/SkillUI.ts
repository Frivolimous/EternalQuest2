import * as JMBUI from '../JMBUI';
import * as JMBL from '../JMBL';

// import { EffectModifier } from '../../TDDR/Objects/EffectSandbox';

export interface SkillBlock {
    name: string;
    index: number;
    position: number;

    level?: number;
    maxLevel?: number;

    values: SkillValue;

    prerequisite?: number;
}

export interface SkillValue {
    attack?: { [key: string]: SkillProperty | number };
    effects?: EffectBlock[];
    base?: { [key: string]: SkillProperty | number };
}

export interface EffectBlock {
    type: any,
    data: (SkillProperty | number)[],
    modifier?: any,
    // modifier?:EffectModifier,
}

export interface SkillProperty {
    base?: number, // base is same as level[0]
    linear?: number,
    diminish?: number,
    compound?: number,
    random?: number, // % that the BASE ONLY is randomized
    level?: number[] // # - only used at that level number
}

const exampleSkill: SkillBlock = {
    name: 'Size', index: 0, position: 3, level: 0, maxLevel: 3,
    values: {
        attack: {
            power: { base: 5, linear: 2 },
            speed: { base: 1, diminish: 0.5 },
            range: { base: 10, level: [, , 10, , , 10, , , , , 10] },
        },
        effects: [{ type: "effectType", data: [{ base: 3 }] }],
        base: {
            health: 100,
        }
    }
}

export interface ISkillButton extends JMBUI.GraphicOptions {
    showLevels?: boolean,
    levelFormat?: PIXI.TextStyleOptions,
}

const DSKillButton: ISkillButton = {
    width: 40,
    height: 40,
    labelStyle: { fill: 0xf1f1f1, fontSize: 14 },
    bgColor: 0x112266,
    showLevels: false,
}

export class SkillIcon extends JMBUI.InteractiveElement {
    counter: PIXI.Text;

    constructor(public data: SkillBlock, options: ISkillButton) {
        super(JMBL.utils.default(options, DSKillButton));
        this.addLabel(data.name, options.labelStyle);
        data.maxLevel = data.maxLevel || 1;
        data.level = data.level || 0;
        this.buttonMode = true;

        if (data.level === 0) this.setDisplayState(JMBUI.DisplayState.DARKENED);
        else if (data.level >= data.maxLevel) this.setDisplayState(JMBUI.DisplayState.BRIGHTENED);

        if (options.showLevels) {
            let s: string = (data.level <= 10 ? "0" : "") + String(data.level);
            s += "/" + (data.maxLevel <= 10 ? "0" : "") + String(data.maxLevel);
            this.counter = new PIXI.Text(s, options.levelFormat || { fill: this.label.style.fill, fontSize: 8 });
            this.counter.x = this.graphics.width / 2 - this.counter.width / 2;
            this.counter.y = this.graphics.height - 10;
            this.addChild(this.counter);
        }
    }

    errorFlash() {
        this.colorFlash(0xff0000, 15, 35, 25);
    }
}

const DSkillWindow: JMBUI.GraphicOptions = { width: 400, height: 400, fill: 0xff9933, bgColor: 0xffffff, alpha: 0.9 };

export class SkillWindow extends JMBUI.BasicElement {
    icons: Array<SkillIcon>;

    constructor(private blocks: Array<SkillBlock>, private callback: (data: SkillIcon) => any, private skillpoints: number, options: JMBUI.GraphicOptions = {}, private iconOptions: JMBUI.GraphicOptions = {}) {
        super(JMBL.utils.default(options, DSkillWindow));
        this.iconOptions.downFunction = ((callback: Function) => function () { callback(this) })(this.iconCallback);

        this.update();
    }

    update = () => {
        let innerHor: number = this.graphics.width * 0.08;
        let innerVer: number = this.graphics.height * 0.08;
        let innerX: number = this.graphics.width * 0.1;
        let innerY: number = this.graphics.height * 0.1;

        this.icons = [];
        this.graphics.lineStyle(2, 0xf1f1f1); //options.borderColor

        for (var i = 0; i < this.blocks.length; i += 1) {
            this.icons[i] = new SkillIcon(this.blocks[i], this.iconOptions);
            this.icons[i].x = (this.icons[i].data.position % 10) * innerHor + innerX - this.icons[i].getWidth() / 2;
            this.icons[i].y = Math.floor(this.icons[i].data.position * .1) * innerVer + innerY - this.icons[i].getHeight() / 2;
            if (this.skillpoints >= 1) {
                if (this.canLevel(this.icons[i])) {
                    this.icons[i].selected = true;
                }
            }
            this.addChild(this.icons[i]);

            if (this.icons[i].data.prerequisite) {
                let prereq: SkillIcon = JMBL.utils.find(this.icons, (icon: SkillIcon) => (icon.data.index === this.icons[i].data.prerequisite));
                if (this.icons[i].data.level === 0 && prereq.data.level === 0) {
                    this.icons[i].setDisplayState(JMBUI.DisplayState.BLACKENED);
                }

                let x1 = (this.icons[i].data.position % 10) * innerHor + innerX;
                let y1 = Math.floor(this.icons[i].data.position * 0.1) * innerVer + innerY;
                let x2 = (prereq.data.position % 10) * innerHor + innerX;
                let y2 = Math.floor(prereq.data.position * 0.1) * innerVer + innerY;
                this.graphics.moveTo(x1, y1);
                this.graphics.lineTo(x2, y2);
            }
        }
    }

    canLevel = (icon: SkillIcon): boolean => {
        return (this.skillpoints > 0 &&
            icon.data.level < icon.data.maxLevel &&
            (!icon.data.prerequisite || JMBL.utils.find(this.icons, (e: SkillIcon) => (e.data.index === icon.data.prerequisite)).data.level > 0));
    }

    iconCallback = (icon: SkillIcon) => {
        if (this.canLevel(icon)) {
            this.callback(icon);
            this.refresh();
        } else {
            icon.errorFlash();
        }
    }

    refresh = () => {
        while (this.icons.length > 0) {
            this.icons.shift().destroy();
        }
        this.update();
    }
}

abstract class Skillable {
    effects: any[];

    static effectFromType(type: any, a: any[]) {

    }

    applyLevelStats = (data: SkillValue, level: number) => {
        for (let v in data) {
            if (v === "effects") {
                (data[v] as EffectBlock[]).forEach((e) => {
                    let a: number[] = e.data.map(e => this.getStatValue(e, level));
                    for (var i = 0; i < this.effects.length; i++) {
                        if (this.effects[i].type === e.type) {
                            this.effects[i].levelup(...a);
                            return;
                        }
                    }
                    this.effects.push(Skillable.effectFromType(e.type, a)); //replace this with location of effect generator
                });
            } else {
                this[v] += this.getStatValue((data[v] as SkillProperty), level);
            }
        }
    }

    getStatValue = (stat: SkillProperty | number, level: number): number => {
        let m = 0;
        if (Number(stat) === stat) {
            return Number(stat);
        }
        let stat2: SkillProperty = stat as SkillProperty;
        if (level === 0) {
            m += stat2.base || 0;
            return m;
        }
        if (stat2.linear) {
            m += stat2.linear;
        }

        if (stat2.compound) {
            m += JMBL.utils.compound(stat2.compound, 0.2, level); //change this to desired formula
        }

        if (stat2.diminish) {
            m += JMBL.utils.diminish(stat2.diminish, 0.2, level); //change this to desired formula
        }

        if (stat2.level && stat2.level[level]) {
            m += stat2.level[level];
        }

        return m;
    }
}

export class StatValue {
    private base: number = 0;
    private mult: number = 1;
    private neg: number = 0;
    public percentMode: boolean = false;

    static getValue(stat: SkillProperty | number = 0, level: number): number {
        let m = 0;
        if (Number(stat) === stat) {
            return Number(stat);
        }
        stat = stat as SkillProperty;
        if (level === 0) {
            m += stat.base || 0;
            if (stat.random) {
                m *= (1 - stat.random + Math.random() * stat.random * 2);
            }
            return m;
        }
        if (stat.linear) {
            m += stat.linear;
        }

        if (stat.compound) {
            m += JMBL.utils.compound(stat.compound, 0.2, level); //change this to desired formula
        }

        if (stat.diminish) {
            m += JMBL.utils.diminish(stat.diminish, 0.2, level); //change this to desired formula
        }

        if (stat.level && stat.level[level]) {
            m += stat.level[level];
        }

        return m;
    }

    constructor(stat: SkillProperty | number = 0, level?: number) {
        this.applyLevelStats(stat, level || 0);
    }

    applyLevelStats(stat: SkillProperty | number = 0, level: number) {
        if (Number(stat) === stat) {
            this.base += Number(stat);
        }

        stat = (stat as SkillProperty);

        if (level === 0) {
            this.base += stat.base || 0;
            if (stat.random) {
                this.base *= (1 - stat.random + Math.random() * stat.random * 2);
            }
        } else {
            if (stat.linear) {
                this.base += stat.linear;
            }

            if (stat.compound) {
                this.base += JMBL.utils.compound(stat.compound, 0.2, level); //change this to desired formula
            }

            if (stat.diminish) {
                this.base += JMBL.utils.diminish(stat.diminish, 0.2, level); //change this to desired formula
            }

            if (stat.level && stat.level[level]) {
                this.base += stat.level[level];
            }
        }
    }

    special: () => number;

    toNumber(): number {
        let m: number = this.base * this.mult - this.neg;
        if (this.special) {
            m += this.special();
        }
        return m;
    }

    toString(places: number = -1): string {
        if (places === -1) {
            return String(this.toNumber());
        }
        let tens = Math.pow(10, places);

        return String(Math.round(this.toNumber() * tens) / tens);

    }

    set(n: number) {
        this.base = n;
        this.neg = 0;
    }

    setMult(n: number) {
        this.mult = n;
    }

    add(n: number) {
        if (this.percentMode && n < 0) {
            this.neg -= n;
        } else {
            this.base += n;
        }
    }

    sub(n: number) {
        if (this.percentMode && n < 0) {
            this.neg += n;
        } else {
            this.base -= n;
        }
    }

    addMult(n: number) {
        this.mult *= n;
    }

    subMult(n: number) {
        this.mult /= n;
    }
}