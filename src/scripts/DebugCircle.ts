import * as PIXI from "pixi.js";
import { Container, DisplayObject } from "pixi.js";

export class DebugCircle extends PIXI.Graphics {
    constructor(component: PIXI.DisplayObject, radius = 5, container: PIXI.Container | null = null) {
        super();

        let point = new PIXI.Point();

        component.getGlobalPosition(point, false);



        this.lineStyle(0);
        this.beginFill(0xDE3249, 1);
        this.drawCircle(point.x, point.y, radius);
        this.endFill();

        if (container)
            container.addChild(this);
    }
}