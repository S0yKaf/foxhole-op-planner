<template>
 <div class="header" id="myHeader">
  <!-- <h2>My Header</h2> -->
</div>
</template>

<script setup>
import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport'
import { autoDetectRenderer } from 'pixi.js';

import { Peer } from "peerjs";



const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

var host = urlParams.get('host')
var connect = urlParams.get('connect')

console.log(host)
console.log(connect)

const connection = new Connection(host, connect);
var brush = new Brush();
connection.on("click", click_draw)
connection.on("move", move_draw)


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

document.body.appendChild(app.view);
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

    connection.send_data({click: last_pos, erase: e.shiftKey})

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
    connection.send_data({move: pos})
    move_draw(pos)

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

</script>

<style>

body {
  margin:0;
  padding:0;
  overflow:hidden;
}

canvas {
  display:block;
  width: 100%;
  height: 100%;
}


 /* Style the header */
.header {
  padding: 10px 16px;
  background: #000000FF;
  color: #f1f1f1;
}

/* Page content */
.content {
  padding: 16px;
}

/* The sticky class is added to the header with JS when it reaches its scroll position */
.sticky {
  position: fixed;
  top: 0;
  width: 100%
}

/* Add some top padding to the page content to prevent sudden quick movement (as the header gets a new position at the top of the page (position:fixed and top:0) */
.sticky + .content {
  padding-top: 102px;
}
</style>
