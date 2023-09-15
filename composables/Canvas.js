import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport'
import { autoDetectRenderer } from 'pixi.js';

import { Layer, Stage } from '@pixi/layers'

import FontFaceObserver from 'fontfaceobserver';
import Voronoi from 'voronoi';
import { EventEmitter, ValidEventTypes } from "eventemitter3";

import { getMapItemPosition, regions } from './MapRegions';
import { smoothstep } from './_Globals';


export class Canvas extends EventEmitter {

    appConfig = useAppConfig()

    warden_color = this.appConfig.theme.warden_color;
    colonial_color = this.appConfig.theme.colonial_color;

    hexNames = []
    labels = []
    icons = {}
    voronoi = []
    town_icons = []

    app = new PIXI.Application({
        antialias: true,
        background: this.appConfig.theme.canvas_background_color,
        autoResize: true,
        resolution: devicePixelRatio,
    });

    viewport = new Viewport({
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        worldWidth: 11264,
        worldHeight: 12432,
        disableOnContextMenu: true,

        events: this.app.renderer.events // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
    })

    layerHexName = new Layer()
    layerIcons = new Layer()
    layerOverlay = new Layer()
    layerTownIcons = new Layer()
    layerStickers = new Layer()
    layerLabels = new Layer()
    layerRegion = new Layer()

    showRegions = true

    renderTexture
    renderTextureSprite

    constructor() {
        super()
        this.app.stage = new Stage()
        this.app.stage.addChild(this.viewport)
        this.viewport
            .drag({mouseButtons: "middle"})
            .pinch()
            .wheel()
            .decelerate()

        this.viewport.clampZoom({minScale:0.07,maxScale:8})
        this.viewport.fit(true, 11264,12432)

        //{ 11264, 12432 }
        this.renderTexture = PIXI.RenderTexture.create({width: 11264, height:12432, scaleMode: PIXI.SCALE_MODES.NEAREST})
        const texture = PIXI.Texture.from('foxhole_map.webp')
        texture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR

        var map = new PIXI.Sprite(texture)

        map.anchor.set(0.5)
        map.position.set(0,0)

        map.eventMode = "static"

        this.renderTextureSprite = new PIXI.Sprite(this.renderTexture)
        this.renderTextureSprite.anchor.set(0.5);
        this.renderTextureSprite.scaleMode = PIXI.SCALE_MODES.NEAREST

        this.viewport.eventMode = "static";


        this.viewport.addChild(map);
        this.viewport.addChild(this.layerRegion)
        this.viewport.addChild(this.renderTextureSprite)
        this.viewport.addChild(this.layerOverlay)
        this.viewport.addChild(this.layerIcons)
        this.viewport.addChild(this.layerTownIcons)
        this.viewport.addChild(this.layerStickers)
        this.viewport.addChild(this.layerLabels)
        this.viewport.addChild(this.layerHexName)


        this.viewport.on("pointermove", this.move, this)
        this.viewport.on("pointerdown", this.onClick, this)
        this.viewport.on("pointerup", this.onUp, this)
        this.viewport.on("zoomed",this.onZoom, this)

        let font = new FontFaceObserver('Jost');
        font.load(null,30000).then(async () => {
                await this.setup_warApi();
                this.onZoom()
                this.emit("loaded")
        })

    }

    update_visible() {
        this.layerRegion.alpha = this.showRegions ? 0.8 : 0.0
    }

    async setup_warApi() {
        var hexes = await WarpApi.getActiveHexes()

        for (const i in hexes) {
            this.icons[hexes[i]] = []
            var items = await WarpApi.dynamic(hexes[i])
            await Promise.all(items.mapItems.map(async (item) => {
                var pos = getMapItemPosition(hexes[i], item.x, item.y)
                var icon = new PIXI.Sprite(WarpApi.icons[item.iconType])
                icon.name = item.iconType
                icon._id = `${item.x}:${item.y}`

                switch (item.teamId) {
                    case "WARDENS":
                        icon.tint = (this.warden_color)
                        break;

                    case "COLONIALS":
                        icon.tint = (this.colonial_color)
                        break;
                }

                if (WarpApi.VORONOI.includes(item.iconType)) {
                    this.voronoi.push({x: pos[0] + 11264 * 0.5, y:pos[1] + 12432 * 0.5})
                    this.town_icons.push(icon)
                }

                icon.position.set(pos[0], pos[1])
                icon.anchor.set(0.5)
                this.icons[hexes[i]].push(icon)
            }))

            items = await WarpApi.statics(hexes[i])
            await items.mapTextItems.map(async (item) => {
                var pos = getMapItemPosition(hexes[i], item.x, item.y)
                var text = new PIXI.Text(item.text, {
                    fontFamily: 'Jost',
                    fontSize: 128,
                    fill: this.appConfig.theme.text_color,
                    stroke: this.appConfig.theme.text_outline_color,
                    strokeThickness: 12,
                    align: 'center',
                })
                text.position.set(pos[0], pos[1])
                text.scale.set(0.2);
                text.anchor.set(0.5)
                this.labels.push(text)
            })

            var text = new PIXI.Text(regions[hexes[i]].name, {
                fontFamily: 'Jost',
                fontSize: 256,
                fill: this.appConfig.theme.text_color,
                stroke: this.appConfig.theme.text_outline_color,
                strokeThickness: 16,
                align: 'center',
            })

            this.hexNames.push(text)
            text.position.set(regions[hexes[i]].center[0],regions[hexes[i]].center[1])
            text.anchor.set(0.5)
        }
        // this.viewport.addChild(this.icons)
        await this.generate_voronoi_cells()
        var hexes = await WarpApi.getActiveHexes()
        for (const i in hexes) {
            await Promise.all(this.icons[hexes[i]].map(async (i) => {

                if (WarpApi.TOWNS.includes(i.name)) {
                    this.layerTownIcons.addChild(i)
                } else {
                    this.layerIcons.addChild(i)
                }

            }))
        }
        await Promise.all(this.labels.map(async (i) => {this.layerLabels.addChild(i)}))
        await Promise.all(this.hexNames.map(async (i) => {this.layerHexName.addChild(i)}))
    }

    async generate_voronoi_cells() {
        var bbox = {xl: 0, xr: 11264, yt: 0, yb: 12432};
        var voro = new Voronoi()
        var diagram = voro.compute(this.voronoi,bbox);

        await Promise.all(diagram.cells.map((c) => {
            var id = c.site.voronoiId
            var index = this.voronoi.find((v) => v.voronoiId == id)
            var icon = this.town_icons[this.voronoi.indexOf(index)]
            var points = []
            c.halfedges.forEach((he) => {
                points.push(he.getStartpoint())
                points.push(he.getEndpoint())
            })
            var uniq = [...new Set(points)];
            var polygon_points = uniq.map((point) => {
                return new PIXI.Point(point.x, point.y)
            })
            var polygon = new PIXI.Graphics()
            polygon.position.set(11264 * -0.5, 12432 * -0.5)
            polygon.lineStyle({width:Math.floor(3), color:0x000000, alpha:1.0})
            polygon.beginFill(0xffffff,1.0)
            polygon.drawPolygon(polygon_points)
            polygon.tint = icon.tint
            icon._polygon = polygon
            this.layerRegion.addChild(polygon)
            polygon.zIndex = -10
        }))
    }


    timer = ms => new Promise(res => setTimeout(res, ms))
    async refreshCaptures() {


        var hexes = await WarpApi.getActiveHexes()
        for (const i in hexes) {
            WarpApi.dynamic(hexes[i])
            .then((items) => {
                items.mapItems.forEach((item) => {
                   var icon = this.icons[hexes[i]].find((i) => i._id == `${item.x}:${item.y}`)

                    icon.tint = 0xffffff
                    switch (item.teamId) {
                        case "WARDENS":
                            icon.tint = (this.warden_color)
                            break;

                        case "COLONIALS":
                            icon.tint = (this.colonial_color)
                            break;
                    }

                    if (icon._polygon) {
                        icon._polygon.tint = icon.tint
                    }
                })

            })

            await this.timer(500);
        }
    }


    render(graphic) {
        var renderTexture = this.renderTexture
        this.app.renderer.render(graphic, { renderTexture, clear:false, skipUpdateTransform: false })
    }

    onZoom(e) {
        var labelScale = 0.25
        var regionScale = 1.0
        var iconScale = 1.0
        var zoom = this.viewport.scale.x
        console.log(zoom)

        // LABELS
        this.layerLabels.alpha = smoothstep(0,0.5,zoom)
        this.layerLabels.children.forEach((c) => {c.scale.set(labelScale)})

        if (zoom > 0.5)
            this.layerLabels.children.forEach((c) => {c.scale.set(clamp(c.scale.x / (zoom + 0.5),0.01,labelScale))})

        // ICONS
        this.layerIcons.alpha = smoothstep(0,0.5,zoom)
        this.layerIcons.children.forEach((c) => {c.scale.set(1.0)})
        this.layerTownIcons.children.forEach((c) => {c.scale.set(1.0)})

        if (zoom < 0.5) {
            this.layerTownIcons.children.forEach((c) => {c.scale.set(clamp(1.0 / (zoom),2.0,5.0))})
        }


        if (zoom > 0.5) {
            this.layerIcons.children.forEach((c) => {c.scale.set(clamp(c.scale.x / (zoom * 1.3),0.1,iconScale))})
            this.layerTownIcons.children.forEach((c) => {c.scale.set(clamp(c.scale.x / (zoom * 1.3),0.1,iconScale))})
        }

        // HEX NAME
        this.layerHexName.alpha = 1.0
        this.layerHexName.alpha = smoothstep(0.5,0,zoom)


        //REGIONS
        this.layerRegion.alpha = smoothstep(0.4,0,zoom)
        this.layerRegion.alpha = clamp(this.layerRegion.alpha,0.2,0.8)


        // Overrides
        this.layerRegion.alpha = this.showRegions ? this.layerRegion.alpha : 0.0


    }

    move(e) {
        var last_pos = this.viewport.toWorld(e.globalX,e.globalY);
        last_pos.x += 11264 * 0.5;
        last_pos.y += 12432 * 0.5;

        var pos = this.viewport.toWorld(e.globalX,e.globalY);
        this.emit("move", pos, last_pos, e.shiftKey)
    }

    onUp(e) {
        this.emit("up")
    }

    onClick(e) {
        if (!e.originalEvent.button == 0) {
            return;
        }
        var last_pos = this.viewport.toWorld(e.globalX,e.globalY);
        last_pos.x += 11264 * 0.5;
        last_pos.y += 12432 * 0.5;

        this.emit("click", last_pos, e.shiftKey)

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
