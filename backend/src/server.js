import http from 'http';
import {Server} from 'socket.io';
import dotenv from 'dotenv';
import app from './app.js';
import {connectDB} from  './config/db.js';
import {initPollSocket} from './sockets/poll.socket.js';

dotenv.config();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_ORIGIN,
        methods: ['GET', 'POST']
    }
});
export {io};

initPollSocket(io);



const PORT = process.env.PORT || 5000;

connectDB().then(()=> {
    server.listen(PORT, ()=> {
        console.log(`Server is running on port ${PORT}`);
    });
});
