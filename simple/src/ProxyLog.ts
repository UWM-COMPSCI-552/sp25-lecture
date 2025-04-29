import { Socket } from 'socket.io-client';
import { ClientToServer, MouseInfo, UserID } from './network.js';
import { Drawing } from "./Drawing.js";
import { Command, sequenceCommand, undoCommand, MoveShapeCommand, AddShapeCommand, Log } from "./DrawingCommand.js";
import { Group } from './Group.js';
import { Shape } from './Shape.js';
import { Point } from './Point.js';
import { EuclideanVector2D } from './EuclideanVector.js';

/// What follows are interfaces for the JSON objects
/// that are received from the server.
interface RawVector2D {
    dx ?: number;
    dy ?: number;
}

interface RawShape {
    type ?: string;
    id ?: string;
}

interface RawCommand {
    commands ?: unknown, 
    command ?: unknown, 
    shape?:unknown, 
    oldCenter ?:unknown, 
    amount ?: unknown
}

interface ServerToClient {
    change ?: (com:RawCommand, user : UserID) => void;
    response ?: (com : RawCommand, reason : string) => void;
    pointer ?: (pos:MouseInfo, user:UserID) => void;
}

export function shapeFromJSON(json : object) : Shape {
    const obj = json as RawShape;
    return new Group([]); // TODO!!!
}

/**
 * Take a JSON object and return the command object
 * that presumably was serialized to create it.
 * @param json the JSON object to parse
 * @returns a command object
 */
export function commandFromJSON(json : object) : Command {
    const obj = json as RawCommand;

    if (obj.commands !== undefined) {
        if (!Array.isArray(obj.commands)) {
            throw new Error("Invalid command JSON: commands must be an array");
        }
        const commands = obj.commands.map((c) => commandFromJSON(c));
        const result = sequenceCommand(commands);
        return result;
    }

    if (obj.command !== undefined) {
        if (typeof obj.command !== 'object' || obj.command === null) { 
            throw new Error("Invalid command JSON: command must be an object");
        }
        if (obj.shape !== undefined) {
            throw new Error("Invalid command JSON");
        }
        return undoCommand(commandFromJSON(obj.command));
    }
    
    if (typeof obj.shape !== 'object' || obj.shape === null) {
        throw new Error("Invalid shape");
    }
    const sh = shapeFromJSON(obj.shape);
    if (obj.oldCenter) {
        if (typeof obj.oldCenter !== 'object' || obj.oldCenter === null) {
            throw new Error("Invalid old center");
        }
        const oldCenter = obj.oldCenter as Point;
        if (typeof oldCenter.x !== 'number' || typeof oldCenter.y !== 'number') {
            throw new Error("Invalid old center");
        }
        if (!obj.amount) {
            throw new Error("Invalid amount");
        }
        const amount = obj.amount as RawVector2D;
        if (typeof amount.dx !== 'number' || typeof amount.dy !== 'number') {
            throw new Error("Invalid amount");
        }
        return new MoveShapeCommand(sh, oldCenter, new EuclideanVector2D(amount.dx,amount.dy));
    } else {
        return new AddShapeCommand(sh);
    }
}

export class ProxyLog extends Log {
    private sock : Socket<ServerToClient, ClientToServer>;

    constructor (drawing : Drawing, sock : Socket<ServerToClient, ClientToServer>) {
        super(drawing);
        this.sock = sock;
        sock.on('change', (rawcom, _user) => {
            // XXX: Don't call super.add(com)  Why not?  Because super.add calls "log"
            const com = commandFromJSON(rawcom);
            com.apply(this.drawing); 
            super.log(com);
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
