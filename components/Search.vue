<template>
    <div class="search" id="search">
        <label for="place">Search: </label>
        <input list="places" @change="onChange($event)" />
            <datalist id='places'>
                <option v-for="option in options" :key="option.value" :value="option.value">
                    {{ option.text }}
                </option>
            </datalist>
    </div>
</template>

<script setup>

const appConfig = useAppConfig()
var selected
var labels = canvas.layerLabels.children.map(c => {return c.text})
const options = ref(canvas.layerLabels.children.map(c => {
    return {
        text: c.text,
        value: c.text
    }
}))

function onChange(event) {
    if (!event.target)
        return
    var text = event.target.value
    var target = canvas.layerLabels.children.find(c => c.text == text)
    canvas.viewport.animate({time:1000,position:target.position, scale:1.2})
}

</script>

<style>


/* The sticky class is added to the header with JS when it reaches its scroll position
.sticky {
  position: absolute;
  top: 0;
  width: 100%
} */

/* Add some top padding to the page content to prevent sudden quick movement (as the header gets a new position at the top of the page (position:fixed and top:0) */

</style>
