import { Peer } from "peerjs";
import { EventEmitter, ValidEventTypes } from "eventemitter3";


export class Connection extends EventEmitter {

    connections = [];
    listeners = [];
    appConfig = useAppConfig()

    constructor(host, id) {
        super()
        this.host = host
        this.id = id
        this.connections = []
        this.connection


        this.peer = new Peer(host || null, this.appConfig.peerjs_config);

        self = this
        this.peer.on('open', (id) => {
            console.log('My peer ID is: ' + id);

            if (self.id) {
                self.connection = self.peer.connect(self.id);
                self.connection.on("open", () => {
                    self.setup()
                    self.connection.send("hello")
                    self.connections.push(self.connection)
                })

            }

        });

        this.peer.on("error", function(err) {
            console.log(err)
        })

        this.peer.on("connection", function(conn) {
            conn.on("data", function(data) {
                self.handle_data(data);
            })

            self.connections.push(conn);

            conn.on('open', () => {
                conn.send('hello!');
            });

        })

    }

    handle_data(data) {
        console.log(data)
        if (data.click) {
           this.emit("click", data.click, data.erase)
        }
        if (data.move) {
            this.emit("move", data.move)
        }
    }

    setup() {
        self = this
        this.connection.on("data", (data) => {
            self.handle_data(data)
        })
    }

    send_data(data) {
        this.connections.forEach( (c) => {
            c.send(data);
        })

    }
}
