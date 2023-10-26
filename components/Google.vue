<template>
    <div class="google">
    <div v-if="!user">
        Sign in to google to save your map
        <div ref="googleLoginBtn" v-if="!user"/>
    </div>
    <!-- <button @click="() => setup_drive()">test</button> -->
    <div v-if="user">
        Welcome {{user}}! <a href="#logout" @click="logout()"> logout </a>
        <div class="maps">
        </div>

        <div>
            <!-- <div> -->
                <!-- Maps: -->
                <!-- eslint-disable-next-line no-use-before-define -->
                <!-- <li v-for="map in maps" :key=map.name> <button @click="changeMap(map)"> {{map.name}} </button> </li>
            </div>
            <input type="text" placeholder="new map" v-model="mapName"/>
            <button @click="newMap(mapName)"> create </button> -->
        </div>
        <br />
        <button @click="() => save()">SAVE MAP</button>

    </div>
    </div>
</template>

<script setup>

import { decodeJwt } from 'jose'


const googleLoginBtn = ref(null)
const user = ref()
const maps = ref()

var userSub = null

var token = null
var access_token = null
var app_folder_id
var selected_map = null

var tokenClient = null


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
    var maps = await getMaps()

    if (maps.length <= 0) {
        await newMap('default')
        maps = await getMaps()
    }

    selected_map = maps[0].id
    var files = await getMapFiles(maps[0])
    var tilesFolder = files.find(f => f.name == "mapTiles")
    var tiles = await getMapFiles(tilesFolder)
    console.log(tiles)
    console.log(files)


    var state = Serializer.save_current()

    for await (const img of canvas.saveDrawings()) {
        var tile = tiles.find(f => f.name == `${img[0]}.png`)
        if (tile) {
            // TODO
        } else {
            writeFile(tilesFolder.id, img[0] + '.png', img[1],'image/png')
        }
    }

    var mapData = files.find(f => f.name == "mapData.json")
    if (mapData) {
        // TODO
    } else {
        writeFile(selected_map,"mapData.json", state)
    }
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
    userSub = responsePayload.sub
    user.value = responsePayload.given_name
    token = response.credential


    await setupGapi()
    await setupTokenClient(responsePayload)

    if (localStorage.getItem("access_token")) {
        access_token = JSON.parse(localStorage.getItem("access_token"))
        gapi.client.setToken(access_token)
    } else {
        tokenClient.requestAccessToken()
    }

    await setupDrive()

}

async function setupTokenClient() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: "797686098501-cpjla11oe33p2tc6keuro8t313uslnfv.apps.googleusercontent.com",
        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.install',
        callback: handleAuthResponse,
        error_callback: (res) => {console.log("YOOO",res)},
        prompt: 'none',
        login_hint: userSub
    })
}

async function setupGapi() {
        // await gapi.client.setToken(access_token)

        await gapi.load('client', async ()=> {
        await gapi.client.init({})
        .then(async ()=> {
            await gapi.client.load('drive', 'v3');
        })
    })
}

async function handleAuthResponse(token) {
    access_token = token
    localStorage.setItem("access_token", JSON.stringify(token))
    await gapi.client.setToken(access_token)

}

function refreshToken() {
    tokenClient.requestAccessToken()
}

async function getFiles() {
    var res
    try {
        res = await gapi.client.drive.files.list()
    } catch {
        tokenClient.requestAccessToken()
        getFiles()
    }
    console.log(res)
    console.log("YO")
    var files = res.result.files
    return files
}

async function getMaps() {
    var response = await gapi.client.drive.files.list({
        q: `mimeType=\'application/vnd.google-apps.folder\' and \'${app_folder_id}\' in parents`
    })
    return response.result.files
}

async function getMapFiles(map) {
    var response = await gapi.client.drive.files.list({
        q: `\'${map.id}\' in parents`
    })
    return response.result.files
}

async function setupDrive() {
    var files = await getFiles()

    var root = null
    if (files.length > 0) {
        root = files.find(f => f.name == "foxhole_op_planner_data")
        root = root ? root.id : null
    }

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
