'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket(outletId?: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const heartbeatIntervalRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;

  useEffect(() => {
    if (!outletId) return;

    console.log('Initializing socket connection for outlet:', outletId);
    
    const socketInstance = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000', {
      path: '/api/socket',
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    const setupHeartbeat = () => {
      // Send heartbeat every 30 seconds to maintain connection
      heartbeatIntervalRef.current = setInterval(() => {
        if (socketInstance.connected) {
          socketInstance.emit('heartbeat');
        }
      }, 30000);
    };

    const clearHeartbeat = () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };

    socketInstance.on('connect', () => {
      console.log('Connected to socket server');
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
      
      // Join outlet room for real-time updates
      if (outletId) {
        console.log('Joining outlet room:', outletId);
        socketInstance.emit('join-outlet', outletId);
      }

      // Setup heartbeat
      setupHeartbeat();

      // Clear any pending reconnection timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Disconnected from socket server. Reason:', reason);
      setIsConnected(false);
      clearHeartbeat();

      // Attempt manual reconnection for certain disconnect reasons
      if (reason === 'io server disconnect' || reason === 'transport close') {
        attemptReconnection();
      }
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
      clearHeartbeat();
      attemptReconnection();
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log('Reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
      setupHeartbeat();
    });

    socketInstance.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
      setIsConnected(false);
    });

    socketInstance.on('reconnect_failed', () => {
      console.error('Failed to reconnect after maximum attempts');
      setIsConnected(false);
      clearHeartbeat();
    });

    // Handle room joining confirmations
    socketInstance.on('joined-outlet', (data) => {
      console.log('Successfully joined outlet room:', data);
    });

    socketInstance.on('joined-order-room', (data) => {
      console.log('Successfully joined order room:', data);
    });

    // Handle heartbeat response
    socketInstance.on('heartbeat-response', (data) => {
      console.log('Heartbeat response received:', data.timestamp);
    });

    // Handle sync responses
    socketInstance.on('order-sync-response', (data) => {
      console.log('Order sync response:', data);
    });

    socketInstance.on('order-sync-error', (data) => {
      console.error('Order sync error:', data);
    });

    const attemptReconnection = () => {
      if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        console.log('Max reconnection attempts reached');
        return;
      }

      reconnectAttemptsRef.current++;
      const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000); // Exponential backoff, max 30s
      
      console.log(`Attempting reconnection ${reconnectAttemptsRef.current}/${maxReconnectAttempts} in ${delay}ms`);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        if (!socketInstance.connected) {
          socketInstance.connect();
        }
      }, delay);
    };

    setSocket(socketInstance);

    return () => {
      console.log('Cleaning up socket connection');
      clearHeartbeat();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      socketInstance.close();
    };
  }, [outletId]);

  // Enhanced socket methods
  const joinOrderRoom = (orderId: string) => {
    if (socket && isConnected) {
      const orderRoom = `order-${orderId}`;
      console.log('Joining order room:', orderRoom);
      socket.emit('join-order-room', orderRoom);
    }
  };

  const leaveOrderRoom = (orderId: string) => {
    if (socket && isConnected) {
      const orderRoom = `order-${orderId}`;
      console.log('Leaving order room:', orderRoom);
      socket.emit('leave-order-room', orderRoom);
    }
  };

  const syncOrderStatus = (orderId: string, outletId: string) => {
    if (socket && isConnected) {
      console.log('Requesting order sync for:', orderId);
      socket.emit('sync-order-status', { orderId, outletId });
    }
  };

  const emitOrderUpdate = (order: any) => {
    if (socket && isConnected) {
      console.log('Emitting order update:', order.orderId);
      socket.emit('order-updated', order);
    }
  };

  const emitNewOrder = (order: any) => {
    if (socket && isConnected) {
      console.log('Emitting new order:', order.orderId);
      socket.emit('new-order', order);
    }
  };

  const emitOrderCompletion = (order: any) => {
    if (socket && isConnected) {
      console.log('Emitting order completion:', order.orderId);
      socket.emit('order-completed', order);
    }
  };

  return { 
    socket, 
    isConnected,
    reconnectAttempts: reconnectAttemptsRef.current,
    maxReconnectAttempts,
    // Enhanced methods
    joinOrderRoom,
    leaveOrderRoom,
    syncOrderStatus,
    emitOrderUpdate,
    emitNewOrder,
    emitOrderCompletion
  };
}