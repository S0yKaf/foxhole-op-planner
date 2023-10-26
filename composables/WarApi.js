
import * as PIXI from 'pixi.js';

class WarpApiSingleton {

    url = "https://war-service-live.foxholeservices.com/api/worldconquest"

    icons = {}
    TOWNS = [8,27,29,28,45,56,57,58,70]
    VORONOI = [8,45,56,57,58]
    _activeHexes = []

    constructor() {

        for (const [key, path] of Object.entries(this._ICONS)) {
            this.icons[key] = PIXI.Texture.from(path)
          }

    }

    async getActiveHexes() {

        if (await this._activeHexes.length > 0) {
            return this._activeHexes
        }

        var endpoint = `${this.url}/maps`

        var res = await fetch(endpoint)
        var maps = await res.json()
        this._activeHexes = maps
        console.log(maps)
        return maps
    }

    async statics(map) {

        var endpoint = `${this.url}/maps/${map}/static`

        var res = await fetch(endpoint)
        var statics = await res.json()

        return statics
    }

    async dynamic(map) {

        var endpoint = `${this.url}/maps/${map}/dynamic/public`

        var res = await fetch(endpoint)
        var dynamic = await res.json()

        return dynamic
    }

    _ICONS = {
        // 5: "icons/", // REMOVED
        // 6: "icons/", // REMOVED
        // 7: "icons/", // REMOVED

        8: "icons/MapIconForwardBase1.png",
        // 9: "icons/", // REMOVED
        // 10: "icons/", // REMOVED

        11: "icons/MapIconMedical.png",
        12: "icons/MapIconVehicle.png",
        // 13: "icons/", // REMOVED
        // 14: "icons/", // REMOVED
        // 15: "icons/", // REMOVED
        // 16: "icons/", // REMOVED
        17: "icons/MapIconManufacturing.png",
        18: "icons/MapIconShipyard.png",
        19: "icons/MapIconTechCenter.png",

        20: "icons/MapIconSalvage.png",
        21: "icons/MapIconComponents.png",
        22: "icons/MapIconFuel.png",
        23: "icons/MapIconSulfur.png",
        // 24: "icons/", // ????
        // 25: "icons/", // ????
        // 26: "icons/", // ????
        27: "icons/MapIconFortKeep.png",
        28: "icons/MapIconObservationTower.png",
        29: "icons/MapIconFort.png",
        30: "icons/MapIconTroopShip.png",
        32: "icons/MapIconSulfurMine.png",
        33: "icons/MapIconStorageFacility.png",
        34: "icons/MapIconFactory.png",
        35: "icons/MapIconSafehouse.png",
        // 36: "icons/", // REMOVED
        37: "icons/RocketSiteMapIcon.png",
        38: "icons/MapIconSalvageMine.png",
        39: "icons/MapIconConstructionYard.png",
        40: "icons/MapIconComponentMine.png",
        41: "icons/MapIconOilWell.png", // REMOVED

        45: "icons/MapIconRelicBase.png",
        // 46: "icons/", // Deprecated in v0.52 until further notice (use Relic Base 1)
        // 47: "icons/", // Deprecated in v0.52 until further notice (use Relic Base 1)

        51: "icons/MapIconMassProductionFactory.png",
        52: "icons/MapIconSeaport.png",
        53: "icons/MapIconCoastalGun.png",
        54: "icons/MapIconSoulFactory.png", // RIP

        56: "icons/MapIconTownBaseTier1.png",
        57: "icons/MapIconTownBaseTier2.png", // Deprecated in v0.52 until further notice (use Town Base 1)
        58: "icons/MapIconTownBaseTier3.png", // Deprecated in v0.52 until further notice (use Town Base 1)

        59: "icons/MapIconStormCannon.png",
        60: "icons/MapIconIntelCenter.png",

        61: "icons/MapIconCoalField.png",
        62: "icons/MapIconOilWell.png",

        70: 'icons/MapIconRocketTarget.png', // nuke target
        71: 'icons/MapIconRocketGroundZero.png', // nuked targer (ground zero)
        72: 'icons/RocketSiteWithRocketMapIcon.png', // nuke site loaded?
        75: 'icons/MapIconFacilityMineOilRig.png' // offshore platform

    }
}


export const WarpApi = new WarpApiSingleton();
