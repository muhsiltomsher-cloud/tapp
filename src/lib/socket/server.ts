import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verifyToken } from '@/lib/auth/jwt';

let io: SocketIOServer | null = null;

export function initializeSocket(httpServer: HTTPServer): SocketIOServer {
  if (io) {
    return io;
  }

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/socket.io',
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const payload = verifyToken(token);
    if (!payload) {
      return next(new Error('Authentication error'));
    }

    socket.data.user = payload;
    next();
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    const user = socket.data.user;

    socket.join(`user:${user.userId}`);

    socket.on('join:conversation', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`User ${user.userId} joined conversation ${conversationId}`);
    });

    socket.on('leave:conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${user.userId} left conversation ${conversationId}`);
    });

    socket.on('typing:start', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('user:typing', {
        userId: user.userId,
        conversationId,
      });
    });

    socket.on('typing:stop', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('user:stopped-typing', {
        userId: user.userId,
        conversationId,
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

export function emitNewMessage(conversationId: string, message: any) {
  if (io) {
    io.to(`conversation:${conversationId}`).emit('message:new', message);
  }
}

export function emitConversationUpdate(conversationId: string, conversation: any) {
  if (io) {
    io.to(`conversation:${conversationId}`).emit('conversation:updated', conversation);
  }
}

export function emitToUser(userId: string, event: string, data: any) {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}
