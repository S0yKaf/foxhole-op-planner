<template>
    <div class="header" id="myHeader">
        <div>
            <input type="checkbox" id="show_region" v-model="regions" @change="onRegionChange"/>
            <label for="show_region"> Regions </label>
            <input type="checkbox" id="show_labels" v-model="labels" @change="onLabelChange"/>
            <label for="show_labels"> Labels </label>
        </div>
        <Search/>

    </div>
</template>

<script setup>
import * as PIXI from 'pixi.js';
import { ref } from 'vue';

const appConfig = useAppConfig()


const regions = ref(true)
const labels = ref(true)


function onRegionChange(e) {
    canvas.showRegions = regions.value
    canvas.update_visible()
}

function onLabelChange(e) {
    canvas.showLabels = labels.value
    canvas.update_visible()
}


</script>

<style>

 /* Style the header */
.header {
    display: flex;
    vertical-align: center;
    text-align: center;
    /* padding-top: 1em; */
    padding-left: 1em;
    column-gap: 1em;
    /* height: 3em; */
    width: 100%;
    /* margin: 0 auto; */
    /* padding: 16px 20px; */
    background: #000000DD;
    color: #a22aad;
    position: absolute;
    font-size: 24px;
}

/* The sticky class is added to the header with JS when it reaches its scroll position
.sticky {
  position: absolute;
  top: 0;
  width: 100%
} */

/* Add some top padding to the page content to prevent sudden quick movement (as the header gets a new position at the top of the page (position:fixed and top:0) */

</style>
