export const initPollSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('Socket connected:', socket.id);

        socket.on('join', () =>{
            console.log('Client joined:', socket.id);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected:', socket.id);
        })
    })
}