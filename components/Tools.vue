<template>
    <div class=container>
        <div class="panel tools">
            <button v-for="tool in tools" :key="tool.name" :value="tool.name" @click="select(tool.component)">
                {{ tool.name }} ({{tool.shortcut}})
            </button>
        </div>
        <div class="panel tools-options">
            <component :is="selected" />
        </div>
    </div>
</template>

<script setup>
import * as PIXI from 'pixi.js';
import { ref } from 'vue';
import { Grayscale } from '@ckpack/vue-color';
import { ToolBrush, ToolMapObjects, ToolMesure, ToolMove } from '#components';


const appConfig = useAppConfig()

const selected = ref(ToolMove)
const tools = ref([
    {name: "Move", component: ToolMove, shortcut: "M"},
    {name: "Brush", component: ToolBrush, shortcut: "B"},
    {name: "Map Objects", component: ToolMapObjects, shortcut: "T"},
    {name: "Mesure", component: ToolMesure, shortcut: "D"}

])

const select = (comp) => {
    selected.value = comp
}

onMounted(() => {
    window.addEventListener("keypress", (event) => {
        var key = event.key.toUpperCase()
        var tool = tools.value.find((obj) => obj.shortcut == key)
        if (tool) {
            select(tool.component)
        }
    })
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
    width: 16em;
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
    /* min-height: 20em; */
    min-width: 10em;
}


</style>
