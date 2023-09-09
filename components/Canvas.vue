<template>
<div id="canvas">
</div>
</template>

<script setup>
import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport'
import { autoDetectRenderer } from 'pixi.js';
import { ref } from 'vue';

import { Peer } from "peerjs";
import appConfig from '~/app.config';

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

var host = urlParams.get('host')
var connect = urlParams.get('connect')

var connection = null

if (host) {
    connection = new Host(host)
}

if (connect) {
    connection = new Client(connect)
}

if (connection) {
    canvas.viewport.on("pointermove", move, canvas)
    canvas.viewport.on("pointerdown", onClick, canvas)
    canvas.viewport.on("pointerup", onUp, canvas)
}



function move(e) {
    var last_pos = this.viewport.toWorld(e.globalX,e.globalY);
    last_pos.x += 11264 * 0.5;
    last_pos.y += 12432 * 0.5;

    if (brush.drawing){
        connection.send_data({command: 'draw', args: [last_pos, e.shiftKey]})
    }
}

function onUp(e) {
    connection.send_data({command: 'up', args: []})
}

function onClick(e) {
    if (!e.originalEvent.button == 0) {
        return;
    }
    var last_pos = this.viewport.toWorld(e.globalX,e.globalY);
    last_pos.x += 11264 * 0.5;
    last_pos.y += 12432 * 0.5;

    connection.send_data({command: 'update_brush', args: [brush.size, brush.color.toHex()]})
    connection.send_data({command: 'draw', args: [last_pos, e.shiftKey]})

}

canvas.resize(window.innerWidth,window.innerHeight)

onMounted(() => {
    document.getElementById("canvas").appendChild(canvas.app.view)
    window.addEventListener('resize', resize)
    })

function resize() {
    canvas.resize(window.innerWidth,window.innerHeight)
}

</script>

<style>

</style>
