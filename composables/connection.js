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
    }

    connect() {

        this.peer = new Peer(this.host || null, this.appConfig.peerjs_config);

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
                self.handle_data(data, conn);
            })

            self.connections.push(conn);

            conn.on('open', () => {
                conn.send('hello!');
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

    setup() {
        self = this
        this.connection.on("data", (data) => {
            self.handle_data(data)
        })
    }

    send_data(data) {
        this.connections.forEach((c) => {
            c.send(data)
        })
    }
}
