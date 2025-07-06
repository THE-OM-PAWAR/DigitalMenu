const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Create the Next.js app instance
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NODE_ENV === 'production' ? false : "*",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Store connected clients by outlet
  const outletRooms = new Map();
  const orderRooms = new Map();

  // Socket.IO event handlers
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Handle joining outlet rooms
    socket.on('join-outlet', (outletId) => {
      console.log(`Socket ${socket.id} joining outlet room: ${outletId}`);
      socket.join(`outlet-${outletId}`);
      
      // Track outlet room membership
      if (!outletRooms.has(outletId)) {
        outletRooms.set(outletId, new Set());
      }
      outletRooms.get(outletId).add(socket.id);
      
      socket.emit('joined-outlet', { outletId, socketId: socket.id });
      console.log(`Socket ${socket.id} successfully joined outlet-${outletId}`);
    });

    // Handle joining specific order rooms
    socket.on('join-order-room', (orderRoom) => {
      console.log(`Socket ${socket.id} joining order room: ${orderRoom}`);
      socket.join(orderRoom);
      
      // Track order room membership
      if (!orderRooms.has(orderRoom)) {
        orderRooms.set(orderRoom, new Set());
      }
      orderRooms.get(orderRoom).add(socket.id);
      
      socket.emit('joined-order-room', { orderRoom, socketId: socket.id });
      console.log(`Socket ${socket.id} successfully joined ${orderRoom}`);
    });

    // Handle leaving order rooms
    socket.on('leave-order-room', (orderRoom) => {
      console.log(`Socket ${socket.id} leaving order room: ${orderRoom}`);
      socket.leave(orderRoom);
      
      // Remove from tracking
      if (orderRooms.has(orderRoom)) {
        orderRooms.get(orderRoom).delete(socket.id);
        if (orderRooms.get(orderRoom).size === 0) {
          orderRooms.delete(orderRoom);
        }
      }
    });

    // Handle new order events
    socket.on('new-order', (order) => {
      console.log('Broadcasting new order:', order.orderId);
      console.log('Order details:', {
        orderId: order.orderId,
        outletId: order.outletId,
        totalAmount: order.totalAmount,
        itemCount: order.items?.length || 0
      });
      
      // Broadcast to outlet room (for managers)
      const outletRoom = `outlet-${order.outletId}`;
      socket.to(outletRoom).emit('new-order', order);
      console.log(`Broadcasted new order to ${outletRoom}`);
      
      // Broadcast to specific order room (for customers)
      const orderRoom = `order-${order.orderId}`;
      socket.to(orderRoom).emit('new-order', order);
      console.log(`Broadcasted new order to ${orderRoom}`);
      
      // Log room sizes for debugging
      console.log(`Outlet room ${outletRoom} has ${io.sockets.adapter.rooms.get(outletRoom)?.size || 0} clients`);
      console.log(`Order room ${orderRoom} has ${io.sockets.adapter.rooms.get(orderRoom)?.size || 0} clients`);
    });

    // Handle order update events
    socket.on('order-updated', (order) => {
      console.log('Broadcasting order update:', order.orderId);
      console.log('Update details:', {
        orderId: order.orderId,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount
      });
      
      // Broadcast to outlet room (for managers)
      const outletRoom = `outlet-${order.outletId}`;
      socket.to(outletRoom).emit('order-updated', order);
      console.log(`Broadcasted order update to ${outletRoom}`);
      
      // Broadcast to specific order room (for customers)
      const orderRoom = `order-${order.orderId}`;
      socket.to(orderRoom).emit('order-updated', order);
      console.log(`Broadcasted order update to ${orderRoom}`);
    });

    // Handle order completion events
    socket.on('order-completed', (order) => {
      console.log('Broadcasting order completion:', order.orderId);
      console.log('Completion details:', {
        orderId: order.orderId,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus
      });
      
      // Broadcast to outlet room (for managers)
      const outletRoom = `outlet-${order.outletId}`;
      socket.to(outletRoom).emit('order-completed', order);
      console.log(`Broadcasted order completion to ${outletRoom}`);
      
      // Broadcast to specific order room (for customers)
      const orderRoom = `order-${order.orderId}`;
      socket.to(orderRoom).emit('order-completed', order);
      console.log(`Broadcasted order completion to ${orderRoom}`);
    });

    // Handle order status sync requests
    socket.on('sync-order-status', async (data) => {
      const { orderId, outletId } = data;
      console.log('Sync request for order:', orderId);
      
      try {
        // Here you could fetch the latest order status from database
        // For now, we'll just emit a sync response
        socket.emit('order-sync-response', { 
          orderId, 
          status: 'synced',
          timestamp: Date.now()
        });
        console.log(`Sync response sent for order: ${orderId}`);
      } catch (error) {
        console.error('Error syncing order:', error);
        socket.emit('order-sync-error', { orderId, error: 'Sync failed' });
      }
    });

    // Handle heartbeat for connection monitoring
    socket.on('heartbeat', () => {
      socket.emit('heartbeat-response', { timestamp: Date.now() });
    });

    // Handle ping for connection testing
    socket.on('ping', (callback) => {
      if (typeof callback === 'function') {
        callback();
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log('Client disconnected:', socket.id, 'Reason:', reason);
      
      // Clean up room tracking
      outletRooms.forEach((clients, outletId) => {
        if (clients.has(socket.id)) {
          clients.delete(socket.id);
          if (clients.size === 0) {
            outletRooms.delete(outletId);
          }
        }
      });
      
      orderRooms.forEach((clients, orderRoom) => {
        if (clients.has(socket.id)) {
          clients.delete(socket.id);
          if (clients.size === 0) {
            orderRooms.delete(orderRoom);
          }
        }
      });
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error('Socket error for client', socket.id, ':', error);
    });

    // Send initial connection confirmation
    socket.emit('connection-confirmed', {
      socketId: socket.id,
      timestamp: Date.now(),
      server: 'MenuMaster Socket Server'
    });
  });

  // Log server statistics periodically
  setInterval(() => {
    const connectedClients = io.sockets.sockets.size;
    const activeOutlets = outletRooms.size;
    const activeOrders = orderRooms.size;
    
    if (connectedClients > 0) {
      console.log(`Server Stats - Clients: ${connectedClients}, Outlets: ${activeOutlets}, Orders: ${activeOrders}`);
    }
  }, 30000); // Log every 30 seconds

  // Handle server shutdown gracefully
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    httpServer.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    httpServer.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.IO server running on path: /api/socket`);
    console.log(`> Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});