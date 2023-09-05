<template>
<div id="canvas">
</div>
</template>

<script setup>
import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport'
import { autoDetectRenderer } from 'pixi.js';
import { ref } from 'vue';
import { Twitter } from '@ckpack/vue-color';

import { Peer } from "peerjs";
import appConfig from '~/app.config';

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

var host = urlParams.get('host')
var connect = urlParams.get('connect')


connection.host = host
connection.id = connect

connection.connect()

connection.on("click", network_click)
connection.on("move", network_draw)
connection.on("connection", on_connect)
connection.on('state', on_state)


const app = new PIXI.Application({
    antialias: true,
    background: '#000000',
    autoResize: true,
    resolution: devicePixelRatio,
});

const viewport = new Viewport({
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    worldWidth: 1000,
    worldHeight: 1000,

    events: app.renderer.events // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
})

app.stage.addChild(viewport)
viewport
    .drag({mouseButtons: "middle"})
    .pinch()
    .wheel()
    .decelerate()


var states = [];

var drawLayer = new PIXI.Container();

//{ 11264, 12432 }
var renderTexture = PIXI.RenderTexture.create({width: 11264, height:12432, scaleMode: PIXI.SCALE_MODES.NEAREST})
const texture = PIXI.Texture.from('foxhole_map.jpg');
texture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;

const renderer = autoDetectRenderer();

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

var map = new PIXI.Sprite(texture);
map.anchor.set(0.5)
map.position.set(0,0)

map.eventMode = "static";

const renderTextureSprite = new PIXI.Sprite(renderTexture);
renderTextureSprite.anchor.set(0.5);
renderTextureSprite.scaleMode = PIXI.SCALE_MODES.NEAREST;

viewport.eventMode = "static";


viewport.addChild(map);
viewport.addChild(drawLayer);
viewport.addChild(renderTextureSprite);
viewport.addChild(brush.overlay)
// Enable interactivity!

var click = false
viewport.on("pointermove", overlay, viewport)
viewport.on("mousedown", onClick, viewport)
viewport.on("mouseup", onUp, viewport)

window.addEventListener('resize', resize);


var last_pos = null;
var remote_last_pos = null;


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

function overlay(e) {
    var pos = viewport.toWorld(e.globalX,e.globalY);
    brush.update_overlay(pos)
}

function onUp(e) {
    click = false
}

function onClick(e) {
    click = true
    last_pos = viewport.toWorld(e.globalX,e.globalY);
    last_pos.x += 11264 * 0.5;
    last_pos.y += 12432 * 0.5;

    connection.send_data({click: last_pos, erase: e.shiftKey, color:brush.color.toHex(), size: brush.size})

    click_draw(last_pos, e.shiftKey);
}

function click_draw(last_pos, erase=false) {
    brush.erase = erase
    var b = brush.get(last_pos)
    viewport.on('pointermove', onDraw)

    app.renderer.render(b, { renderTexture, clear:false, skipUpdateTransform: false })
}

function onDraw(e) {

    if (!click) {
        return
    }

    var pos = viewport.toWorld(e.globalX,e.globalY);
    connection.send_data({move: pos, color:brush.color.toHex(), size: brush.size})
    move_draw(pos)

}

function network_click(data) {
    remote_last_pos = data.click
    remote_brush.erase = data.erase
    remote_brush.color = data.color
    remote_brush.size = data.size
    var b = remote_brush.get(data.click)

    app.renderer.render(b, { renderTexture, clear:false, skipUpdateTransform: false })

}

function network_draw(data) {
    console.log(data)
    var pos = data.move

    pos.x += 11264 * 0.5;
    pos.y += 12432 * 0.5;

    var b = remote_brush.get(pos)
    var l = remote_brush.get_line(remote_last_pos,pos)

    remote_last_pos = pos;

    app.renderer.render(l, { renderTexture, clear:false, skipUpdateTransform: false })
    app.renderer.render(b, { renderTexture, clear:false, skipUpdateTransform: false })

}

function move_draw(pos) {
    pos.x += 11264 * 0.5;
    pos.y += 12432 * 0.5;

    var b = brush.get(pos)
    var l = brush.get_line(last_pos,pos)

    last_pos = pos;

    app.renderer.render(l, { renderTexture, clear:false, skipUpdateTransform: false })
    app.renderer.render(b, { renderTexture, clear:false, skipUpdateTransform: false })

}

function resize() {
	// Resize the renderer
	app.renderer.resize(window.innerWidth, window.innerHeight);
    viewport.resize(window.innerWidth, window.innerHeight);

}

resize();
onMounted(() => { document.getElementById("canvas").appendChild(app.view) })

</script>

<style>

</style>
