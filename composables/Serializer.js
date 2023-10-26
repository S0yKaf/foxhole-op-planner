

class SerializerSingleton {

    constructor(){

    }

    save_current() {
        var stateFile = {}

        stateFile.stickers = []

        canvas.layerStickers.children.forEach((c) => {
            stateFile.stickers.push(c.getData())
        })

        return stateFile
    }

}




export const Serializer = new SerializerSingleton();
