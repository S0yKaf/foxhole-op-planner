import { Peer } from "peerjs";
import { EventEmitter, ValidEventTypes } from "eventemitter3";


export class Host {

    peer = null
    room_name = null
    connections = []

    constructor(name=null) {
        this.peer = new Peer(name || null, this.appConfig.peerjs_config);

        self = this
        this.peer.on('open', (id) => {
            this.room_name = id
            console.log('My peer ID is: ' + id);
        });

        this.peer.on("error", function(err) {
            console.log(err)
        })

        this.peer.on("connection", function(conn) {
            conn.on("data", function(data) {
                self.handle_data(data, conn);
            })

            self.connections.push(conn);

            conn.on('open', () => {
                self.emit("connection", conn)
            });

        })
    }

    handle_data(data, conn = null) {
        if (data.click) {
           this.emit("click", data)
        }
        if (data.move) {
            this.emit("move", data)
        }

        if (data.state) {
            this.emit("state", data.state)
        }

        if (this.host) {
            this.connections.forEach((c) => {
                if (c == conn) {
                    return;
                }
                c.send(data)
            })
        }
    }

    send_data(data) {
        this.connections.forEach((c) => {
            c.send(data)
        })
    }
}
