import * as PIXI from 'pixi.js';

export class Brush {

    size = 20
    color = new PIXI.Color('blue')
    erase = false

    brush = new PIXI.Graphics()
    line = new PIXI.Graphics()
    overlay = new PIXI.Graphics()
    // text = new PIXI.Text('This is a PixiJS text', {
    //     fontFamily: 'Arial',
    //     fontSize: 24,
    //     fill: 0xff1010,
    //     align: 'center',
    // })

    drawing = false
    last_pos = null

    constructor(size=20, color=new PIXI.Color('blue')) {
        this.size = size
        this.color = color
    }

    update_overlay(pos) {
        var c = new PIXI.Color(this.color)
        c.setAlpha(0.5)
        this.overlay
            .clear()
            .beginFill(c)
            .drawCircle(pos.x, pos.y, Math.floor(this.size))

        // this.text.text = "Hello"
        // this.text.position = pos
        // this.text.scale.x = 1 / canvas.viewport.transform.scale.x
        // this.text.scale.y = 1 / canvas.viewport.transform.scale.y
    }


    draw(pos, erase=false) {
        this.drawing = true

        this.brush.blendMode = PIXI.BLEND_MODES.NORMAL
        this.line.blendMode = PIXI.BLEND_MODES.NORMAL
        if (erase) {
            this.brush.blendMode = PIXI.BLEND_MODES.ERASE
            this.line.blendMode = PIXI.BLEND_MODES.ERASE
        }
        this.brush
            .clear()
            .beginFill(this.color)
            .drawCircle(pos.x, pos.y, Math.floor(this.size))

        canvas.render(this.brush)

        if (this.last_pos) {
                this.line
                    .clear()
                    .lineStyle({width:Math.floor(this.size * 2), color:this.color})
                    .moveTo(this.last_pos.x, this.last_pos.y)
                    .lineTo(pos.x, pos.y)

                canvas.render(this.line)
            }

        this.last_pos = pos;
    }

    up() {
        this.drawing = false
        this.last_pos = null
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
