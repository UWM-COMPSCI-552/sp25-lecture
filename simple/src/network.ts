import { Point } from "./Point.js";
import { Command, sequenceCommand, undoCommand, MoveShapeCommand, AddShapeCommand, Log } from "./DrawingCommand.js";
import { Shape, ShapeJSON } from "./Shape.js";
import { EuclideanVector2D } from "./EuclideanVector.js";

export const PORT = 54181;

export type UserID = string;
export type MouseInfo = Point;

export interface ClientToServer {
    request ?: (com: Command) => void;
    pointer ?: (pos:MouseInfo) => void;
}

export interface ServerToClient {
    identify ?: (userID : string) => void;
    change ?: (com:Command, user : UserID) => void;
    response ?: (com : Command, reason : string) => void;
    pointer ?: (pos:MouseInfo, user:UserID) => void;
}

/// What follows are interfaces for the JSON objects
/// that are received from the server.
export interface RawVector2D {
    dx ?: number;
    dy ?: number;
}

export interface RawCommand {
    commands ?: unknown, 
    command ?: unknown, 
    shape?:unknown, 
    oldCenter ?:unknown, 
    amount ?: unknown
}


export function shapeFromJSON(json : object) : Shape {
    return Shape.fromJSON(json as ShapeJSON);
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
