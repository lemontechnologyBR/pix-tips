import type { Server as SocketIOServer } from "socket.io";

declare global {
  var __io: SocketIOServer | undefined;
}

export function setIO(io: SocketIOServer) {
  global.__io = io;
}

export function getIO(): SocketIOServer {
  if (!global.__io) {
    throw new Error("Socket.io não inicializado. Use npm run dev.");
  }
  return global.__io;
}
