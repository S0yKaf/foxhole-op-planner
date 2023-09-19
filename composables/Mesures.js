import * as PIXI from 'pixi.js';
import '@pixi/math-extras';

import { metersToPixels, pixelToMeters } from './_Globals';


class Mesure extends PIXI.Container {

    appConfig = useAppConfig()

    text

    constructor() {
        super()

        this.text = new PIXI.Text("", {
            fontFamily: 'Jost',
            fontSize: 128,
            fill: this.appConfig.theme.text_color,
            stroke: this.appConfig.theme.text_outline_color,
            strokeThickness: 12,
            align: 'left',
        })
        this.sortChildren = true
        this.text.scale.set(0.15);
        this.text.anchor.set(0.5)
        this.eventMode = "static"
        this.addChild(this.text)

        this.on("rightclick", this.onRightClick, this)

    }

    onRightClick(e) {
        this.destroy()
    }

    updateDistance(end) {
        var norm = end.normalize()
        var angle = Math.atan2(norm.x, -norm.y)
        var theta_degrees = angle * (180 / Math.PI)
        if (theta_degrees < 0) {
            theta_degrees += 360
        }
        var distance = Math.max(Math.abs(end.x), Math.abs(end.y))
        this.text.text = "Dist:" + pixelToMeters(distance).toFixed(2) + "m" + '\n' + "Azi:" + theta_degrees.toFixed(2) + "°"
    }

}

export class MesureLine extends Mesure {

    line
    constructor() {
        super()
        this.line = new PIXI.Graphics();
        this.addChildAt(this.line,0)
    }

    update(end) {
        this.updateDistance(end)
        this.line
        .clear()
        .lineStyle({width:2, color:0x000000})
        .moveTo(0,0)
        .lineTo(end.x, end.y)
    }
}

export class MesureCircle extends Mesure {

    circle
    constructor() {
        super()
        this.circle = new PIXI.Graphics();
        this.addChildAt(this.circle,0)
    }

    update(end) {
        var distance = Math.max(Math.abs(end.x), Math.abs(end.y))
        this.updateDistance(end)
        this.circle
        .clear()
        .lineStyle({width:2, color:0x000000})
        .drawCircle(0,0,distance)
    }

    updateDistance(end) {
        var norm = end.normalize()
        var angle = Math.atan2(norm.x, -norm.y)
        var theta_degrees = angle * (180 / Math.PI)
        if (theta_degrees < 0) {
            theta_degrees += 360
        }
        var distance = Math.max(Math.abs(end.x), Math.abs(end.y))
        this.text.text = pixelToMeters(distance).toFixed(2) + "m"
    }
}
