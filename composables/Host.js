import { Peer } from "peerjs";
import { EventEmitter, ValidEventTypes } from "eventemitter3";


export class Host extends EventEmitter {

    appConfig = useAppConfig()

    peer = null
    room_name = null
    connections = []
    brushes = {}

    constructor(name=null) {
        super()
        this.peer = new Peer(name || null, this.appConfig.peerjs_config);


        this.peer.on('open', (id) => {
            this.room_name = id
            console.log('My peer ID is: ' + id);
        });

        this.peer.on("error", (err) => {
            console.log(err)
        })

        this.peer.on("connection", (conn) => {
            conn.on("data", (data) => {
                this.handle_data(data, conn);
            })

            console.log("connected")
            this.connections.push(conn);

            conn.on('open', () => {
                this.send_initial_state(conn)
            });

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

            case "object":
                canvas.layerStickers.addChild(data.args)
                break;

            case "update_brush":
                this.brushes[data.peer].size = data.args[0]
                this.brushes[data.peer].color = data.args[1]
                break;

            default:
                break;
        }

        this.propagate_data(data)
    }

    send_initial_state(conn) {
        var url = canvas.app.renderer.extract.canvas(canvas.renderTexture).toDataURL()
        conn.send({command: 'init', args: [url]})
    }

    propagate_data(data) {
        if (!data.peer) {
            return
        }
        this.connections.forEach((c) => {
            if (c.peer == data.peer) {
                return;
            }
            c.send(data)
        })
    }

    send_data(data) {
        data['peer'] = this.room_name
        this.connections.forEach((c) => {
            c.send(data)
        })
    }
}
