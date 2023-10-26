<template>
    <div class="google">
        <div ref="googleLoginBtn" v-if="!user"/>
    <!-- <button @click="() => setup_drive()">test</button> -->
    <div v-if="user">
        Welcome {{user}}! <a href="#logout" @click="logout()"> logout </a>
        <div class="maps">
        </div>

        <div>
            <div>
                Maps:
                <!-- eslint-disable-next-line no-use-before-define -->
                <li v-for="map in maps" :key=map.name> <button @click="changeMap(map)"> {{map.name}} </button> </li>
            </div>
            <input type="text" placeholder="new map" v-model="mapName"/>
            <button @click="newMap(mapName)"> create </button>
        </div>
        <button @click="() => save()">SAVE</button>

    </div>
    </div>
</template>

<script setup>

import { decodeJwt } from 'jose'


const googleLoginBtn = ref(null)
const user = ref()
const maps = ref()

const check_token = async () => {
    let token = localStorage.getItem("google-signin")
    return token
}

var token = null
var access_token = null
var app_folder_id
var selected_map = null


const changeMap = async (map) => {
    selected_map = map.id
}

const newMap = async (v) => {
    var root = await create_folder(v)
    var mapTiles = await create_folder('mapTiles',root)
    maps.value = await getMaps()
}

const create_folder = async (name,parent=null) => {

    const folderMetadata = {
        name: `${name}`,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parent || app_folder_id]
    };

    var response = await gapi.client.drive.files.create(folderMetadata)
    return response.result.id

}

const save = async () => {
    var state = Serializer.save_current()

    for await (const img of canvas.saveDrawings()) {
        writeFile(selected_map, img[0] + '.png', img[1],'image/png')
    }

    writeFile(selected_map,"mapData.json", state)
}

onMounted(async () => {
    google.accounts.id.initialize({
        client_id: "797686098501-cpjla11oe33p2tc6keuro8t313uslnfv.apps.googleusercontent.com",
        callback: handleCredentialResponse,
        auto_select: true
      })
    google.accounts.id.prompt()
    google.accounts.id.renderButton(
    googleLoginBtn.value, {
        text: 'signin_with', // or 'signup_with' | 'continue_with' | 'signin'
        size: 'large', // or 'small' | 'medium'
        //   width: '366', // max width 400
        theme: 'outline', // or 'filled_black' |  'filled_blue'
        logo_alignment: 'left' // or 'center'
    })

})

const logout = async () => {
    const responsePayload = decodeJwt(token);
    google.accounts.id.revoke(responsePayload.email, done => {
        user.value = null
        token = null

    })
}

async function handleCredentialResponse(response) {
    const responsePayload = decodeJwt(response.credential);
    user.value = responsePayload.given_name
    localStorage.setItem("google-signin", response.credential)
    token = response.credential

    if (localStorage.getItem("access_token")) {
        handleAuthResponse(localStorage.getItem("access_token"))
        return
    }

    const client = google.accounts.oauth2.initTokenClient({
        client_id: "797686098501-cpjla11oe33p2tc6keuro8t313uslnfv.apps.googleusercontent.com",
        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.install',
        callback: handleAuthResponse,
        error_callback: (res) => {console.log(res)},
        prompt: '',
        login_hint: responsePayload.sub
    })

    client.requestAccessToken()
    // Put your backend code in here
}

async function handleAuthResponse(token) {
    access_token = token
    localStorage.setItem("access_token", token)

    await gapi.load('client', async ()=> {
        await gapi.client.init({})
        .then(async ()=> {
            await gapi.client.load('drive', 'v3');
            await gapi.client.setToken(access_token)
        }).then((res) => {
            setupDrive()
        })
    })
}

async function getFiles() {
    var res = await gapi.client.drive.files.list()
    var files = res.result.files
    return files
}

async function getMaps() {
    var response = await gapi.client.drive.files.list({
        q: `mimeType=\'application/vnd.google-apps.folder\' and \'${app_folder_id}\' in parents`
    })
    return response.result.files
}

async function setupDrive() {
    var files = await getFiles()
    var root = files.length > 0 ? files.find(f => f.name == "foxhole_op_planner_data").id : null
    if (!root) {
        var res = await gapi.client.drive.files.create({
            name: "foxhole_op_planner_data",
            mimeType: 'application/vnd.google-apps.folder',
        })
        root = res.result.id
    }
    localStorage.setItem("root_folder", root)
    app_folder_id = root
    maps.value = await getMaps()
}

async function writeFile(mapId, name, data, contentType='application/json') {

    const metadata = {
        name: name,
        parents: [mapId],
    };

    const form = new FormData()

    const processedData = contentType == 'application/json' ? JSON.stringify(data) : data
    form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
    form.append('file', processedData);

    var res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${access_token.access_token}` },
        body: form
    })
}

onBeforeUnmount(() => {
    return
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
