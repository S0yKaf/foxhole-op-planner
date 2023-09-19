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
import { set_connection } from '~/composables/_Globals';

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

var host = urlParams.get('host')
var connect = urlParams.get('connect')

if (host) {
    set_connection(new Host(host))
}

if (connect) {
    set_connection(new Client(connect))
}

canvas.resize(window.innerWidth,window.innerHeight)

onMounted(() => {
    document.getElementById("canvas").appendChild(canvas.app.view)
    window.addEventListener('resize', resize)

    window.setInterval(() => {
        canvas.refreshCaptures()
    },30000)

    })

    globalThis.__PIXI_APP__ = canvas.app;

function resize() {
    canvas.resize(window.innerWidth,window.innerHeight)
}

</script>

<style>

</style>
