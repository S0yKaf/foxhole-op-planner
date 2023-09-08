const mapHeight = 12432;
const mapWidth = 11264;
const mapOrigin = {x:0, y:0};

const gridSize = { width: 11264, height: 12432 };
const hexWidth = mapWidth/14; // Define the width of your hexagon
const hexHeight = mapHeight/14; // Define the height of your hexagon
const hexSize = 1024;

export const o = mapOrigin; // Shortened
export const k = mapHeight/7; // Standard Region Height
export const w = k*2; // Standard Region Width

const SQRT3 = Math.sqrt(3)

export const regions = [
    {id:"DeadLandsHex",          name:"Deadlands",             center:hexCenterToGridPosition(0,0)},
    {id:"CallahansPassageHex",   name:"Callahans Passage",     center:hexCenterToGridPosition(0,-1)},
    {id:"MarbanHollow",          name:"Marban Hollow",         center:hexCenterToGridPosition(1,-1)},
    {id:"UmbralWildwoodHex",     name:"Umbral Wildwood",       center:hexCenterToGridPosition(0,1)},
    {id:"MooringCountyHex",      name:"The Moors",             center:hexCenterToGridPosition(-1,-1)},
    {id:"HeartlandsHex",         name:"The Heartlands",        center:hexCenterToGridPosition(-1,2)},
    {id:"LochMorHex",            name:"Loch Mór",              center:hexCenterToGridPosition(-1,1)},
    {id:"LinnMercyHex",          name:"The Linn of Mercy",    center:hexCenterToGridPosition(-1,0)},
    {id:"ReachingTrailHex",      name:"Reaching Trail",       center:hexCenterToGridPosition(0,-2)},
    {id:"StonecradleHex",        name:"Stonecradle",          center:hexCenterToGridPosition(-2,0)},
    {id:"FarranacCoastHex",      name:"Farranac Coast",       center:hexCenterToGridPosition(-3,1)},
    {id:"WestgateHex",           name:"Westgate",             center:hexCenterToGridPosition(-3,2)},
    {id:"KingsCageHex",          name:"Kings Cage",           center:hexCenterToGridPosition(-2,1)},
    {id:"SableportHex",          name:"Sableport",            center:hexCenterToGridPosition(-2,2)},
    // {id:15,name:"Fisherman's Row",      center:hexCenterToGridPosition(1,-1)},
    // {id:16,name:"The Oarbreaker Isles", center:hexCenterToGridPosition(1,-1)},
    {id:"GreatMarchHex",         name:"Great March",          center:hexCenterToGridPosition(0,2)},
    {id:"TempestIslandHex",      name:"Tempest Island",       center:hexCenterToGridPosition(3,-1)},
    {id:"GodcroftsHex",          name:"Godcrofts",            center:hexCenterToGridPosition(3,-2)},
    {id:"EndlessShoreHex",       name:"Endless Shore",        center:hexCenterToGridPosition(2,-1)},
    {id:"AllodsBightHex",        name:"Allod's Bight",        center:hexCenterToGridPosition(2,0)},
    {id:"WeatheredExpanseHex",   name:"Weathered Expanse",    center:hexCenterToGridPosition(2,-2)},
    {id:"DrownedValeHex",        name:"The Drowned Vale",     center:hexCenterToGridPosition(1,0)},
    {id:"ShackledChasmHex",      name:"Shackled Chasm",       center:hexCenterToGridPosition(1,1)},
    {id:"ViperPitHex",           name:"Viper Pit",            center:hexCenterToGridPosition(1,-2)},
    {id:"NevishLineHex",         name: "Nevish Line",         center:hexCenterToGridPosition(-3,0)},
    {id:"AcrithiaHex",           name: "Acrithia",            center:hexCenterToGridPosition(1,2)},
    {id:"RedRiverHex",           name: "Red River",           center:hexCenterToGridPosition(-1,3)},
    {id:"CallumsCapeHex",        name: "Callum's Cape",       center:hexCenterToGridPosition(-2,-1)},
    {id:"SpeakingWoodsHex",      name: "Speaking Woods",      center:hexCenterToGridPosition(-1,-2)},
    {id:"BasinSionnachHex",      name: "Basin Sionnach",      center:hexCenterToGridPosition(0,-3)},
    {id:"HowlCountyHex",         name: "Howl County",         center:hexCenterToGridPosition(1,-3)},
    {id:"ClansheadValleyHex",    name: "Clanshead Valley",    center:hexCenterToGridPosition(2,-3)},
    {id:"MorgensCrossingHex",    name: "Morgens Crossing",    center:hexCenterToGridPosition(3,-3)},
    {id:"TheFingersHex",         name: "The Fingers",         center:hexCenterToGridPosition(3,0)},
    {id:"TerminusHex",           name: "Terminus",            center:hexCenterToGridPosition(2,1)},
    {id:"KalokaiHex",            name: "Kalokai",             center:hexCenterToGridPosition(0,3)},
    {id:"AshFieldsHex",          name: "Ash Fields",          center:hexCenterToGridPosition(-2,3)},
    {id:"OriginHex",             name: "Origin",              center:hexCenterToGridPosition(-3,3)},

];

function hexToCartesian(q, r, hexSize) {
    const x = hexSize * (3.*0.5 * q)
    const y = hexSize * (SQRT3*0.5 * q + SQRT3 * r)
    return { x, y };
  }


function hexCenterToGridPosition(q, r) {
    const { x, y } = hexToCartesian(q, r, hexSize);
    return [ x, y];
}


export function getMapItemPosition(mapId, x, y) {
    var center = regions.find((region) => region.id == mapId).center
    var h = hexSize * SQRT3
    var w = hexSize * 2


    return [w * (x - 0.5) + center[0], h * (y - 0.5) + center[1]]
}
