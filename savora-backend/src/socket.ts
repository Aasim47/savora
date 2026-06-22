import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: "*", // allow all origins for dev
      methods: ["GET", "POST", "PUT", "DELETE"]
    }
  });

  io.on("connection", (socket: Socket) => {
    console.log("Client connected to socket:", socket.id);

    // Join a specific room (e.g. user_ID or admin_RESTAURANT_ID)
    socket.on("join", (room: string) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room: ${room}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    console.warn("Socket.io not initialized yet!");
    return null;
  }
  return io;
};
