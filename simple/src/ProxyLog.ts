import { Socket } from 'socket.io-client';
import { ClientToServer, commandFromJSON, MouseInfo, RawCommand, UserID } from './network.js';
import { Drawing } from "./Drawing.js";
import { Command, Log } from "./DrawingCommand.js";

interface ServerToClient {
    identify ?: (userID : string) => void;
    change ?: (com:RawCommand, user : UserID) => void;
    response ?: (com : RawCommand, reason : string) => void;
    pointer ?: (pos:MouseInfo, user:UserID) => void;
}

export class ProxyLog extends Log {
    private sock : Socket<ServerToClient, ClientToServer>;
    private userID : string = '';

    constructor (drawing : Drawing, sock : Socket<ServerToClient, ClientToServer>) {
        super(drawing);
        this.sock = sock;
        sock.on('identify', (userID) => {
            this.userID = userID;
        });
        sock.on('change', (rawcom, _user) => {
            // XXX: Don't call super.add(com)  Why not?  Because super.add calls "log"
            console.log("got a change", rawcom);
            const com = commandFromJSON(rawcom);
            com.apply(this.drawing); 
            super.log(com);
            console.log("done with change", com);
            drawing.notifyObservers();
        });
    }

    public add(com : Command) {
        this.sock.emit('request', com);
    }

    /**
     * Add a command to the log that is assumed already done.
     * @param cmd the command to add
     */
    public log(com : Command) {
        com.undo(this.drawing);
        this.add(com);
    }
}
