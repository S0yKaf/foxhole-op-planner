<template>
  <Tools/>
  <!-- <Google/> -->
  <TopBar/>
  <Canvas/>
  <Footer/>
</template>

<script setup>

onMounted(() => {

  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-1L3QFNH9FS');
})


</script>

<style>

body {
  font-family: 'Jost';
  margin:0;
  padding:0;
  overflow:hidden;
}

canvas {
  display:block;
  width: 100%;
  height: 100%;
}


</style>
