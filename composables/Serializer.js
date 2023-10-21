

class SerializerSingleton {

    constructor(){

    }

    save_current() {
        canvas.layerStickers.children.forEach((c) => {
            console.log(c.toString())
        })
    }

}




export const Serializer = new SerializerSingleton();
