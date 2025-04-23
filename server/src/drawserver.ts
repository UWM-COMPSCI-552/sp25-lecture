import { Server as ServerSocket } from 'socket.io';
import http from 'http';
import { Drawing } from './client/Drawing.js';
import { Coordinate, ClientToServerEvents, InterSocketEvents, ServerToClientEvents, SocketData } from './client/network.js';

export function createDrawingServer(webserver : http.Server) : { 
    server : ServerSocket,
} {
     const server = new ServerSocket<ClientToServerEvents,ServerToClientEvents,InterSocketEvents,SocketData>(webserver, {cors:{
        origin: "*",
        credentials: false
    }});

    return { server };
}
