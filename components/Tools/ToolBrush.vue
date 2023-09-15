<template>
    <div>
        <Grayscale v-model="colors" :palette='palette'></Grayscale>
        <input type="range" min="1" max="50" v-model="brushSize" class="slider" />
    </div>
</template>

<script setup>
import * as PIXI from 'pixi.js';
import { ref } from 'vue';
import { Grayscale } from '@ckpack/vue-color';

const appConfig = useAppConfig()

const colors = ref(appConfig.colors[0]);
const palette = ref(appConfig.colors)
const brushSize = ref(10);

canvas.viewport.plugins.remove('drag')
canvas.viewport.drag({mouseButtons: "middle"})

var brush = new Brush(true)


if (connection) {
    canvas.viewport.on("pointermove", move, canvas)
    canvas.viewport.on("pointerdown", onClick, canvas)
    canvas.viewport.on("pointerup", onUp, canvas)
}


watch(colors, () => {
    var c = new PIXI.Color(colors.value.hex)
    brush.color = c
}, { immediate: true })

watch(brushSize, () => {
    brush.size = brushSize.value
}, { immediate: true })


function move(e) {
    if (!brush)
        return

    var last_pos = this.viewport.toWorld(e.globalX,e.globalY);
    last_pos.x += 11264 * 0.5;
    last_pos.y += 12432 * 0.5;

    if (brush.drawing){
        connection.send_data({command: 'draw', args: [last_pos, e.shiftKey]})
    }
}

function onUp(e) {
    if (!brush)
        return

    connection.send_data({command: 'up', args: []})
}

function onClick(e) {
    if (!e.originalEvent.button == 0) {
        return;
    }

    if (!brush)
        return

    var last_pos = this.viewport.toWorld(e.globalX,e.globalY);
    last_pos.x += 11264 * 0.5;
    last_pos.y += 12432 * 0.5;

    connection.send_data({command: 'update_brush', args: [brush.size, brush.color.toHex()]})
    connection.send_data({command: 'draw', args: [last_pos, e.shiftKey]})

}

onBeforeUnmount(() => {
    brush.delete()
    brush = null
})

</script>

<style>

 /* Style the header */
.container {
    display: flex;
    flex-direction: column;
    padding-top: 8em;
    position: absolute;
    gap: 1em;
    height: 50em;
}

.panel {
    vertical-align: center;
    /* height: auto; */
    background: #000000DD;
    color: azure;
    display: flex;
    flex-direction: column;
    padding: 1em;
    margin-left: 20px;
    min-height: 20em;
    min-width: 10em;
}

.vc-grayscale {
    margin-top: 0.3em;
    vertical-align: center;
    align-content: center;
    height: auto;
}

</style>
