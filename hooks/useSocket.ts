'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket(outletId?: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!outletId) return;

    console.log('Initializing socket connection for outlet:', outletId);
    
    const socketInstance = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000', {
      path: '/api/socket',
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    socketInstance.on('connect', () => {
      console.log('Connected to socket server');
      setIsConnected(true);
      
      // Join outlet room for real-time updates
      if (outletId) {
        console.log('Joining outlet room:', outletId);
        socketInstance.emit('join-outlet', outletId);
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    // Handle room joining confirmation
    socketInstance.on('joined-outlet', (data) => {
      console.log('Successfully joined outlet room:', data);
    });

    setSocket(socketInstance);

    return () => {
      console.log('Cleaning up socket connection');
      socketInstance.close();
    };
  }, [outletId]);

  return { socket, isConnected };
}