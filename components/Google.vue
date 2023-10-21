<template>
    <div class="google">
        <div ref="googleLoginBtn" v-if="!user"/>
    <!-- <button @click="() => setup_drive()">test</button> -->
    <div v-if="user">
        Welcome {{user}}! <a href="#logout" @click="logout()"> logout </a>
        <div class="maps">
        </div>

        <div>
            <input type="text" placeholder="new map" v-model="mapName"/>
            <button @click="newMap(mapName)"> create </button>
        </div>
        <button @click="() => save()">SAVE</button>

    </div>
    </div>
</template>

<script setup>

import { decodeJwt } from 'jose'
import { useTokenClient, decodeCredential } from "vue3-google-signin";
import { useGsiScript } from 'vue3-google-signin';

const driveApiEndpoint = 'https://www.googleapis.com/drive/v3/files';

const { scriptLoaded, scriptLoadError } = useGsiScript()


const googleLoginBtn = ref(null)
const user = ref()

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
    await createFile()
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

async function createFile() {
        gapi.client.drive.files.create({
        resource: {
        name: 'My New File.txt', // The name of the file
        mimeType: 'text/plain',   // The MIME type of the file
        parents: [app_folder_id]
        },
        media: {
        mimeType: 'text/plain',
        body: 'This is the content of the file.' // The content of the file
        }
    })
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

const save = () => {
    Serializer.save_current()
}

onMounted(async () => {
    google.accounts.id.initialize({
        client_id: "797686098501-cpjla11oe33p2tc6keuro8t313uslnfv.apps.googleusercontent.com",
        callback: handleCredentialResponse,
        auto_select: true
      })
    google.accounts.id.prompt();
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
    // Put your backend code in here
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
    gapi.client.init({
    clientId: '797686098501-cpjla11oe33p2tc6keuro8t313uslnfv.apps.googleusercontent.com',
    discoveryDocs: ['https://people.googleapis.com/$discovery/rest'],
    scope: 'https://www.googleapis.com/auth/drive.file'
}).then(function () {
// Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

// Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
    });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';
        printDocTitle();
    } else {
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
    }
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
