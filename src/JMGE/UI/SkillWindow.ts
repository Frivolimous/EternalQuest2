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