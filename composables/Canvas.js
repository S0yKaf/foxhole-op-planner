import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport'
import { autoDetectRenderer } from 'pixi.js';

import FontFaceObserver from 'fontfaceobserver';

import { getMapItemPosition, regions } from './MapRegions';
import appConfig from '~/app.config';


export class Canvas {

    hexNames = []
    labels = []
    icons = []

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
        this.viewport.on("zoomed",this.onZoom, this)

        let font = new FontFaceObserver('Jost');
        font.load().then(() => {
                this.setup_warApi();
        })

    }

    setup_warApi() {
        const warden_color = 0x245682;
        const colonial_color = 0x516C4B;
        regions.forEach(async (r) => {

           await WarpApi.dynamic(r.id)
            .then(async (items) => {
                await items.mapItems.forEach((item) => {
                    var pos = getMapItemPosition(r.id, item.x, item.y)
                    var icon = new PIXI.Sprite(WarpApi.icons[item.iconType])
                    icon.name = item.iconType

                    switch (item.teamId) {
                        case "WARDENS":
                            icon.tint = (warden_color)
                            break;

                        case "COLONIALS":
                            icon.tint = (colonial_color)
                            break;
                    }

                    icon.position.set(pos[0], pos[1])
                    icon.anchor.set(0.5)
                    this.icons.push(icon)
                    this.viewport.addChild(icon)
                })

            })

           await WarpApi.statics(r.id)
            .then(async (items) => {
                await items.mapTextItems.forEach((item) => {
                    var pos = getMapItemPosition(r.id, item.x, item.y)
                    var text = new PIXI.Text(item.text, {
                        fontFamily: 'Jost',
                        fontSize: 128,
                        fill: 0x140c1c,
                        stroke: 0xdeeed6,
                        strokeThickness: 8,
                        align: 'center',
                    })
                    text.position.set(pos[0], pos[1])
                    text.scale.set(0.2);
                    text.anchor.set(0.5)
                    this.labels.push(text)
                    this.viewport.addChild(text)
                })

            })


            var text = new PIXI.Text(r.name, {
                fontFamily: 'Jost',
                fontSize: 256,
                fill: 0x140c1c,
                stroke: 0xdeeed6,
                strokeThickness: 16,
                align: 'center',
            })

            this.hexNames.push(text)
            this.viewport.addChild(text)
            text.position.set(r.center[0],r.center[1])
            text.anchor.set(0.5)
        })



    }


    render(graphic) {
        var renderTexture = this.renderTexture
        this.app.renderer.render(graphic, { renderTexture, clear:false, skipUpdateTransform: false })
    }

    onZoom(e) {
        var labelScale = 0.2
        var regionScale = 1.0
        var iconScale = 1.0
        var zoom = this.viewport.scale.x
        this.labels.forEach((label) => {
            label.alpha = 1.0
            label.scale.set(0.2)
            if (zoom < 0.5)
                label.alpha = 0.0
            if (zoom > 0.5)
                label.scale.set(clamp(label.scale.x / zoom,0.01,labelScale))
        })

        this.icons.forEach((icon) => {
            icon.alpha = 1.0
            icon.scale.set(1.0)
            if (zoom < 0.5 && !WarpApi.TOWNS.includes(icon.name))
                icon.alpha = 0.0

            if (zoom < 0.5 && WarpApi.TOWNS.includes(icon.name))
                icon.scale.set(clamp(1.0 / (zoom),2.0,8.0))

            if (zoom > 0.5)
                icon.scale.set(clamp(icon.scale.x / (zoom * 1.3),0.1,iconScale))

        })

        this.hexNames.forEach((hex) => {
            hex.alpha = 1.0
            if (zoom > 0.5)
                hex.alpha = 0.0
        })
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
