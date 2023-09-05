
import * as PIXI from 'pixi.js';

export class Brush {

    size = 20
    color = new PIXI.Color('blue')
    erase = false

    brush = new PIXI.Graphics()
    line = new PIXI.Graphics()
    overlay = new PIXI.Graphics()

    constructor(size=20, color=new PIXI.Color('blue')) {
        this.size = size
        this.color = color
    }

    update_overlay(pos) {
        var c = new PIXI.Color(0xffffff)
        c.setAlpha(0.3)
        this.overlay
            .clear()
            .beginFill(c)
            .drawCircle(pos.x, pos.y, Math.floor(this.size))
    }


    get(to) {
        var b = this.brush

        b.blendMode = PIXI.BLEND_MODES.NORMAL
        if (this.erase) {
            b.blendMode = PIXI.BLEND_MODES.ERASE
        }

        return b
            .clear()
            .beginFill(this.color)
            .drawCircle(to.x, to.y, Math.floor(this.size))
    }

    get_line(from, to) {
        var l = this.line

        l.blendMode = PIXI.BLEND_MODES.NORMAL
        if (this.erase) {
            l.blendMode = PIXI.BLEND_MODES.ERASE
        }

        return l
        .clear()
        .lineStyle({width:Math.floor(this.size * 2), color:this.color})
        .moveTo(from.x, from.y)
        .lineTo(to.x, to.y)
    }

}
