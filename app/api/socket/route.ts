import { NextRequest, NextResponse } from 'next/server';
import { Server as ServerIO } from 'socket.io';
import { Server as NetServer } from 'http';

// Store socket server instance
let io: ServerIO | null = null;

export async function GET(req: NextRequest) {
  if (!io) {
    console.log('Initializing Socket.IO server...');
    
    // Create HTTP server for Socket.IO
    const httpServer = new NetServer();
    
    io = new ServerIO(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Handle joining outlet rooms
      socket.on('join-outlet', (outletId: string) => {
        console.log(`Socket ${socket.id} joining outlet room: ${outletId}`);
        socket.join(`outlet-${outletId}`);
        socket.emit('joined-outlet', { outletId, socketId: socket.id });
      });

      // Handle new order events
      socket.on('new-order', (order) => {
        console.log('Broadcasting new order:', order.orderId);
        socket.to(`outlet-${order.outletId}`).emit('new-order', order);
      });

      // Handle order update events
      socket.on('order-updated', (order) => {
        console.log('Broadcasting order update:', order.orderId);
        socket.to(`outlet-${order.outletId}`).emit('order-updated', order);
      });

      // Handle order completion events
      socket.on('order-completed', (order) => {
        console.log('Broadcasting order completion:', order.orderId);
        socket.to(`outlet-${order.outletId}`).emit('order-completed', order);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    console.log('Socket.IO server initialized');
  }

  return new Response('Socket.IO server running', { status: 200 });
}

export async function POST(req: NextRequest) {
  return new Response('Socket.IO server endpoint', { status: 200 });
}