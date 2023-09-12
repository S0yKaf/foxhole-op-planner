<template>
    <div class="header" id="myHeader">
        <Grayscale v-model="colors" :palette='palette'></Grayscale>
        <input type="range" min="1" max="50" v-model="brushSize" class="slider" />
        <input type="checkbox" id="show_region"/>
        <label for="show_region"> Regions </label>

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


watch(colors, () => {
    var c = new PIXI.Color(colors.value.hex)
    brush.color = c
}, { immediate: true })

watch(brushSize, () => {
    brush.size = brushSize.value
}, { immediate: true })

</script>

<style>

 /* Style the header */
.header {
    display: flex;
    vertical-align: center;
    text-align: center;
    /* padding-top: 1em; */
    padding-left: 1em;
    /* height: 3em; */
    width: 100%;
    /* margin: 0 auto; */
    /* padding: 16px 20px; */
    background: #000000DD;
    color: #a22aad;
    position: absolute;
    font-size: 24px;
}

.slider {
    vertical-align: center;
    /* height: auto; */
    display: flex;
    margin-left: 20px;
}

.vc-grayscale {
    margin-top: 0.3em;
    vertical-align: center;
    align-content: center;
    width: auto;
    height: 0.7em;
}

/* The sticky class is added to the header with JS when it reaches its scroll position
.sticky {
  position: absolute;
  top: 0;
  width: 100%
} */

/* Add some top padding to the page content to prevent sudden quick movement (as the header gets a new position at the top of the page (position:fixed and top:0) */

</style>
