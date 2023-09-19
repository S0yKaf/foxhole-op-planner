<template>
    <div class="google">
        Login to save maps
        <GoogleSignInButton
            @success="handleLoginSuccess"
            @error="handleLoginError"
        ></GoogleSignInButton>
    </div>
</template>

<script setup>


import { GoogleSignInButton, decodeCredential } from "vue3-google-signin";

var credential = ""


// handle success event
const handleLoginSuccess = (response) => {
  credential = response;
  console.log(decodeCredential(credential));
};

onMounted(() => {

})

onBeforeUnmount(() => {
    console.log("UNLOADING")
})

</script>

<style>
.google {
    display: flexbox;
    flex-direction: column;
    padding: 1em;
    margin: 2em;
    position: absolute;
    color: aliceblue;
    background: #000000AA;
    right: 0em;
    top: 2em;
    gap: 1em;
    /* height: 50em; */
    width: 16em;
    align-content: center;
}

</style>
