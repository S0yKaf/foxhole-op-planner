import { Peer } from "peerjs";
import { EventEmitter, ValidEventTypes } from "eventemitter3";


export class Client extends EventEmitter {

    appConfig = useAppConfig()

    peer = null
    client = null
    host = null

    peers = []
    brushes = {}

    constructor(host, name=null) {
        super()
        this.peer = new Peer(name || null, this.appConfig.peerjs_config);
        this.host = host


        this.peer.on('open', (id) => {
            this.client = id
            console.log('My peer ID is: ' + id);

            this.host = this.peer.connect(this.host);
            this.host.on("open", () => {
                this.setup()
                this.host.send("hello")
            })

        });

        this.peer.on("error", function(err) {
            console.log(err)
        })

    }

    handle_data(data, conn = null) {
        if (!this.brushes[data.peer]) {
            this.brushes[data.peer] = new Brush()
        }

        switch (data.command) {
            case "draw":
                this.brushes[data.peer].draw(data.args[0], data.args[1])
                break;

            case "up":
                this.brushes[data.peer].up()
                break;

            case "update_brush":
                this.brushes[data.peer].size = data.args[0]
                this.brushes[data.peer].color = data.args[1]
                break;

            case "init":
                canvas.init_from_host(data.args[0])
                break;

            default:
                break;
        }
    }


    setup() {
        this.host.on("data", (data) => {
            this.handle_data(data)
        })
    }

    send_data(data) {
        data['peer'] = this.client
        this.host.send(data)
    }
}
