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


connection.host = host
connection.id = connect

// connection.connect()

// connection.on("click", network_click)
// connection.on("move", network_draw)
// connection.on("connection", on_connect)
// connection.on('state', on_state)


function on_connect(conn) {
    var url = app.renderer.extract.canvas(renderTexture).toDataURL()
    conn.send({state: url})

}

function on_state(state) {
    var sprite = PIXI.Sprite.from(state)
    sprite.texture.baseTexture.on("loaded",() => {
        app.renderer.render(sprite, { renderTexture, clear:false, skipUpdateTransform: false })
    })
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
