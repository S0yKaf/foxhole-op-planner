<template>
    <div>
        <div class="buttons">
        Left Click: Place Object
        Right Click: Remove Object
        <br/>
        Middle Click: Move
        <br />
        <button class="mapButton" v-for="object in mesureTools" :key="object.image" :value="object.class" @click="buttonClick(object)">
            {{object.name}}
        </button>
    </div>

    </div>
</template>

<script setup>

import * as PIXI from 'pixi.js';

canvas.viewport.plugins.remove('drag')
canvas.viewport.drag({mouseButtons: "middle"})


canvas.viewport.on("pointermove", onMove)
canvas.viewport.on("click", onClick)


const mesureTools = ref([
    { name: "Line", class: MesureLine},
    { name: "Circle", class: MesureCircle},
])

var selected = MesureLine
var active_line


function buttonClick(object) {
    selected = object.class
}

function onClick(e) {

    if (!e.originalEvent.button == 0) {
        return;
    }

    if (active_line) {
        if (connection) {
            connection.send_data({command: "object", args: active_line})
        }
        active_line = null
        return
    }

    if (!active_line) {
        active_line = new selected()
        var pos = canvas.viewport.toWorld(e.globalX,e.globalY);
        canvas.layerStickers.addChild(active_line)
        active_line.position = pos
    }

    console.log(active_line)

}

function onMove(e) {
    if (!active_line)
        return

    var pos = canvas.viewport.toWorld(e.globalX,e.globalY);
    var x =  pos.x - active_line.position.x
    var y =  pos.y - active_line.position.y
    active_line.update(new PIXI.Point(x,y))

}


onBeforeUnmount(() => {
    console.log("UNLOADING")
    canvas.viewport.removeListener("move", onMove)
    canvas.viewport.removeListener("click", onClick)
})

</script>

<style>

</style>
