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

    SCALE = this.appConfig.draw_texture_scale

    warden_color = this.appConfig.theme.warden_color;
    colonial_color = this.appConfig.theme.colonial_color;

    hexNames = []
    labels = []
    icons = {}
    voronoi = []
    town_icons = []

    mapObjects = []

    ready = false

    app = new PIXI.Application({
        antialias: true,
        background: this.appConfig.theme.canvas_background_color,
        autoResize: true,
        resolution: devicePixelRatio,
    });

    viewport = new Viewport({
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        worldWidth: 14336,
        worldHeight: 12432,
        disableOnContextMenu: true,

        events: this.app.renderer.events // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
    })

    layerMap = new Layer()
    layerDrawing = new Layer()
    layerHexName = new Layer()
    layerIcons = new Layer()
    layerOverlay = new Layer()
    layerTownIcons = new Layer()
    layerStickers = new Layer()
    layerLabels = new Layer()
    layerRegion = new Layer()

    showRegions = true
    showLabels = true

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
        this.viewport.fit(true, 14336,12432)

        this.layerDrawing.position.set(-14336*0.5,-12432*0.5)
        //{ 14336, 12432 }
        Array(5).fill().map((_,x) => {
            Array(5).fill().map((_,y) => {
                const renderTexture = PIXI.RenderTexture.create({width: 1024 * 3, height:888 * 3, scaleMode: PIXI.SCALE_MODES.NEAREST})
                var sprite = new PIXI.Sprite(renderTexture)
                sprite.renderTexture = renderTexture
                sprite.position.set(1024 * 3 * x, 888 * 3 * y)
                sprite.layerPosition = `${x}-${y}`
                sprite.scaleMode = PIXI.SCALE_MODES.NEAREST
                sprite.eventMode = "static"
                this.layerDrawing.addChild(sprite)
            })
        })

        this.viewport.eventMode = "static";

        this.viewport.addChild(this.layerMap);
        this.viewport.addChild(this.layerRegion)
        this.viewport.addChild(this.layerDrawing)
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
                this.setup_map()
                await this.setup_warApi();
                this.onZoom()
                this.emit("loaded")
        })

    }

    update_visible() {
        this.layerRegion.alpha = this.showRegions ? 0.8 : 0.0
        this.layerLabels.alpha = this.showLabels ? 1.0 : 0.0
        this.onZoom(null)
    }


    setup_map() {
        Object.keys(regions).forEach(key => {
            const texture = PIXI.Texture.from(`hexes/Map${key}.png`)
            texture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR
            var map = new PIXI.Sprite(texture)

            var center = regions[key].center
            this.layerMap.addChild(map)
            map.cullable = false
            map.scale.set(2);
            map.anchor.set(0.5)
            map.position.set(center[0],center[1])

            map.eventMode = "static"
        })
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

                if (item.flags == 17) {
                    icon.tint = "#FF0000"
                }

                if (WarpApi.VORONOI.includes(item.iconType)) {
                    this.voronoi.push({x: pos[0] + 14336 * 0.5, y:pos[1] + 12432 * 0.5})
                    this.town_icons.push(icon)
                }

                icon.position.set(pos[0], pos[1])
                icon.anchor.set(0.5)
                icon.cullable = false
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
            text.eventMode = "none"
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
        this.ready = true
    }

    async generate_voronoi_cells() {
        var bbox = {xl: 0, xr: 14336, yt: 0, yb: 12432};
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
            polygon.position.set(14336 * -0.5, 12432 * -0.5)
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
        if (!this.ready) {
            return
        }

        var hexes = await WarpApi.getActiveHexes()
        for (const i in hexes) {
            WarpApi.dynamic(hexes[i])
            .then((items) => {
                items.mapItems.forEach((item) => {
                   var icon = this.icons[hexes[i]].find((i) => i._id == `${item.x}:${item.y}`)
                    var newIcon = false
                   if (!icon) {
                    var pos = getMapItemPosition(hexes[i], item.x, item.y)
                    newIcon = true
                    console.log("NEW ICON")
                    console.log(item)
                    console.log(hexes[i])
                    icon = new PIXI.Sprite(WarpApi.icons[item.iconType])
                    icon.name = item.iconType
                    icon._id = `${item.x}:${item.y}`
                    icon.position.set(pos[0], pos[1])
                    icon.anchor.set(0.5)
                   }

                    icon.tint = 0xffffff
                    switch (item.teamId) {
                        case "WARDENS":
                            icon.tint = (this.warden_color)
                            break;

                        case "COLONIALS":
                            icon.tint = (this.colonial_color)
                            break;
                    }

                    if (item.flags == 17) {
                        icon.tint = "#FF0000"
                    }

                    if (icon._polygon) {
                        icon._polygon.tint = icon.tint
                    }

                    if (newIcon) {
                        console.log(icon)
                        this.layerTownIcons.addChild(icon)
                        this.icons[hexes[i]].push(icon)
                    }
                })

            })

            await this.timer(500);
        }
    }


    render(graphic) {
        this.layerDrawing.children.forEach((c) => {
            graphic.position = c.position
            graphic.position.x *= -1
            graphic.position.y *= -1
            this.app.renderer.render(graphic, { renderTexture: c.renderTexture, clear:false, skipUpdateTransform: false })
        })
    }

    onZoom(e) {
        var labelScale = 0.25
        var regionScale = 1.0
        var iconScale = 1.0
        var zoom = this.viewport.scale.x

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
        this.layerLabels.alpha = this.showLabels ? this.layerLabels.alpha : 0.0


    }

    move(e) {
        var last_pos = this.viewport.toWorld(e.globalX,e.globalY);
        last_pos.x += 14336 * 0.5;
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
        last_pos.x += 14336 * 0.5;
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

     async * saveDrawings() {
        var size = this.layerDrawing.children.length
        for (let i = 0; i < size; i++) {
            var sprite = this.layerDrawing.children[i]
            var blob = await new Promise(resolve => {
                canvas.app.renderer.extract.canvas(sprite.renderTexture).toBlob((blob) => {
                    resolve(blob)
                })
            })
            yield [sprite.layerPosition, blob]
        }
    }

}
