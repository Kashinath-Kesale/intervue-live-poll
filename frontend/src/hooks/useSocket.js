import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export const useSocket = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(
      import.meta.env.VITE_API_BASE_URL,
      {
        transports: ["websocket"],
      }
    );

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join");
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  return socketRef;
};


