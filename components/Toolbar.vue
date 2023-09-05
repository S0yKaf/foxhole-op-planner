<template>
    <div class="header" id="myHeader">
        <Grayscale v-model="colors" :palette='palette'></Grayscale>
        <input type="range" min="1" max="50" v-model="brushSize" class="slider" />
    </div>
</template>

<script setup>
import * as PIXI from 'pixi.js';
import { ref } from 'vue';
import { Grayscale } from '@ckpack/vue-color';
import appConfig from '~/app.config';


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
    justify-content: space-between;
    margin: 0 auto;
    padding: 16px 20px;
    background: #00000088;
    color: #913333;
    position: absolute;
}

.slider {
    margin-left: 20px;
}

.vc-grayscale {
    width: 100%;
}

/* The sticky class is added to the header with JS when it reaches its scroll position
.sticky {
  position: absolute;
  top: 0;
  width: 100%
} */

/* Add some top padding to the page content to prevent sudden quick movement (as the header gets a new position at the top of the page (position:fixed and top:0) */

</style>
