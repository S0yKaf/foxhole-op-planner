<template>
    <div>

    </div>
</template>

<script setup>

canvas.viewport.plugins.remove('drag')
canvas.viewport.drag({mouseButtons: "left"})

onBeforeUnmount(() => {
    console.log("UNLOADING")
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
    min-height: 20em;
    min-width: 10em;
}

.vc-grayscale {
    margin-top: 0.3em;
    vertical-align: center;
    align-content: center;
    height: auto;
}

</style>
