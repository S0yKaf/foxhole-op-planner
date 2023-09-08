import appConfig from '~/app.config';
import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport'
import { autoDetectRenderer } from 'pixi.js';
import { getMapItemPosition, regions } from './MapRegions';


export class Canvas {

    app = new PIXI.Application({
        antialias: true,
        background: '#000000',
        autoResize: true,
        resolution: devicePixelRatio,
    });

    viewport = new Viewport({
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        worldWidth: 1000,
        worldHeight: 1000,

        events: this.app.renderer.events // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
    })

    renderTexture
    renderTextureSprite

    constructor() {

        this.app.stage.addChild(this.viewport)
        this.viewport
            .drag({mouseButtons: "middle"})
            .pinch()
            .wheel()
            .decelerate()

        var drawLayer = new PIXI.Container();

        //{ 11264, 12432 }
        this.renderTexture = PIXI.RenderTexture.create({width: 11264, height:12432, scaleMode: PIXI.SCALE_MODES.NEAREST})
        const texture = PIXI.Texture.from('foxhole_map.jpg');
        texture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;

        const renderer = autoDetectRenderer();

        const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

        var map = new PIXI.Sprite(texture);

        map.anchor.set(0.5)
        map.position.set(0,0)

        map.eventMode = "static";

        this.renderTextureSprite = new PIXI.Sprite(this.renderTexture);
        this.renderTextureSprite.anchor.set(0.5);
        this.renderTextureSprite.scaleMode = PIXI.SCALE_MODES.NEAREST;

        this.viewport.eventMode = "static";


        this.viewport.addChild(map);
        this.viewport.addChild(drawLayer);
        this.viewport.addChild(this.renderTextureSprite);
        this.viewport.addChild(brush.overlay)
        // this.viewport.addChild(brush.text)
        // Enable interactivity!

        this.viewport.on("pointermove", this.move, this)
        this.viewport.on("pointerdown", this.onClick, this)
        this.viewport.on("pointerup", this.onUp, this)

        regions.forEach((r) => {
            var text = new PIXI.Text(r.name, {
                fontFamily: 'Arial',
                fontSize: 128,
                fill: 0x000000,
                align: 'center',
            })

            WarpApi.statics(r.id)
            .then((items) => {
                items.mapTextItems.forEach((item) => {
                    var pos = getMapItemPosition(r.id, item.x, item.y)
                    var text = new PIXI.Text(item.text, {
                        fontFamily: 'Arial',
                        fontSize: 12,
                        fill: 0x000000,
                        align: 'center',
                    })
                    this.viewport.addChild(text)
                    text.position.set(pos[0], pos[1])
                    text.anchor.set(0.5)
                })

            })

            const warden_color = 0x245682;
            const colonial_color = 0x516C4B;
            WarpApi.dynamic(r.id)
            .then((items) => {
                items.mapItems.forEach((item) => {
                    var pos = getMapItemPosition(r.id, item.x, item.y)
                    var icon = new PIXI.Sprite(WarpApi.icons[item.iconType])

                    switch (item.teamId) {
                        case "WARDENS":
                            icon.tint = (warden_color)
                            break;

                        case "COLONIALS":
                            icon.tint = (colonial_color)
                            break;
                    }

                    this.viewport.addChild(icon)
                    icon.position.set(pos[0], pos[1])
                    icon.anchor.set(0.5)
                })

            })

            this.viewport.addChild(text)
            text.position.set(r.center[0],r.center[1])
            text.anchor.set(0.5)

        })
    }


    render(graphic) {
        var renderTexture = this.renderTexture
        this.app.renderer.render(graphic, { renderTexture, clear:false, skipUpdateTransform: false })
    }

    move(e) {
        var last_pos = this.viewport.toWorld(e.globalX,e.globalY);
        last_pos.x += 11264 * 0.5;
        last_pos.y += 12432 * 0.5;

        var pos = this.viewport.toWorld(e.globalX,e.globalY);
        brush.update_overlay(pos)
        if (brush.drawing) {
            brush.draw(last_pos, e.shiftKey)
        }
    }

    onUp(e) {
        brush.up()
    }

    onClick(e) {
        if (!e.originalEvent.button == 0) {
            return;
        }
        var last_pos = this.viewport.toWorld(e.globalX,e.globalY);
        last_pos.x += 11264 * 0.5;
        last_pos.y += 12432 * 0.5;

        console.log(last_pos)
        brush.draw(last_pos, e.shiftKey)

        // connection.send_data({click: last_pos, erase: e.shiftKey, color:brush.color.toHex(), size: brush.size})
    }

    init_from_host(state) {
        var renderTexture = this.renderTexture
        var sprite = PIXI.Sprite.from(state)
        sprite.texture.baseTexture.on("loaded",() => {
            this.app.renderer.render(sprite, { renderTexture, clear:false, skipUpdateTransform: false })
        })
    }


    resize(width, height) {
        // Resize the renderer
        this.app.renderer.resize(width, height);
        this.viewport.resize(width, height);

    }
}
