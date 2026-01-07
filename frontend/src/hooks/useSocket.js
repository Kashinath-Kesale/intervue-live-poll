import {useEffect, useRef} from 'react';
import {io} from 'socket.io-client';

export const useSocket = () =>{
    const socketRef = useRef(null);

    useEffect(() =>{
        socketRef.current = io(import.meta.env.VITE_SOCKET_URL);

        socketRef.current.emit('join');

        return() => {
            socketRef.current.disconnect();
        };
    }, []);

    return socketRef;
}