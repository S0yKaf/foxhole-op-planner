<template>
    <div class="buttons">
        Left Click: Place Object
        Right Click: Remove Object
        <br/>
        Middle Click: Move
        <br />
        <button class="mapButton" v-for="object in objects" :key="object.image" :style="getStyle(object)" :value="object.class" @click="buttonClick(object)">
            <img class="icon" :src="object.image" alt="buttonpng" border="0"/>
        </button>
    </div>
</template>

<script setup>

canvas.viewport.plugins.remove('drag')
canvas.viewport.drag({mouseButtons: "middle"})

const objects = ref([
    {image: "icons/ingame/intel.png", class: Intel, args: ["WARDEN"]},
    {image: "icons/ingame/defense.png", class: Defense, args: ["WARDEN"]},
    {image: "icons/ingame/bunkerT1.png", class: Bunker, args: ["WARDEN", 1]},
    {image: "icons/ingame/bunkerT2.png", class: Bunker, args: ["WARDEN", 2]},
    {image: "icons/ingame/bunkerT3.png", class: Bunker, args: ["WARDEN", 3]},
    {image: "icons/ingame/intel.png",   class: Intel, args: ["COLONIAL"]},
    {image: "icons/ingame/defense.png", class: Defense, args: ["COLONIAL"]},
    {image: "icons/ingame/bunkerT1.png", class: Bunker, args: ["COLONIAL", 1]},
    {image: "icons/ingame/bunkerT2.png", class: Bunker, args: ["COLONIAL", 2]},
    {image: "icons/ingame/bunkerT3.png", class: Bunker, args: ["COLONIAL", 3]},
    {image: "icons/ingame/bunkerT1.png", class: Bunker, args: ["NEUTRAL", 1]},
    {image: "icons/ingame/bunkerT2.png", class: Bunker, args: ["NEUTRAL", 2]},
    {image: "icons/ingame/bunkerT3.png", class: Bunker, args: ["NEUTRAL", 3]},
])

var selected = new Intel("Warden")

canvas.viewport.on("move", onMove)
canvas.viewport.on("click", onClick)

function getStyle(object) {
    var color = ""

    switch (object.args[0]) {
        case "WARDEN":
            color = "#245682"
            break;
        case "COLONIAL":
            color = "#516C4B"
            break;
        case "NEUTRAL":
            color = "#FFF"
            break;

        default:
            break;
    }

    return `background: ${color}`
}

function onClick(e) {

    if (!e.originalEvent.button == 0) {
        return;
    }
    var object = new selected.class(...selected.args)
    var pos = canvas.viewport.toWorld(e.globalX,e.globalY);
    object.position = pos
    canvas.layerStickers.addChild(object)
}

function buttonClick(button) {
    selected = button
}

function onMove(e) {
    var pos = canvas.viewport.toWorld(e.globalX,e.globalY);

}

onBeforeUnmount(() => {
    canvas.viewport.removeListener("move", onMove)
    canvas.viewport.removeListener("click", onClick)
})

</script>

<style>

 /* Style the header */
.buttons {
    display: flexbox;
    height: auto;
    flex-flow:row;
    overflow: scroll;
    /* height: 50em; */
}

.mapButton {
    width: 5em;
    height: 5em;
    align-content: center;
    /* background: #000000ee; */
    /* background-color: #0e52d8; */
    background:#0e52d8;
}

.icon {
    width: 4em;
    mix-blend-mode: multiply;
    background: #000;
}


</style>
