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
        self = this
        this.peer.on('open', (id) => {
            self.client = id
            console.log('My peer ID is: ' + id);

            self.host = self.peer.connect(self.host);
            self.host.on("open", () => {
                self.setup()
                self.host.send("hello")
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
                var state = data.args[0]
                canvas.init_from_host(state)
                break;

            default:
                break;
        }
    }


    setup() {
        self = this
        this.host.on("data", (data) => {
            self.handle_data(data)
        })
    }

    send_data(data) {
        data['peer'] = this.client
        this.host.send(data)
    }
}
