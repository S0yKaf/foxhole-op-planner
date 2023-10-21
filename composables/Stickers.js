import * as PIXI from 'pixi.js';

import { metersToPixels } from './_Globals';


const TEXTURES = {
    intel: PIXI.Texture.from('icons/ingame/intel.png'),
    defense: PIXI.Texture.from('icons/ingame/defense.png'),
    bunkerT1: PIXI.Texture.from('icons/ingame/bunkerT1.png'),
    bunkerT2: PIXI.Texture.from('icons/ingame/bunkerT2.png'),
    bunkerT3: PIXI.Texture.from('icons/ingame/bunkerT3.png'),
}

class Stickers extends PIXI.Container {

    appconfig = useAppConfig()

    faction = "NEUTRAL"
    texture
    sprite
    fill

    constructor(faction = "NEUTRAL", texture) {
        super()
        this.sortChildren = true
        this.faction = faction
        switch (faction) {
            case "WARDEN":
                this.fill = this.appconfig.theme.warden_color
                break;
            case "COLONIAL":
                this.fill = this.appconfig.theme.colonial_color
                break;
            default:
                this.fill = 0xffffff
        }

        this.texture = TEXTURES[texture]
        this.sprite = new PIXI.Sprite(this.texture)
        this.sprite.anchor.set(0.5)
        this.sprite.position.set(0,0)
        this.sprite.scale.set(0.20,0.20)
        this.sprite.tint = this.fill
        this.addChild(this.sprite)
        this.eventMode = "static"

        this.on("rightclick", this.onRightClick, this)

    }

    toString() {
        var data = {
            class: this.constructor.name,
            position: {x: this.position.x, y: this.position.y},
            faction: this.faction,
            tier: this.tier || null,
            range: this.range || null
        }

        return JSON.stringify(data)
    }

    onRightClick(e) {
        console.log("CLICK")
        this.destroy()
    }

}

export class Intel extends Stickers {
    circle
    constructor(faction = "NEUTRAL",range=80) {
        super(faction, 'intel')
        this.circle = new PIXI.Graphics()
        this.circle.beginFill(0xffffff,0.4)
        this.circle.drawCircle(0,0,metersToPixels(range))
        this.addChildAt(this.circle,0)
        // this.sprite.zIndex = 1
    }
}

export class Bunker extends Stickers {
    constructor(faction = "NEUTRAL", tier) {
        super(faction, 'bunkerT' + tier)
        this.sprite.scale.set(0.4,0.4)
    }
}

export class Defense extends Stickers {
    constructor(faction = "NEUTRAL", tier) {
        super(faction, 'defense')
    }
}
