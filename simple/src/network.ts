import { Point } from "./Point.js";
import { Command } from "./DrawingCommand.js";

export const PORT = 54181;

export type UserID = string;
export type MouseInfo = Point;

export interface ClientToServer {
    request ?: (com: Command) => void;
    pointer ?: (pos:MouseInfo) => void;
}

export interface ServerToClient {
    change ?: (com:Command, user : UserID) => void;
    response ?: (com : Command, reason : string) => void;
    pointer ?: (pos:MouseInfo, user:UserID) => void;
}