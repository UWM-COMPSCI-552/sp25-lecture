import http from 'http';
import { createDrawServer } from './drawserver.js';
import { PORT } from './client/network.js';

const { server } = createDrawServer(new http.Server);
server.listen(PORT);
console.log('started server on port', PORT);
