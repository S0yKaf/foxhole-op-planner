import * as PIXI from 'pixi.js';

export class Brush {

    size = 20
    color = new PIXI.Color('blue')
    erase = false

    brush = new PIXI.Graphics()
    line = new PIXI.Graphics()
    overlay = new PIXI.Graphics()

    drawing = false
    last_pos = null

    constructor(listen=false, size=20, color=new PIXI.Color('blue')) {
        this.size = size
        this.color = color

        canvas.layerOverlay.addChild(this.overlay)

        if (listen) {
            canvas.on("move", this.onMove, this)
            canvas.on("click", this.onClick, this)
            canvas.on("up", this.onUp, this)
        }

    }

    update_overlay(pos) {
        var c = new PIXI.Color(this.color)
        c.setAlpha(0.5)
        this.overlay
            .clear()
            .beginFill(c)
            .drawCircle(pos.x, pos.y, Math.floor(this.size))

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
            .drawCircle(pos.x , pos.y , Math.floor(this.size ))

        canvas.render(this.brush)

        if (this.last_pos) {
                this.line
                    .clear()
                    .lineStyle({width:Math.floor(this.size * 2 ), color:this.color})
                    .moveTo(this.last_pos.x , this.last_pos.y )
                    .lineTo(pos.x , pos.y )

                canvas.render(this.line)
            }

        this.last_pos = pos;
    }

    up() {
        this.drawing = false
        this.last_pos = null
    }

    onClick(last_pos,shift) {
        this.draw(last_pos,shift)
    }

    onMove(pos, last_pos, shift) {
        this.update_overlay(pos)
        if (this.drawing) {
            this.draw(last_pos,shift)
        }

    }

    onUp() {
        this.up()
    }

    delete() {
        canvas.layerOverlay.removeChild(this.overlay)
        canvas.removeListener("move", this.onMove, this)
        canvas.removeListener("click", this.onClick, this)
        canvas.removeListener("up", this.onUp, this)
        Object.keys(this).forEach(key => delete this[key])
    }

}
