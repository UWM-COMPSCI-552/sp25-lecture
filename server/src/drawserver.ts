import { Server as ServerSocket } from 'socket.io';
import http from 'http';
import { Drawing } from './client/Drawing.js';
import { ServerToClient, MouseInfo, RawCommand, commandFromJSON } from './client/network.js';
import { Command } from './client/DrawingCommand.js';
import { nanoid } from 'nanoid';
import { Rectangle } from "./client/Rectangle.js";
import { Circle } from "./client/Circle.js";
import { Group } from "./client/Group.js";

interface ClientToServer {
    request ?: (com: RawCommand) => void;
    pointer ?: (pos:MouseInfo) => void;
}

export function createDrawServer(webserver : http.Server) : { 
    server : ServerSocket,
} {
    const server = new ServerSocket<ClientToServer,ServerToClient>(webserver, {cors:{
        origin: "*",
        credentials: false
    }});

    const drawing = new Drawing();
    const log : Command[] = [];

    new Rectangle({x:0,y:0}, 100, 200);
    new Circle({x:0,y:0}, 100);
    new Group();

    server.on("connect", (socket) => {
        const userID = nanoid();
        socket.emit("identify", userID);
        for (const cmd of log) {
            console.log("new client gets command", cmd);
            socket.emit("change", cmd, '');
        };
        socket.on("request", (json:RawCommand) => {
            const cmd = commandFromJSON(json);
            console.log("REQUESTED", cmd);
            try {
                cmd.apply(drawing);
            } catch (error) {
                socket.emit("response", cmd, error+"");
                return;
            }
            server.emit("change", cmd, userID);
            log.push(cmd);
        });
        socket.on("pointer", (pos) => {
            server.emit("pointer", pos, userID)
        });
    });
    
    return { server };
}
