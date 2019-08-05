var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define("JMGE/JMBL", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.initialized = false;
    exports.interactionMode = 'desktop';
    function setInteractionMode(s) {
        this.interactionMode = s;
    }
    exports.setInteractionMode = setInteractionMode;
    function init(app) {
        app.ticker.add(exports.events.onTick);
        exports.textures.renderer = app.renderer;
        exports.inputManager.init(app);
        exports.initialized = true;
    }
    exports.init = init;
    exports.textures = new (function () {
        function class_1() {
            this.cache = {};
        }
        class_1.prototype.addTextureFromGraphic = function (graphic, id) {
            var m = this.renderer.generateTexture(graphic);
            if (id) {
                this.cache[id] = m;
            }
            return m;
        };
        class_1.prototype.getTexture = function (id) {
            if (this.cache[id]) {
                return this.cache[id];
            }
            else {
                return PIXI.Texture.WHITE;
            }
        };
        return class_1;
    }());
    exports.utils = new (function () {
        function class_2() {
        }
        class_2.prototype.clone = function (obj) {
            if (Array.isArray(obj)) {
                var m = [];
                for (var i = 0; i < obj.length; i++) {
                    m.push(obj[i]);
                }
                return m;
            }
            else if (obj === Object(obj)) {
                var m = {};
                for (var v in obj) {
                    m[v] = obj[v];
                }
                return m;
            }
            return obj;
        };
        class_2.prototype.deep = function (obj) {
            if (Array.isArray(obj)) {
                var m = [];
                for (var i = 0; i < obj.length; i += 1) {
                    m.push(this.deep(obj[i]));
                }
                return m;
            }
            else if (obj === Object(obj)) {
                var m = {};
                for (var v in obj) {
                    m[v] = this.deep(obj[v]);
                }
                return m;
            }
            return obj;
        };
        class_2.prototype.default = function (options, defaults) {
            var op = options;
            for (var v in defaults) {
                op[v] = (op[v] || op[v] === 0 || op[v] === false) ? op[v] : defaults[v];
            }
            return op;
        };
        class_2.prototype.pull = function (element, array) {
            for (var i = 0; i < array.length; i += 1) {
                if (array[i] === element) {
                    array.splice(i, 1);
                    return array;
                }
            }
            return array;
        };
        class_2.prototype.find = function (array, condition) {
            for (var i = 0; i < array.length; i++) {
                if (condition(array[i])) {
                    return array[i];
                }
            }
            return null;
        };
        class_2.prototype.diminish = function (n, p, i) {
            return n * Math.pow(1 - p, i - 1);
        };
        class_2.prototype.compound = function (n, p, i) {
            return n * Math.pow(1 + p, i - 1);
        };
        class_2.prototype.mult = function (n1, n2) {
            return (1 - (1 - n1) * (1 - n2));
        };
        class_2.prototype.div = function (n1, n2) {
            return (1 - (1 - n1) / (1 - n2));
        };
        class_2.prototype.toPercent = function (n, precision) {
            if (precision === void 0) { precision = 0; }
            var tens = Math.pow(10, precision);
            return String(Math.round(n * 100 * tens) / tens) + "%";
        };
        class_2.prototype.hitTestPolygon = function (point, polygon) {
            var numCrosses = 0;
            var i = 0;
            var j = polygon.length - 1;
            if (polygon[i].x === polygon[j].x && polygon[i].y === polygon[j].y) {
                i = 1;
                j = 0;
            }
            for (i = i; i < polygon.length; i += 1) {
                if (point.x >= Math.min(polygon[i].x, polygon[j].x) && point.x <= Math.max(polygon[i].x, polygon[j].x)) {
                    var dx = polygon[i].x - polygon[j].x;
                    var dy = polygon[i].y - polygon[j].y;
                    var ratio = dy / dx;
                    var d2x = point.x - polygon[j].x;
                    var d2y = ratio * d2x;
                    var yAtX = polygon[j].y + d2y;
                    if (yAtX > point.y) {
                        numCrosses += 1;
                    }
                }
                j = i;
            }
            return (numCrosses % 2 === 1);
        };
        return class_2;
    }());
    exports.tween = new (function () {
        function Tween() {
            var _this = this;
            this.wait = function (object, ticks, config) {
                if (config === void 0) { config = {}; }
                var cTicks = 0;
                function _tickThis() {
                    cTicks += 1;
                    if (config.onUpdate)
                        config.onUpdate(object);
                    if (cTicks > ticks) {
                        exports.events.ticker.remove(_tickThis);
                        if (config.onComplete)
                            config.onComplete(object);
                    }
                }
                exports.events.ticker.add(_tickThis);
            };
            this.to = function (object, ticks, props, config) {
                if (config === void 0) { config = {}; }
                if (props == null)
                    return;
                var properties = {};
                var cTicks = 0;
                for (var v in props) {
                    if (v == "delay") {
                        cTicks = -props[v];
                    }
                    else {
                        properties[v] = { start: object[v], end: props[v], inc: (props[v] - object[v]) / ticks };
                    }
                }
                function _tickThis() {
                    cTicks += 1;
                    if (config.onUpdate)
                        config.onUpdate(object);
                    if (cTicks > ticks) {
                        for (var v in properties) {
                            object[v] = properties[v].end;
                        }
                        exports.events.ticker.remove(_tickThis);
                        if (config.onComplete)
                            config.onComplete(object);
                    }
                    else if (cTicks >= 0) {
                        for (var v in properties) {
                            object[v] = properties[v].start + properties[v].inc * cTicks;
                        }
                    }
                }
                exports.events.ticker.add(_tickThis);
            };
            this.from = function (object, ticks, props, config) {
                if (config === void 0) { config = {}; }
                if (props == null)
                    return;
                var newProps = {};
                for (var v in props) {
                    if (v == "delay") {
                        newProps[v] = props[v];
                    }
                    else {
                        newProps[v] = object[v];
                        object[v] = props[v];
                    }
                }
                _this.to(object, ticks, props, config);
            };
            this.colorTo = function (object, ticks, props, config) {
                if (config === void 0) { config = {}; }
                if (!props)
                    return;
                var properties = {};
                var cTicks = 0;
                for (var v in props) {
                    if (v == "delay") {
                        cTicks = -props[v];
                    }
                    else {
                        properties[v] = { start: object[v], end: props[v],
                            incR: Math.floor(props[v] / 0x010000) - Math.floor(object[v] / 0x010000) / ticks,
                            incG: Math.floor((props[v] % 0x010000) / 0x000100) - Math.floor((object[v] % 0x010000) / 0x000100) / ticks,
                            incB: Math.floor(props[v] % 0x000100) - Math.floor(object[v] % 0x000100) / ticks,
                        };
                    }
                }
                function _tickThis() {
                    cTicks += 1;
                    if (config.onUpdate)
                        config.onUpdate(object);
                    if (cTicks > ticks) {
                        for (var v_1 in properties) {
                            object[v_1] = properties[v_1].end;
                        }
                        exports.events.ticker.remove(_tickThis);
                        if (config.onComplete)
                            config.onComplete(object);
                    }
                    else if (cTicks >= 0) {
                        for (var v in properties) {
                            object[v] = properties[v].start + Math.floor(properties[v].incR * cTicks) * 0x010000 + Math.floor(properties[v].incG * cTicks) * 0x000100 + Math.floor(properties[v].incB * cTicks);
                        }
                    }
                }
                exports.events.ticker.add(_tickThis);
            };
        }
        return Tween;
    }());
    var EventType;
    (function (EventType) {
        EventType["MOUSE_MOVE"] = "mouseMove";
        EventType["MOUSE_DOWN"] = "mouseDown";
        EventType["MOUSE_UP"] = "mouseUp";
        EventType["MOUSE_CLICK"] = "mouseClick";
        EventType["MOUSE_WHEEL"] = "mouseWheel";
        EventType["KEY_DOWN"] = "keyDown";
        EventType["KEY_UP"] = "keyUp";
        EventType["UI_OVER"] = "uiOver";
        EventType["UI_OFF"] = "uiOff";
    })(EventType = exports.EventType || (exports.EventType = {}));
    exports.events = new (function () {
        function class_3() {
            var _this = this;
            this.registry = {};
            this.activeRegistry = [];
            this.tickEvents = [];
            this.ticker = {
                add: function (output) { return exports.events.tickEvents.push(output); },
                addOnce: function (output) {
                    var m = function () {
                        exports.utils.pull(m, exports.events.tickEvents);
                        output();
                    };
                    exports.events.tickEvents.push(m);
                },
                remove: function (output) { return exports.utils.pull(output, exports.events.tickEvents); }
            };
            this.onTick = function () {
                while (_this.activeRegistry.length > 0) {
                    var register = _this.activeRegistry.shift();
                    register.active = false;
                    var _loop_1 = function () {
                        var event_1 = register.events.shift();
                        register.listeners.forEach(function (output) { return output(event_1); });
                        while (register.once.length > 0) {
                            register.once.shift()(event_1);
                        }
                    };
                    while (register.events.length > 0) {
                        _loop_1();
                    }
                }
                _this.tickEvents.forEach(function (output) { return output(); });
            };
        }
        class_3.prototype.clearAllEvents = function () {
            this.registry = {};
            this.activeRegistry = [];
            this.tickEvents = [];
        };
        class_3.prototype.createRegister = function (type) {
            this.registry[type] = new JMERegister;
        };
        class_3.prototype.add = function (type, output) {
            if (!this.registry[type])
                this.createRegister(type);
            this.registry[type].listeners.push(output);
        };
        class_3.prototype.addOnce = function (type, output) {
            if (!this.registry[type])
                this.createRegister(type);
            this.registry[type].once.push(output);
        };
        class_3.prototype.remove = function (type, output) {
            if (this.registry[type]) {
                exports.utils.pull(output, this.registry[type].listeners);
            }
        };
        class_3.prototype.publish = function (type, event) {
            if (!this.registry[type])
                this.createRegister(type);
            this.registry[type].events.push(event);
            if (!this.registry[type].active) {
                this.registry[type].active = true;
                this.activeRegistry.push(this.registry[type]);
            }
        };
        class_3.prototype.selfPublish = function (register, event, replaceCurrent) {
            if (replaceCurrent) {
                register.events = [event];
            }
            else {
                register.events.push(event);
            }
            if (!register.active) {
                register.active = true;
                this.activeRegistry.push(register);
            }
        };
        return class_3;
    }());
    var JMERegister = (function () {
        function JMERegister() {
            this.listeners = [];
            this.once = [];
            this.events = [];
            this.active = false;
        }
        return JMERegister;
    }());
    var SelfRegister = (function (_super) {
        __extends(SelfRegister, _super);
        function SelfRegister(onlyLastListener, onlyLastEvent) {
            var _this = _super.call(this) || this;
            _this.onlyLastListener = onlyLastListener;
            _this.onlyLastEvent = onlyLastEvent;
            return _this;
        }
        SelfRegister.prototype.addListener = function (output) {
            if (this.onlyLastListener) {
                this.listeners = [output];
            }
            else {
                this.listeners.push(output);
            }
        };
        SelfRegister.prototype.removeListener = function (output) {
            exports.utils.pull(output, this.listeners);
        };
        SelfRegister.prototype.addOnce = function (output) {
            this.once.push(output);
        };
        SelfRegister.prototype.publish = function (event) {
            exports.events.selfPublish(this, event, this.onlyLastEvent);
        };
        return SelfRegister;
    }(JMERegister));
    exports.SelfRegister = SelfRegister;
    var Rect = (function (_super) {
        __extends(Rect, _super);
        function Rect() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Rect.prototype.setLeft = function (n) {
            this.width += this.x - n;
            this.x = n;
        };
        Rect.prototype.setRight = function (n) {
            this.width += n - this.right;
        };
        Rect.prototype.setTop = function (n) {
            this.height -= n - this.y;
            this.y = n;
        };
        Rect.prototype.setBot = function (n) {
            this.height += n - this.top;
        };
        return Rect;
    }(PIXI.Rectangle));
    exports.Rect = Rect;
    exports.inputManager = new (function () {
        function class_4() {
            var _this = this;
            this.MOUSE_HOLD = 200;
            this.onWheel = function (e) {
                exports.events.publish(EventType.MOUSE_WHEEL, { mouse: _this.mouse, deltaY: e.deltaY });
            };
            this.onKeyDown = function (e) {
                switch (e.key) {
                    case "a":
                    case "A": break;
                    case "Control":
                        _this.mouse.ctrlKey = true;
                        break;
                }
                exports.events.publish(EventType.KEY_DOWN, { key: e.key });
            };
            this.onKeyUp = function (e) {
                switch (e.key) {
                    case "Control":
                        _this.mouse.ctrlKey = false;
                        break;
                }
                exports.events.publish(EventType.KEY_UP, { key: e.key });
            };
        }
        class_4.prototype.init = function (app) {
            this.app = app;
            this.mouse = new MouseObject();
            this.mouse.addCanvas(app.stage);
            window.addEventListener("keydown", this.onKeyDown);
            window.addEventListener("keyup", this.onKeyUp);
            window.addEventListener("mousewheel", this.onWheel);
        };
        return class_4;
    }());
    var MouseObject = (function (_super) {
        __extends(MouseObject, _super);
        function MouseObject(config) {
            if (config === void 0) { config = {}; }
            var _this = _super.call(this, config.x, config.y) || this;
            _this.clickMode = false;
            _this.down = false;
            _this.ctrlKey = false;
            _this.timerRunning = false;
            _this.onUI = false;
            _this.disabled = false;
            _this.touchMode = false;
            _this.enableTouchMode = function () {
                _this.touchMode = true;
                _this.canvas.removeListener("touchstart", _this.enableTouchMode);
                _this.canvas.addListener("mousedown", _this.disableTouchMode);
                _this.canvas.removeListener("pointerup", _this.onUp);
                _this.canvas.addListener("touchend", _this.onUp);
            };
            _this.disableTouchMode = function () {
                _this.touchMode = false;
                _this.canvas.removeListener("mousedown", _this.disableTouchMode);
                _this.canvas.addListener("touchstart", _this.enableTouchMode);
                _this.canvas.removeListener("touchend", _this.onUp);
                _this.canvas.addListener("pointerup", _this.onUp);
            };
            _this.startDrag = function (target, onMove, onRelease, onDown, offset) {
                target.selected = true;
                _this.drag = new DragObject(target, onMove, onRelease, onDown, offset);
            };
            _this.endDrag = function () {
                if (_this.drag) {
                    if (_this.drag.release(_this)) {
                        _this.drag = null;
                    }
                }
            };
            _this.onDown = function (e) {
                _this.onMove(e);
                _this.down = true;
                if (_this.disabled || _this.timerRunning) {
                    return;
                }
                if (_this.drag) {
                    if (_this.drag.down && _this.drag.down(_this)) {
                        _this.drag = null;
                    }
                }
                else {
                    if (_this.clickMode) {
                        _this.timerRunning = true;
                        setTimeout(function () {
                            _this.timerRunning = false;
                            if (_this.down) {
                                exports.events.publish(EventType.MOUSE_DOWN, _this);
                            }
                        }, MouseObject.HOLD);
                    }
                    else {
                        exports.events.publish(EventType.MOUSE_DOWN, _this);
                    }
                }
            };
            _this.onUp = function (e) {
                _this.onMove(e);
                _this.down = false;
                if (_this.disabled) {
                    return;
                }
                if (_this.drag) {
                    _this.endDrag();
                }
                else {
                    if (_this.clickMode && _this.timerRunning) {
                        exports.events.publish(EventType.MOUSE_CLICK, _this);
                    }
                    else {
                        exports.events.publish(EventType.MOUSE_UP, _this);
                    }
                }
            };
            _this.onMove = function (e) {
                _this.target = e.target;
                if (e.target && e.target.isUI) {
                    _this.onUI = true;
                }
                else {
                    _this.onUI = false;
                }
                var point = e.data.getLocalPosition(_this.canvas);
                if (_this.locationFilter) {
                    point = _this.locationFilter(point, _this.drag ? _this.drag.object : null);
                }
                _this.set(point.x, point.y);
                if (_this.disabled) {
                    return;
                }
                if (_this.drag != null) {
                    if (_this.drag.move) {
                        _this.drag.move(_this);
                    }
                }
                exports.events.publish(EventType.MOUSE_MOVE, _this);
            };
            _this.down = config.down || false;
            _this.drag = config.drag || null;
            _this.id = config.id || 0;
            return _this;
        }
        MouseObject.prototype.addCanvas = function (canvas) {
            this.canvas = canvas;
            canvas.addListener("touchstart", this.enableTouchMode);
            canvas.addListener("pointerdown", this.onDown);
            canvas.addListener("pointermove", this.onMove);
            canvas.addListener("pointerup", this.onUp);
            canvas.addListener("pointerupoutside", this.onUp);
        };
        MouseObject.HOLD = 200;
        return MouseObject;
    }(PIXI.Point));
    exports.MouseObject = MouseObject;
    var DragObject = (function () {
        function DragObject(object, onMove, onRelease, onDown, offset) {
            this.object = object;
            this.onRelease = onRelease || this.nullFunc;
            this.onDown = onDown || this.nullFunc;
            this.onMove = onMove || this.nullFunc;
            this.offset = offset;
        }
        DragObject.prototype.setOffset = function (x, y) {
            this.offset = new PIXI.Point(x, y);
        };
        DragObject.prototype.nullFunc = function (object, e) {
            return true;
        };
        ;
        DragObject.prototype.release = function (e) {
            var m = this.onRelease(this.object, e);
            this.object.selected = !m;
            return m;
        };
        DragObject.prototype.move = function (e) {
            return this.onMove(this.object, e);
        };
        DragObject.prototype.down = function (e) {
            var m = this.onDown(this.object, e);
            this.object.selected = !m;
            return m;
        };
        return DragObject;
    }());
    exports.DragObject = DragObject;
});
define("GraphicData", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ImageRepo = (function () {
        function ImageRepo() {
        }
        ImageRepo.sm = "./Bitmaps/Separate/sm.png";
        ImageRepo.mm = "./Bitmaps/Separate/mm.png";
        ImageRepo.lm = "./Bitmaps/Separate/lm.png";
        ImageRepo.sl = "./Bitmaps/Separate/sl.png";
        ImageRepo.ml = "./Bitmaps/Separate/ml.png";
        ImageRepo.ll = "./Bitmaps/Separate/ll.png";
        ImageRepo.ss = "./Bitmaps/Separate/ss.png";
        ImageRepo.ms = "./Bitmaps/Separate/ms.png";
        ImageRepo.ls = "./Bitmaps/Separate/ls.png";
        ImageRepo.turret = "./Bitmaps/Separate/turret.png";
        ImageRepo.superman = "./Bitmaps/Separate/superman.png";
        ImageRepo.player = "./Bitmaps/Separate/player/red 1.png";
        ImageRepo.playerMissile = "./Bitmaps/Separate/missiles/p mi.png";
        ImageRepo.enemyMissile = "./Bitmaps/Separate/missiles/me ship 1.png";
        ImageRepo.boss0 = "./Bitmaps/Separate/boss/boss0.png";
        ImageRepo.boss1 = "./Bitmaps/Separate/boss/boss1.png";
        ImageRepo.boss2 = "./Bitmaps/Separate/boss/boss2.png";
        ImageRepo.boss0Over0 = "./Bitmaps/doors2.png";
        ImageRepo.boss0Over1 = "./Bitmaps/doors3.png";
        ImageRepo.boss0Over2 = "./Bitmaps/doors4.png";
        return ImageRepo;
    }());
    exports.ImageRepo = ImageRepo;
    var TextureData = (function () {
        function TextureData() {
        }
        TextureData.init = function (_renderer) {
            var _graphic = new PIXI.Graphics;
            _graphic.beginFill(0xffffff);
            _graphic.drawCircle(-25, -25, 25);
            this.circle = _renderer.generateTexture(_graphic);
            _graphic = new PIXI.Graphics;
            _graphic.beginFill(0xffffff);
            _graphic.drawCircle(-5, -5, 5);
            this.smallCircle = _renderer.generateTexture(_graphic);
            _graphic = new PIXI.Graphics;
            _graphic.beginFill(0xcccccc);
            _graphic.drawRoundedRect(0, 0, 30, 30, 5);
            this.itemRect = _renderer.generateTexture(_graphic);
            _graphic = new PIXI.Graphics;
            _graphic.beginFill(0, 0.3);
            _graphic.drawEllipse(0, 0, 5, 2);
            this.genericShadow = _renderer.generateTexture(_graphic);
            _graphic = new PIXI.Graphics;
            _graphic.beginFill(0xffffff, 0.5);
            _graphic.lineStyle(2, 0xffffff, 0.7);
            _graphic.drawCircle(0, 0, 25);
            this.clearCircle = _renderer.generateTexture(_graphic);
            _graphic = new PIXI.Graphics;
            _graphic.beginFill(0xffffff);
            _graphic.drawRect(0, 0, 28, 28);
            _graphic.beginFill(0x333333);
            _graphic.drawCircle(14, 14, 14);
            _graphic.beginFill(0xffffff);
            _graphic.drawCircle(14, 14, 7);
            this.mediumCircle = _renderer.generateTexture(_graphic);
            _graphic = new PIXI.Graphics;
            _graphic.beginFill(0xffffff);
            _graphic.drawRect(0, 0, 28, 28);
            _graphic.endFill();
            _graphic.lineStyle(5, 0x333333);
            _graphic.moveTo(2, 2);
            _graphic.lineTo(26, 26);
            _graphic.moveTo(26, 2);
            _graphic.lineTo(2, 26);
            this.wall = _renderer.generateTexture(_graphic);
            _graphic = new PIXI.Graphics;
            _graphic.beginFill(0xffffff);
            _graphic.drawRect(0, 0, 28, 28);
            _graphic.endFill();
            _graphic.lineStyle(5, 0x333333);
            _graphic.moveTo(13, 2);
            _graphic.lineTo(26, 13);
            _graphic.lineTo(13, 26);
            _graphic.lineTo(2, 13);
            _graphic.lineTo(13, 2);
            this.nova = _renderer.generateTexture(_graphic);
            _graphic.clear();
            _graphic.beginFill(0xffffff);
            _graphic.drawRect(0, 0, 30, 30);
            this.square = _renderer.generateTexture(_graphic);
            _graphic.clear();
            _graphic.beginFill(0xffffff);
            _graphic.drawCircle(0, 0, 2);
            this.bullet = _renderer.generateTexture(_graphic);
            _graphic.clear();
            _graphic.beginFill(0xffffff);
            _graphic.moveTo(-5, 0);
            _graphic.lineTo(-10, 20);
            _graphic.lineTo(10, 20);
            _graphic.lineTo(5, 0);
            _graphic.lineTo(-5, 0);
            _graphic.drawCircle(0, 0, 10);
            this.medal = _renderer.generateTexture(_graphic);
        };
        TextureData.cache = {};
        return TextureData;
    }());
    exports.TextureData = TextureData;
});
define("Config", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CONFIG = {
        INIT: {
            STAGE_WIDTH: 800,
            STAGE_HEIGHT: 500,
            RESOLUTION: 1,
            BACKGROUND_COLOR: 0,
            MOUSE_HOLD: 200,
            FPS: 60,
        },
        GAME: {
            FLOOR_HEIGHT: 300,
            Y_TILE: 50,
            X_AT_0: 140,
            X_TILE: 100,
            WALK_SPEED: 5
        }
    };
});
define("utils/SaveData", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SaveData = (function () {
        function SaveData() {
        }
        SaveData.init = function () {
            this.loadVersion(function (version) {
                if (version < SaveData.VERSION) {
                    SaveData.confirmReset();
                    SaveData.saveVersion(SaveData.VERSION);
                    SaveData.saveExtrinsic();
                }
                else {
                    SaveData.loadExtrinsic(function (extrinsic) {
                        if (extrinsic) {
                            SaveData.extrinsic = extrinsic;
                        }
                        else {
                            SaveData.confirmReset();
                        }
                    });
                }
            });
        };
        SaveData.resetData = function () {
            return this.confirmReset;
        };
        SaveData.getExtrinsic = function () {
            return SaveData.extrinsic;
        };
        SaveData.saveExtrinsic = function (callback, extrinsic) {
            extrinsic = extrinsic || this.extrinsic;
            SaveData.saveExtrinsicToLocal(extrinsic);
            if (callback) {
                callback(extrinsic);
            }
        };
        SaveData.loadExtrinsic = function (callback) {
            var extrinsic = this.loadExtrinsicFromLocal();
            if (callback) {
                callback(extrinsic);
            }
        };
        SaveData.saveExtrinsicToLocal = function (extrinsic) {
            extrinsic = extrinsic || this.extrinsic;
            if (typeof (Storage) !== "undefined") {
                window.localStorage.setItem("Extrinsic", JSON.stringify(extrinsic.data));
            }
            else {
                console.log("NO STORAGE!");
            }
        };
        SaveData.loadExtrinsicFromLocal = function () {
            if (typeof (Storage) !== "undefined") {
                return ExtrinsicModel.loadExtrinsic(JSON.parse(window.localStorage.getItem("Extrinsic")));
            }
            else {
                console.log("NO STORAGE!");
            }
        };
        SaveData.loadVersion = function (callback) {
            if (typeof (Storage) !== "undefined") {
                callback(Number(window.localStorage.getItem("Version")));
            }
            else {
                console.log("NO STORAGE!");
                callback(0);
            }
        };
        SaveData.saveVersion = function (version) {
            if (typeof (Storage) !== "undefined") {
                window.localStorage.setItem("Version", String(version));
            }
            else {
                console.log("NO STORAGE!");
            }
        };
        SaveData.VERSION = 6;
        SaveData.confirmReset = function () {
            SaveData.extrinsic = new ExtrinsicModel();
        };
        return SaveData;
    }());
    exports.SaveData = SaveData;
    var ExtrinsicModel = (function () {
        function ExtrinsicModel(data) {
            this.data = data;
            if (!data) {
                data = {
                    badges: [],
                    levels: [],
                    scores: {
                        kills: 0,
                        deaths: 0,
                        playtime: 0
                    }
                };
            }
        }
        ExtrinsicModel.loadExtrinsic = function (data) {
            return new ExtrinsicModel(data);
        };
        return ExtrinsicModel;
    }());
    exports.ExtrinsicModel = ExtrinsicModel;
});
define("JMGE/JMBUI", ["require", "exports", "JMGE/JMBL"], function (require, exports, JMBL) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DisplayState;
    (function (DisplayState) {
        DisplayState[DisplayState["NORMAL"] = 0] = "NORMAL";
        DisplayState[DisplayState["DARKENED"] = 1] = "DARKENED";
        DisplayState[DisplayState["BLACKENED"] = 2] = "BLACKENED";
        DisplayState[DisplayState["GREYED"] = 3] = "GREYED";
        DisplayState[DisplayState["BRIGHTENED"] = 4] = "BRIGHTENED";
    })(DisplayState = exports.DisplayState || (exports.DisplayState = {}));
    exports.UICONFIG = {
        CLICK_DELAY: 200,
    };
    var BasicElement = (function (_super) {
        __extends(BasicElement, _super);
        function BasicElement(options) {
            var _this = _super.call(this) || this;
            _this.options = options;
            _this.isUI = true;
            _this.graphics = new PIXI.Graphics;
            _this.baseTint = 0xffffff;
            _this.getWidth = function () {
                return _this.graphics.width;
            };
            _this.getHeight = function () {
                return _this.graphics.height;
            };
            options = options || {};
            _this.addChild(_this.graphics);
            if (options.width != null) {
                _this.graphics.beginFill(options.fill || 0xffffff);
                if (options.rounding != null) {
                    _this.graphics.drawRoundedRect(0, 0, options.width, options.height, options.rounding);
                }
                else {
                    _this.graphics.drawRect(0, 0, options.width, options.height);
                }
                _this.graphics.alpha = options.alpha == null ? 1 : options.alpha;
                _this.graphics.tint = _this.baseTint = options.bgColor || 0x808080;
            }
            _this.x = options.x || 0;
            _this.y = options.y || 0;
            if (options.label != null) {
                _this.addLabel(options.label, options.labelStyle);
            }
            return _this;
        }
        BasicElement.prototype.addLabel = function (s, style) {
            if (this.label) {
                this.label.text = s;
                if (style)
                    this.label.style = new PIXI.TextStyle(style);
                this.label.scale.set(1, 1);
            }
            else {
                this.label = new PIXI.Text(s, style || {});
                this.addChild(this.label);
            }
            if (this.label.width > this.graphics.width * 0.9) {
                this.label.width = this.graphics.width * 0.9;
            }
            this.label.scale.y = this.label.scale.x;
            this.label.x = (this.getWidth() - this.label.width) / 2;
            this.label.y = (this.getHeight() - this.label.height) / 2;
        };
        BasicElement.prototype.colorFlash = function (color, ticksUp, wait, ticksDown) {
            var _this = this;
            if (this.flashing)
                return;
            this.flashing = true;
            JMBL.tween.colorTo(this.graphics, ticksUp, { tint: color }, { onComplete: function () { return JMBL.tween.colorTo(_this.graphics, ticksDown, { delay: wait, tint: _this.baseTint }, { onComplete: function () { return (_this.flashing = false); } }); } });
        };
        return BasicElement;
    }(PIXI.Container));
    exports.BasicElement = BasicElement;
    var InteractiveElement = (function (_super) {
        __extends(InteractiveElement, _super);
        function InteractiveElement(options) {
            var _this = _super.call(this, options) || this;
            _this.setDisplayState = function (_state) {
                if (_this.displayState == _state)
                    return;
                _this.displayState = _state;
                switch (_state) {
                    case DisplayState.DARKENED:
                        _this.overlay.tint = 0;
                        _this.overlay.alpha = 0.5;
                        _this.addChild(_this.overlay);
                        break;
                    case DisplayState.BLACKENED:
                        _this.overlay.tint = 0;
                        _this.overlay.alpha = 0.8;
                        _this.addChild(_this.overlay);
                        break;
                    case DisplayState.GREYED:
                        _this.overlay.tint = 0x999999;
                        _this.overlay.alpha = 0.5;
                        _this.addChild(_this.overlay);
                        break;
                    case DisplayState.BRIGHTENED:
                        _this.overlay.tint = 0xffffff;
                        _this.overlay.alpha = 0.3;
                        _this.addChild(_this.overlay);
                        break;
                    case DisplayState.NORMAL:
                    default:
                        _this.overlay.alpha = 0;
                }
            };
            _this.overlay = new PIXI.Graphics();
            _this.overlay.beginFill(0xffffff);
            _this.overlay.drawRect(0, 0, _this.graphics.width, _this.graphics.height);
            options = options || {};
            _this.interactive = true;
            if (options.downFunction != null) {
                _this.downFunction = options.downFunction;
                _this.on("pointerdown", _this.downFunction);
            }
            options.displayState = options.displayState || DisplayState.NORMAL;
            _this.setDisplayState(options.displayState);
            return _this;
        }
        Object.defineProperty(InteractiveElement.prototype, "selected", {
            get: function () {
                return this._Selected;
            },
            set: function (b) {
                if (b) {
                    if (this.selectRect == null) {
                        this.selectRect = new PIXI.Graphics;
                        this.selectRect.lineStyle(3, 0xffff00);
                        this.selectRect.drawRect(this.graphics.x, this.graphics.y, this.graphics.width, this.graphics.height);
                    }
                    this.addChild(this.selectRect);
                }
                else {
                    if (this.selectRect != null && this.selectRect.parent != null)
                        this.selectRect.parent.removeChild(this.selectRect);
                }
                this._Selected = b;
            },
            enumerable: true,
            configurable: true
        });
        return InteractiveElement;
    }(BasicElement));
    exports.InteractiveElement = InteractiveElement;
    var Button = (function (_super) {
        __extends(Button, _super);
        function Button(options) {
            var _this = _super.call(this, JMBL.utils.default(options, {
                x: 50, y: 50, width: 200, height: 50, bgColor: 0x8080ff,
            })) || this;
            _this.downOnThis = false;
            _this.timeout = null;
            _this.output = options.output;
            _this.onOut = options.onOut;
            _this.onOver = options.onOver;
            _this.buttonMode = true;
            if (JMBL.interactionMode === "desktop") {
                _this.addListener("pointerover", function (e) {
                    if (!_this.disabled) {
                        _this.setDisplayState(DisplayState.DARKENED);
                        if (_this.onOver) {
                            _this.onOver();
                        }
                    }
                });
                _this.addListener("pointerout", function (e) {
                    if (!_this.disabled) {
                        _this.setDisplayState(DisplayState.NORMAL);
                        if (_this.onOut) {
                            _this.onOut();
                        }
                    }
                    _this.downOnThis = false;
                });
                _this.addListener("pointerdown", function () {
                    if (!_this.disabled)
                        _this.setDisplayState(DisplayState.BRIGHTENED);
                    _this.downOnThis = true;
                    if (_this.timeout === false) {
                        _this.timeout = true;
                        window.setTimeout(function () { _this.timeout = false; }, exports.UICONFIG.CLICK_DELAY);
                    }
                });
                _this.addListener("pointerup", function () {
                    if (!_this.disabled)
                        _this.setDisplayState(DisplayState.DARKENED);
                    if (_this.downOnThis && !_this.disabled && _this.output != null && _this.timeout !== false)
                        _this.output();
                    _this.downOnThis = false;
                });
            }
            else {
                _this.addListener("touchend", function () {
                    if (!_this.disabled && _this.output != null)
                        _this.output();
                });
            }
            return _this;
        }
        Object.defineProperty(Button.prototype, "disabled", {
            get: function () {
                return this._Disabled;
            },
            set: function (b) {
                this._Disabled = b;
                if (b) {
                    this.setDisplayState(DisplayState.BLACKENED);
                }
                else {
                    this.setDisplayState(DisplayState.NORMAL);
                }
            },
            enumerable: true,
            configurable: true
        });
        return Button;
    }(InteractiveElement));
    exports.Button = Button;
    var HorizontalStack = (function (_super) {
        __extends(HorizontalStack, _super);
        function HorizontalStack(width) {
            if (width === void 0) { width = -1; }
            var _this = _super.call(this) || this;
            _this.padding = 5;
            return _this;
        }
        HorizontalStack.prototype.addElement = function (v) {
            this.addChild(v);
        };
        HorizontalStack.prototype.alignAll = function () {
            var children = this.children;
            var cX = 0;
            for (var i = 0; i < children.length; i++) {
                children[i].x = cX;
                cX += children[i].width + this.padding;
            }
        };
        return HorizontalStack;
    }(PIXI.Container));
    exports.HorizontalStack = HorizontalStack;
    var ClearButton = (function (_super) {
        __extends(ClearButton, _super);
        function ClearButton(options) {
            var _this = _super.call(this, JMBL.utils.default(options, {
                bgColor: 0x00ff00,
                alpha: 0.01,
                width: 190,
                height: 50,
                x: 0,
                y: 0,
            })) || this;
            _this.buttonMode = true;
            return _this;
        }
        return ClearButton;
    }(InteractiveElement));
    exports.ClearButton = ClearButton;
    var SelectButton = (function (_super) {
        __extends(SelectButton, _super);
        function SelectButton(index, selectList, selectFunction, options) {
            if (options === void 0) { options = null; }
            var _this = _super.call(this, options) || this;
            _this.index = index;
            _this.myList = selectList;
            _this.output = _this.selectThis;
            _this.selectFunction = selectFunction;
            return _this;
        }
        SelectButton.prototype.selectThis = function () {
            if (this.selected)
                return;
            for (var i = 0; i < this.myList.length; i += 1) {
                this.myList[i].selected = this.myList[i] === this;
            }
            this.selectFunction(this.index);
        };
        return SelectButton;
    }(Button));
    exports.SelectButton = SelectButton;
    var MaskedWindow = (function (_super) {
        __extends(MaskedWindow, _super);
        function MaskedWindow(container, options) {
            var _this = _super.call(this, options) || this;
            _this.mask = new PIXI.Graphics;
            _this.objects = [];
            _this.offset = 0;
            _this.goalY = 1;
            _this.scrollbar = null;
            _this.vY = 0;
            _this.sortMargin = 5;
            _this.dragging = false;
            _this.scrollHeight = 0;
            _this.horizontal = false;
            _this.addScrollbar = function (_scrollbar) {
                _this.scrollbar = _scrollbar;
                _scrollbar.output = _this.setScroll;
            };
            _this.onWheel = function (e) {
                if (e.mouse.x > _this.x && e.mouse.x < _this.x + _this.mask.width && e.mouse.y > _this.y && e.mouse.y < _this.y + _this.mask.height) {
                    _this.vY -= e.delta * 0.008;
                }
            };
            _this.setScroll = function (p) {
                if (_this.horizontal) {
                    if (_this.scrollHeight > _this.mask.width) {
                        _this.container.x = p * (_this.mask.width - _this.scrollHeight);
                        if (_this.container.x > 0)
                            _this.container.x = 0;
                        if (_this.container.x < _this.mask.width - _this.scrollHeight)
                            _this.container.x = _this.mask.width - _this.scrollHeight;
                    }
                    else {
                        _this.container.x = 0;
                    }
                }
                else {
                    if (_this.scrollHeight > _this.mask.height) {
                        _this.container.y = p * (_this.mask.height - _this.scrollHeight);
                        if (_this.container.y > 0)
                            _this.container.y = 0;
                        if (_this.container.y < _this.mask.height - _this.scrollHeight)
                            _this.container.y = _this.mask.height - _this.scrollHeight;
                    }
                    else {
                        _this.container.y = 0;
                    }
                }
            };
            _this.getRatio = function () {
                if (_this.horizontal) {
                    return Math.min(1, _this.mask.width / _this.scrollHeight);
                }
                else {
                    return Math.min(1, _this.mask.height / _this.scrollHeight);
                }
            };
            _this.update = function () {
                if (_this.horizontal) {
                    if (_this.goalY <= 0) {
                        _this.vY = (_this.goalY - _this.container.x) / 4;
                    }
                    if (_this.vY != 0) {
                        if (Math.abs(_this.vY) < 0.1)
                            _this.vY = 0;
                        else {
                            var _y = _this.container.x + _this.vY;
                            _y = Math.min(0, Math.max(_y, _this.mask.width - _this.scrollHeight));
                            _this.vY *= 0.95;
                            if (_this.scrollbar != null)
                                _this.scrollbar.setPosition(_y / (_this.mask.width - _this.scrollHeight));
                            else
                                _this.setScroll(_y / (_this.mask.width - _this.scrollHeight));
                        }
                    }
                }
                else {
                    if (_this.goalY <= 0) {
                        _this.vY = (_this.goalY - _this.container.y) / 4;
                    }
                    if (_this.vY != 0) {
                        if (Math.abs(_this.vY) < 0.1)
                            _this.vY = 0;
                        else {
                            var _y = _this.container.y + _this.vY;
                            _y = Math.min(0, Math.max(_y, _this.mask.height - _this.scrollHeight));
                            _this.vY *= 0.95;
                            if (_this.scrollbar != null)
                                _this.scrollbar.setPosition(_y / (_this.mask.height - _this.scrollHeight));
                            else
                                _this.setScroll(_y / (_this.mask.height - _this.scrollHeight));
                        }
                    }
                }
            };
            _this.addObject = function (_object) {
                _this.objects.push(_object);
                _object.x -= _this.x - _this.container.x;
                _object.y -= _this.y - _this.container.y;
                _this.container.addChild(_object);
                if (_this.autoSort)
                    _this.sortObjects();
            };
            _this.removeObject = function (_object) {
                for (var i = 0; i < _this.objects.length; i += 1) {
                    if (_this.objects[i] == _object) {
                        _this.removeObjectAt(i);
                        return;
                    }
                }
            };
            _this.removeObjectAt = function (i) {
                _this.container.removeChild(_this.objects[i]);
                _this.objects.splice(i, 1);
                if (_this.autoSort)
                    _this.sortObjects();
            };
            _this.sortObjects = function () {
                _this.scrollHeight = _this.sortMargin;
                for (var i = 0; i < _this.objects.length; i += 1) {
                    if (_this.horizontal) {
                        _this.objects[i].x = _this.scrollHeight;
                        _this.objects[i].timeout = false;
                        _this.objects[i].y = 0;
                        _this.scrollHeight += _this.objects[i].graphics.width + _this.sortMargin;
                    }
                    else {
                        _this.objects[i].y = _this.scrollHeight;
                        _this.objects[i].timeout = false;
                        _this.objects[i].x = 0;
                        _this.scrollHeight += _this.objects[i].graphics.height + _this.sortMargin;
                    }
                }
            };
            options = options || {};
            if (container) {
                _this.container = container;
            }
            else {
                _this.container = new PIXI.Sprite;
            }
            _this.addChild(_this.container);
            _this.addChild(_this.mask);
            _this.mask.beginFill(0);
            _this.mask.drawRect(0, 0, options.width || 50, options.height || 100);
            _this.autoSort = options.autoSort || false;
            _this.interactive = true;
            _this.sortMargin = options.sortMargin || 5;
            _this.horizontal = options.horizontal;
            _this.on("mousedown", function (e) {
                if (e.target !== _this) {
                    return;
                }
                var point = e.data.getLocalPosition(_this);
                if (_this.horizontal) {
                    _this.offset = point.x - _this.x - _this.container.x;
                }
                else {
                    _this.offset = point.y - _this.y - _this.container.y;
                }
                _this.dragging = true;
            });
            _this.on("mouseup", function () {
                _this.goalY = 1;
                _this.dragging = false;
            });
            _this.on("mouseupoutside", function () {
                _this.goalY = 1;
                _this.dragging = false;
            });
            _this.on("mousemove", function (e) {
                var point = e.data.getLocalPosition(_this);
                if (_this.dragging) {
                    if (_this.horizontal) {
                        _this.goalY = point.x - _this.x - _this.offset;
                        _this.vY = (_this.goalY - _this.container.x) / 4;
                    }
                    else {
                        _this.goalY = point.y - _this.y - _this.offset;
                        _this.vY = (_this.goalY - _this.container.y) / 4;
                    }
                }
            });
            JMBL.events.ticker.add(_this.update);
            return _this;
        }
        MaskedWindow.prototype.updateScrollHeight = function () {
            if (this.horizontal) {
                this.scrollHeight = this.container.getWidth();
            }
            else {
                this.scrollHeight = this.container.getHeight();
            }
        };
        return MaskedWindow;
    }(BasicElement));
    exports.MaskedWindow = MaskedWindow;
    var Gauge = (function (_super) {
        __extends(Gauge, _super);
        function Gauge(color, options) {
            if (color === void 0) { color = 0x00ff00; }
            if (options === void 0) { options = {}; }
            var _this = _super.call(this, JMBL.utils.default(options, {
                width: 100, height: 20, bgColor: 0x101010
            })) || this;
            _this.front = new PIXI.Graphics();
            _this.front.beginFill(color);
            _this.front.drawRect(_this.graphics.x, _this.graphics.y, _this.graphics.width, _this.graphics.height);
            _this.addChild(_this.front);
            return _this;
        }
        Gauge.prototype.setValue = function (value, max) {
            if (max === void 0) { max = -1; }
            if (max >= 1)
                this.max = max;
            this.value = value;
            this.percent = this.value / this.max;
            this.front.width = Math.floor(Math.max(1, Math.min(this.percent * this.graphics.width, this.graphics.width)));
        };
        Gauge.prototype.setMax = function (max) {
            if (max >= 1)
                this.max = max;
            this.percent = this.value / this.max;
            this.front.width = Math.floor(Math.max(1, Math.min(this.percent * this.graphics.width, this.graphics.width)));
        };
        return Gauge;
    }(BasicElement));
    exports.Gauge = Gauge;
    var Scrollbar = (function (_super) {
        __extends(Scrollbar, _super);
        function Scrollbar(options) {
            var _this = _super.call(this, JMBL.utils.default(options, {
                x: 100, y: 50, width: 10, height: 100, rounding: 5, bgColor: 0x404080, horizontal: false,
            })) || this;
            _this.mover = new PIXI.Graphics();
            _this.topY = 0;
            _this.bottomY = 40;
            _this.offset = 0;
            _this.horizontal = false;
            _this.drawMover = function (p) {
                p = Math.min(1, Math.max(0, p));
                if (p >= 1)
                    _this.visible = false;
                else
                    _this.visible = true;
                _this.mover.clear();
                _this.mover.beginFill(_this.moverColor);
                if (_this.horizontal) {
                    _this.mover.drawRoundedRect(0, 0, p * _this.graphics.width, _this.graphics.height, _this.graphics.height / 2);
                    _this.bottomY = _this.graphics.width - _this.mover.width;
                }
                else {
                    _this.mover.drawRoundedRect(0, 0, _this.graphics.width, p * _this.graphics.height, _this.graphics.width / 2);
                    _this.bottomY = _this.graphics.height - _this.mover.height;
                }
            };
            _this.setPosition = function (p) {
                if (_this.horizontal) {
                    var _x = p * (_this.bottomY - _this.topY) + _this.topY;
                    _this.mover.x = _x;
                }
                else {
                    var _y = p * (_this.bottomY - _this.topY) + _this.topY;
                    _this.mover.y = _y;
                }
                if (_this.output != null)
                    _this.output(p);
            };
            _this.getPosition = function () {
                if (_this.horizontal) {
                    return (_this.mover.x - _this.topY) / (_this.bottomY - _this.topY);
                }
                else {
                    return (_this.mover.y - _this.topY) / (_this.bottomY - _this.topY);
                }
            };
            _this.startMove = function (e) {
                if (_this.horizontal) {
                    _this.offset = e.x - _this.x - _this.mover.x;
                }
                else {
                    _this.offset = e.y - _this.y - _this.mover.y;
                }
                _this.dragging = true;
            };
            _this.addChild(_this.mover);
            _this.output = options.output;
            _this.horizontal = options.horizontal;
            _this.interactive = true;
            _this.buttonMode = true;
            _this.moverColor = options.moverColor || 0x333333;
            _this.ratio = options.ratio || 0.5;
            _this.drawMover(_this.ratio);
            _this.setPosition(options.position || 0);
            _this.on("mousedown", function (e) {
                var point = e.data.getLocalPosition(_this);
                _this.dragging = true;
                if (_this.horizontal) {
                    _this.offset = point.x - _this.x - _this.mover.x;
                }
                else {
                    _this.offset = point.y - _this.y - _this.mover.y;
                }
            });
            _this.on("mouseup", function () {
                _this.dragging = false;
            });
            _this.on("mouseupoutside", function () {
                _this.dragging = false;
            });
            _this.on("mousemove", function (e) {
                if (_this.dragging) {
                    var point = e.data.getLocalPosition(_this);
                    if (_this.horizontal) {
                        var _x = point.x - _this.x - _this.offset;
                        _x = Math.max(_x, _this.topY);
                        _x = Math.min(_x, _this.bottomY);
                        _this.mover.x = _x;
                    }
                    else {
                        var _y = point.y - _this.y - _this.offset;
                        _y = Math.max(_y, _this.topY);
                        _y = Math.min(_y, _this.bottomY);
                        _this.mover.y = _y;
                    }
                    if (_this.output)
                        _this.output(_this.getPosition());
                }
            });
            return _this;
        }
        return Scrollbar;
    }(BasicElement));
    exports.Scrollbar = Scrollbar;
});
define("menus/muterOverlay", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MuterOverlay = (function (_super) {
        __extends(MuterOverlay, _super);
        function MuterOverlay() {
            var _this = _super.call(this) || this;
            _this.beginFill(0x666666);
            _this.lineStyle(2);
            _this.drawRect(0, 0, 100, 50);
            return _this;
        }
        MuterOverlay.prototype.getWidth = function () {
            return 100;
        };
        MuterOverlay.prototype.getHeight = function () {
            return 50;
        };
        return MuterOverlay;
    }(PIXI.Graphics));
    exports.MuterOverlay = MuterOverlay;
});
define("game/GameModel", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var GameModel = (function () {
        function GameModel() {
        }
        return GameModel;
    }());
    exports.GameModel = GameModel;
});
define("game/sprites/SpriteModel", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SpriteModel = (function () {
        function SpriteModel() {
            this.exists = true;
            this.busy = false;
            this.dead = false;
            this.player = false;
            this.action = 0;
            this.accel = 0.01;
            this.maxHealth = 100;
            this.health = 100;
        }
        SpriteModel.prototype.addHealth = function (n) {
            this.health += n;
            this.health = Math.min(this.health, this.maxHealth);
            if (this.health <= 0) {
                this.dead = true;
            }
        };
        return SpriteModel;
    }());
    exports.SpriteModel = SpriteModel;
});
define("game/engine/GameEvents", ["require", "exports", "JMGE/JMBL"], function (require, exports, JMBL) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GameEvents = {
        ticker: {
            add: function (listener) { return JMBL.events.ticker.add(listener); },
            remove: function (listener) { return JMBL.events.ticker.remove(listener); },
        },
        SPRITE_ADDED: new JMBL.SelfRegister(),
        SPRITE_REMOVED: new JMBL.SelfRegister(),
        ANIMATE_ACTION: new JMBL.SelfRegister(true),
        FIGHT_STATE: new JMBL.SelfRegister(),
    };
    exports.SpriteEvents = {
        ADD_HEALTH: new JMBL.SelfRegister(),
    };
    var ActionSlug;
    (function (ActionSlug) {
        ActionSlug[ActionSlug["ATTACK"] = 0] = "ATTACK";
    })(ActionSlug = exports.ActionSlug || (exports.ActionSlug = {}));
    var ActionTarget;
    (function (ActionTarget) {
        ActionTarget[ActionTarget["SELF"] = 0] = "SELF";
        ActionTarget[ActionTarget["ENEMY"] = 1] = "ENEMY";
    })(ActionTarget = exports.ActionTarget || (exports.ActionTarget = {}));
    var ActionType;
    (function (ActionType) {
    })(ActionType = exports.ActionType || (exports.ActionType = {}));
});
define("JMGE/effects/FlyingText", ["require", "exports", "lodash", "JMGE/JMBL"], function (require, exports, _, JMBL) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var FlyingText = (function (_super) {
        __extends(FlyingText, _super);
        function FlyingText(s, style, x, y, parent) {
            var _this = _super.call(this, s, _.defaults(style, { fontSize: 15, fontWeight: 'bold', dropShadow: true, fill: 0xffffff, dropShadowDistance: 2 })) || this;
            _this.anchor.set(0.5, 0.5);
            _this.position.set(x, y);
            if (parent)
                parent.addChild(_this);
            JMBL.tween.to(_this, 60, { delay: 20, alpha: 0 });
            JMBL.tween.to(_this, 80, { y: (_this.y - 20) }, { onComplete: function () { return _this.destroy(); } });
            return _this;
        }
        return FlyingText;
    }(PIXI.Text));
    exports.FlyingText = FlyingText;
});
define("game/sprites/SimpleView", ["require", "exports", "JMGE/effects/FlyingText", "JMGE/JMBL", "JMGE/JMBUI", "Config"], function (require, exports, FlyingText_1, JMBL, JMBUI, Config_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SpriteView = (function (_super) {
        __extends(SpriteView, _super);
        function SpriteView(model, color) {
            if (color === void 0) { color = 0x4488ff; }
            var _this = _super.call(this) || this;
            _this.model = model;
            _this.yOffset = 0;
            _this.facing = 1;
            _this.baseX = function () { return Config_1.CONFIG.GAME.X_AT_0 + _this.model.tile * Config_1.CONFIG.GAME.X_TILE; };
            _this.baseY = function () { return Config_1.CONFIG.GAME.FLOOR_HEIGHT + Config_1.CONFIG.GAME.Y_TILE * _this.yOffset; };
            _this.tempWalk = function (onTrigger, onComplete) {
                JMBL.tween.to(_this, 20, { y: _this.y - 5 }, {
                    onComplete: function () {
                        onTrigger();
                        JMBL.tween.to(_this, 20, { y: _this.baseY() }, {
                            onComplete: onComplete
                        });
                    }
                });
            };
            _this.tempAnimate = function (onTrigger, onComplete) {
                _this.proclaim("ATTACK!");
                _this.animating = true;
                var oX = _this.x;
                JMBL.tween.to(_this, 10, { x: _this.x + 20 * _this.facing }, {
                    onComplete: function () {
                        onTrigger();
                        _this.proclaim("STRIKE!");
                        JMBL.tween.to(_this, 10, { x: oX }, {
                            onComplete: function () {
                                _this.animating = false;
                                onComplete();
                            }
                        });
                    }
                });
            };
            _this.update = function () {
                _this.actionGauge.setValue(_this.model.action);
                _this.healthGauge.setValue(_this.model.health);
                if (!_this.animating) {
                    var dest_X = _this.baseX();
                    if (_this.x < dest_X) {
                        _this.x += Config_1.CONFIG.GAME.WALK_SPEED;
                        if (_this.x > dest_X) {
                            _this.x = dest_X;
                        }
                    }
                    else if (_this.x > dest_X) {
                        _this.x -= Config_1.CONFIG.GAME.WALK_SPEED;
                        if (_this.x < dest_X) {
                            _this.x = dest_X;
                        }
                    }
                }
            };
            _this.beginFill(color);
            _this.lineStyle(1);
            _this.drawEllipse(-15, -50, 15, 50);
            _this.actionGauge = new JMBUI.Gauge(0xcccc22, { width: 30, height: 3 });
            _this.actionGauge.x = -30;
            _this.actionGauge.y = -110;
            _this.actionGauge.setMax(1);
            _this.addChild(_this.actionGauge);
            _this.healthGauge = new JMBUI.Gauge(0xcc2222, { width: 30, height: 3 });
            _this.healthGauge.x = -30;
            _this.healthGauge.y = -116;
            _this.healthGauge.setMax(model.maxHealth);
            _this.addChild(_this.healthGauge);
            return _this;
        }
        SpriteView.prototype.proclaim = function (s, fill) {
            if (fill === void 0) { fill = 0xffffff; }
            new FlyingText_1.FlyingText(s, { fill: fill }, 0, -50, this);
        };
        SpriteView.prototype.isModel = function (model) {
            return this.model === model;
        };
        return SpriteView;
    }(PIXI.Graphics));
    exports.SpriteView = SpriteView;
});
define("game/assets/generated/Background", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Background = (function (_super) {
        __extends(Background, _super);
        function Background(rect, floorHeight) {
            if (floorHeight === void 0) { floorHeight = 200; }
            var _this = _super.call(this) || this;
            _this.beginFill(0x883311);
            _this.drawRect(rect.left, rect.bottom - floorHeight, rect.width, floorHeight);
            _this.beginFill(0x99aaff);
            _this.drawRect(rect.left, rect.top, rect.width, rect.height - floorHeight);
            return _this;
        }
        return Background;
    }(PIXI.Graphics));
    exports.Background = Background;
});
define("game/ui/GameView", ["require", "exports", "lodash", "game/sprites/SimpleView", "game/assets/generated/Background", "Config", "game/engine/GameEvents"], function (require, exports, _, SimpleView_1, Background_1, Config_2, GameEvents_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var GameView = (function (_super) {
        __extends(GameView, _super);
        function GameView() {
            var _this = _super.call(this) || this;
            _this.spriteViews = [];
            _this.onTick = function () {
                _this.spriteViews.forEach(function (sprite) { return sprite.update(); });
            };
            _this.spriteAdded = function (e) {
                var color = e.player ? 0x33aaff : 0xff0000;
                var view = new SimpleView_1.SpriteView(e.sprite, color);
                _this.spriteViews.push(view);
                _this.addChild(view);
                view.position.set(Config_2.CONFIG.GAME.X_AT_0 + e.sprite.tile * Config_2.CONFIG.GAME.X_TILE, Config_2.CONFIG.GAME.FLOOR_HEIGHT);
                if (e.player) {
                    _this.playerView = view;
                }
                else {
                    view.facing = -1;
                    _this.playerView.proclaim('SPAWN!', 0xff0000);
                }
            };
            _this.animateAction = function (e) {
                var view = _.find(_this.spriteViews, function (view) { return view.isModel(e.origin); });
                switch (e.action) {
                    case 'walk':
                        view.tempWalk(e.trigger, e.callback);
                        break;
                    case 'basic-attack':
                        view.tempAnimate(e.trigger, e.callback);
                        break;
                }
            };
            _this.spriteRemoved = function (sprite) {
                var view = _.find(_this.spriteViews, function (view) { return view.isModel(sprite); });
                if (view) {
                    _.pull(_this.spriteViews, view);
                    view.destroy();
                }
            };
            _this.fightStarted = function () {
                _this.playerView.proclaim('FIGHT!', 0x00ff00);
            };
            _this.background = new Background_1.Background(new PIXI.Rectangle(0, 0, Config_2.CONFIG.INIT.STAGE_WIDTH, Config_2.CONFIG.INIT.STAGE_HEIGHT));
            _this.addChild(_this.background);
            GameEvents_1.GameEvents.ticker.add(_this.onTick);
            return _this;
        }
        GameView.prototype.dispose = function () {
            GameEvents_1.GameEvents.ticker.remove(this.onTick);
            this.destroy();
        };
        return GameView;
    }(PIXI.Container));
    exports.GameView = GameView;
});
define("game/engine/GameController", ["require", "exports", "game/GameModel", "JMGE/JMBL", "lodash", "game/sprites/SpriteModel"], function (require, exports, GameModel_1, JMBL, _, SpriteModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var GameController = (function () {
        function GameController(gameV) {
            var _this = this;
            this.gameV = gameV;
            this.spriteModels = [];
            this.fighting = false;
            this.getTarget = function (origin, tryForce) {
                if (tryForce && tryForce.exists) {
                    return tryForce;
                }
                else {
                    return _.find(_this.spriteModels, function (sprite) { return sprite !== origin; });
                }
            };
            this.removeSprite = function (sprite) {
                if (sprite.exists && _.find(_this.spriteModels, sprite)) {
                    sprite.exists = false;
                    _.pull(_this.spriteModels, sprite);
                    _this.fighting = false;
                    _this.gameV.spriteRemoved(sprite);
                }
            };
            this.onTick = function () {
                if (_this.fighting) {
                    _this.onFightingTick();
                }
                else {
                    _this.onBetweenTick();
                }
            };
            this.onFightingTick = function () {
                _.each(_this.spriteModels, function (sprite) {
                    if (sprite.dead) {
                        if (!sprite.player) {
                            _this.removeSprite(sprite);
                        }
                        else {
                            sprite.addHealth(sprite.maxHealth);
                            sprite.dead = false;
                        }
                    }
                });
                if (_this.spriteModels.length <= 1) {
                    return;
                }
                var maxVal = 0;
                var maxSprite;
                if (_.every(_this.spriteModels, { busy: false })) {
                    _this.spriteModels.forEach(function (sprite) {
                        sprite.action += sprite.accel;
                        if (sprite.action > maxVal) {
                            maxVal = sprite.action;
                            maxSprite = sprite;
                        }
                    });
                    if (maxVal >= 1) {
                        var target_1 = _this.getTarget(maxSprite, maxSprite.focusTarget);
                        maxSprite.busy = true;
                        _this.gameV.animateAction({
                            origin: maxSprite,
                            target: target_1,
                            action: 'basic-attack',
                            trigger: function () {
                                target_1.addHealth(-25);
                            },
                            callback: function () {
                                maxSprite.action -= 1;
                                maxSprite.busy = false;
                            }
                        });
                    }
                }
            };
            this.onBetweenTick = function () {
                if (_.some(_this.spriteModels, { player: false })) {
                    if (_.every(_this.spriteModels, { busy: false })) {
                        var maxPlayer_1 = 0;
                        var minEnemy_1 = Infinity;
                        _.each(_this.spriteModels, function (sprite) {
                            if (sprite.player) {
                                maxPlayer_1 = Math.max(maxPlayer_1, sprite.tile);
                            }
                            else {
                                minEnemy_1 = Math.min(minEnemy_1, sprite.tile);
                            }
                        });
                        if (minEnemy_1 - maxPlayer_1 < 4) {
                            _this.startFight();
                            return;
                        }
                    }
                }
                else {
                    _this.spawnEnemy();
                }
                _.each(_this.spriteModels, function (sprite) {
                    if (!sprite.busy) {
                        sprite.busy = true;
                        _this.gameV.animateAction({
                            origin: sprite,
                            action: 'walk',
                            data: sprite.player ? 'right' : 'left',
                            trigger: function () {
                            },
                            callback: sprite.player ? function () {
                                _this.spriteModels.forEach(function (sprite2) { return (sprite2 !== sprite) ? sprite2.tile-- : null; });
                                sprite.busy = false;
                            } : function () {
                                sprite.tile--;
                                sprite.busy = false;
                            }
                        });
                    }
                });
            };
            this.startFight = function () {
                _this.fighting = true;
                _this.spriteModels.forEach(function (sprite) {
                    sprite.action = Math.random();
                    sprite.tile = sprite.player ? 0 : 2;
                });
                _this.gameV.fightStarted();
            };
            this.spawnEnemy = function () {
                var enemy = new SpriteModel_1.SpriteModel;
                enemy.tile = 9;
                _this.spriteModels.push(enemy);
                _this.gameV.spriteAdded({ sprite: enemy, newSpawn: true });
            };
            this.model = new GameModel_1.GameModel;
            JMBL.events.ticker.add(this.onTick);
            var player = new SpriteModel_1.SpriteModel;
            player.tile = 0;
            player.player = true;
            this.spriteModels.push(player);
            player.accel = 0.015;
            this.gameV.spriteAdded({ sprite: player, player: true });
        }
        GameController.prototype.dispose = function () {
            JMBL.events.ticker.remove(this.onTick);
        };
        return GameController;
    }());
    exports.GameController = GameController;
});
define("game/GameUI", ["require", "exports", "index", "game/engine/GameController", "game/ui/GameView"], function (require, exports, index_1, GameController_1, GameView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var GameUI = (function (_super) {
        __extends(GameUI, _super);
        function GameUI() {
            var _this = _super.call(this) || this;
            _this.display = new GameView_1.GameView;
            _this.keyDown = function (e) {
                if (e.key === 'Escape') {
                    index_1.Facade.navBack();
                }
            };
            _this.addChild(_this.display);
            _this.controller = new GameController_1.GameController(_this.display);
            window.addEventListener('keydown', _this.keyDown);
            return _this;
        }
        GameUI.prototype.dispose = function () {
            window.removeEventListener('keydown', this.keyDown);
            this.controller.dispose();
            this.display.dispose();
        };
        return GameUI;
    }(PIXI.Container));
    exports.GameUI = GameUI;
});
define("menus/MenuUI", ["require", "exports", "JMGE/JMBUI", "Config", "menus/muterOverlay", "index", "game/GameUI"], function (require, exports, JMBUI, Config_3, muterOverlay_1, index_2, GameUI_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MenuUI = (function (_super) {
        __extends(MenuUI, _super);
        function MenuUI() {
            var _this = _super.call(this) || this;
            _this.nullFunc = function () { };
            _this.startGame = function () {
                index_2.Facade.navTo(new GameUI_1.GameUI());
            };
            _this.navBadges = function () {
            };
            var background = new JMBUI.BasicElement({ width: Config_3.CONFIG.INIT.STAGE_WIDTH, height: Config_3.CONFIG.INIT.STAGE_HEIGHT, bgColor: 0x666666, label: "Eternal\n  Quest", labelStyle: { fontSize: 30, fill: 0x3333ff } });
            background.label.x += 50;
            _this.addChild(background);
            var _button = new JMBUI.Button({ width: 100, height: 30, x: 200, y: 200, label: "Start", output: _this.startGame });
            _this.addChild(_button);
            _button = new JMBUI.Button({ width: 100, height: 30, x: 200, y: 240, label: "High Score", output: _this.nullFunc });
            _this.addChild(_button);
            _button = new JMBUI.Button({ width: 100, height: 30, x: 200, y: 280, label: "View Badges", output: _this.navBadges });
            _this.addChild(_button);
            _button = new JMBUI.Button({ width: 100, height: 30, x: 200, y: 320, label: "More Games", output: _this.nullFunc });
            _this.addChild(_button);
            _button = new JMBUI.Button({ width: 100, height: 30, x: 200, y: 360, label: "Credits", output: _this.nullFunc });
            _this.addChild(_button);
            var muter = new muterOverlay_1.MuterOverlay();
            muter.x = Config_3.CONFIG.INIT.STAGE_WIDTH - muter.getWidth();
            muter.y = Config_3.CONFIG.INIT.STAGE_HEIGHT - muter.getHeight();
            _this.addChild(muter);
            return _this;
        }
        return MenuUI;
    }(PIXI.Container));
    exports.MenuUI = MenuUI;
});
define("index", ["require", "exports", "JMGE/JMBL", "GraphicData", "Config", "utils/SaveData", "menus/MenuUI"], function (require, exports, JMBL, GraphicData_1, Config_4, SaveData_1, MenuUI_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Facade = (function () {
        function Facade() {
            var _this = this;
            this._Resolution = Config_4.CONFIG.INIT.RESOLUTION;
            this.init = function () {
                initializeDatas();
                SaveData_1.SaveData.init();
                _this.currentModule = new MenuUI_1.MenuUI();
                _this.currentModule.navOut = _this.updateCurrentModule;
                _this.app.stage.addChild(_this.currentModule);
            };
            this.previousModules = [];
            if (Facade.instance)
                throw "Cannot instatiate more than one Facade Singleton.";
            Facade.instance = this;
            try {
                document.createEvent("TouchEvent");
                JMBL.setInteractionMode("mobile");
            }
            catch (e) {
            }
            Facade.stageBorders = new JMBL.Rect(0, 0, Config_4.CONFIG.INIT.STAGE_WIDTH / this._Resolution, Config_4.CONFIG.INIT.STAGE_HEIGHT / this._Resolution);
            this.app = new PIXI.Application(Facade.stageBorders.width, Facade.stageBorders.height, {
                backgroundColor: 0xff0000,
                antialias: true,
                resolution: this._Resolution,
                roundPixels: true,
            });
            Facade.app = this.app;
            document.getElementById("game-canvas").append(this.app.view);
            Facade.stageBorders.width *= this._Resolution;
            Facade.stageBorders.height *= this._Resolution;
            this.app.stage.scale.x = 1 / this._Resolution;
            this.app.stage.scale.y = 1 / this._Resolution;
            Facade.stageBorders.x = this.app.view.offsetLeft;
            Facade.stageBorders.y = this.app.view.offsetTop;
            this.app.stage.interactive = true;
            var _background = new PIXI.Graphics();
            _background.beginFill(Config_4.CONFIG.INIT.BACKGROUND_COLOR);
            _background.drawRect(0, 0, Facade.stageBorders.width, Facade.stageBorders.height);
            this.app.stage.addChild(_background);
            JMBL.init(this.app);
            GraphicData_1.TextureData.init(this.app.renderer);
            window.setTimeout(this.init, 10);
        }
        Facade.prototype.updateCurrentModule = function (nextModule) {
            var _this = this;
            this.previousModules.push(this.currentModule);
            this.currentModule.parent.removeChild(this.currentModule);
            this.currentModule = nextModule;
            SaveData_1.SaveData.saveExtrinsic(function () {
                _this.app.stage.addChild(_this.currentModule);
            });
        };
        Facade.prototype.navToPreviousModule = function () {
            var _this = this;
            if (this.previousModules.length > 0) {
                var nextModule = this.previousModules.pop();
                if (this.currentModule.dispose) {
                    this.currentModule.dispose();
                }
                else {
                    this.currentModule.destroy();
                }
                this.currentModule = nextModule;
                SaveData_1.SaveData.saveExtrinsic(function () {
                    _this.app.stage.addChild(_this.currentModule);
                });
            }
        };
        Facade.navTo = function (o) {
            Facade.instance.updateCurrentModule(o);
        };
        Facade.navBack = function () {
            Facade.instance.navToPreviousModule();
        };
        return Facade;
    }());
    exports.Facade = Facade;
    new Facade();
    function initializeDatas() {
    }
});
