<template>
    <div class="google">
    <div v-show="!token">
        Login to save maps
    <button v-show="!token" :disabled="!isReady" @click="() => login()">Login with Google</button>
    </div>
    <button @click="() => setup_drive()">test</button>

    <div class="maps">
    </div>

    <div>
        <input type="text" placeholder="new map" v-model="mapName"/>
        <button @click="newMap(mapName)"> create </button>
    </div>

    </div>
</template>

<script setup>

import { useTokenClient, decodeCredential } from "vue3-google-signin";
import { useGsiScript } from 'vue3-google-signin';

const driveApiEndpoint = 'https://www.googleapis.com/drive/v3/files';

const { scriptLoaded, scriptLoadError } = useGsiScript()


const check_token = async () => {
    let token = localStorage.getItem("google-signin")
    return token
}

var token = null
var app_folder_id

const handleOnSuccess = async (response) => {
    console.log("Access Token: ", response.access_token);
    console.log(response)
    localStorage.setItem("google-signin", response.access_token)
    token = response.access_token
    setup_drive()

};

const newMap = async (v) => {
    await create_folder(v)
    var res = await get_files_in_app()
    console.log(res)
}

const create_app_folder = async (name) => {

    const folderMetadata = {
        name: `${name}`,
        mimeType: 'application/vnd.google-apps.folder',
    };

    const headers = new Headers({
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
    });

    const requestBody = JSON.stringify(folderMetadata);
    var res = await fetch(driveApiEndpoint, {method: 'POST', headers, body: requestBody})
    console.log(await res.json())


}

const create_folder = async (name) => {

    const folderMetadata = {
        name: `${name}`,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [app_folder_id]
    };

    const headers = new Headers({
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
    });

    const requestBody = JSON.stringify(folderMetadata);
    var res = await fetch(driveApiEndpoint, {method: 'POST', headers, body: requestBody})
    console.log(await res.json())


}

const create_file = async (name) => {

    const folderMetadata = {
        name: `${name}`,
        mimeType: 'application/vnd.google-apps.folder',
    };

    const headers = new Headers({
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
    });

    const requestBody = JSON.stringify(folderMetadata);
    var res = await fetch(driveApiEndpoint, {method: 'POST', headers, body: requestBody})
    console.log(await res.json())


}

const get_files = async () => {
    const headers = new Headers({
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
    });

    var res = await fetch(driveApiEndpoint, {method: 'GET', headers})
    var files = await res.json()
    return files

}

const get_files_in_app = async () => {
    const headers = new Headers({
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
    });

    var query = `?q=${app_folder_id} in parents`
    var res = await fetch(driveApiEndpoint + query, {method: 'GET', headers})
    var files = await res.json()
    return files
}

const handleOnError = (errorResponse) => {
  console.log("Error: ", errorResponse);
};

const { isReady, login } = useTokenClient({
  onSuccess: handleOnSuccess,
  onError: handleOnError,
  scope: "https://www.googleapis.com/auth/drive.file",
});

const setup_drive = async () => {
    console.log("YO")
    var res = await get_files()
    var filenames = res.files.map(f => f.name)

    if (!filenames.includes("foxhole_map_data")) {
        await create_app_folder("foxhole_map_data")
    }

    app_folder_id = res.files.find(f => f.name == "foxhole_map_data").id
    console.log(app_folder_id)

}

onMounted(async () => {
    gapi.load('client', () => {
        gapi.client.init( {
        clientId: '797686098501-cpjla11oe33p2tc6keuro8t313uslnfv.apps.googleusercontent.com',
        discoveryDocs: ['https://people.googleapis.com/$discovery/rest'],
        scope: 'profile'
        }).then(function() {
            // 3. Initialize and make the API request.
            return gapi.client.people.people.get({
                'resourceName': 'people/me',
                'requestMask.includeField': 'person.names'
            });
        }).then(function(response) {
            console.log(response.result);
        }, function(reason) {
            console.log('Error: ' + reason.result.error.message);

        })
    })
})

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
