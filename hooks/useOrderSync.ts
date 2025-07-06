'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { Order, OrderItem, OrderStatus, PaymentStatus } from '@/lib/orderTypes';
import axios from 'axios';

interface OrderSyncState {
  activeOrder: Order | null;
  orderHistory: Order[];
  isLoading: boolean;
  lastSyncTime: number;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
}

interface UseOrderSyncProps {
  outletId: string;
  onOrderUpdate?: (order: Order) => void;
  onOrderComplete?: (order: Order) => void;
}

export function useOrderSync({ outletId, onOrderUpdate, onOrderComplete }: UseOrderSyncProps) {
  const { socket, isConnected } = useSocket(outletId);
  const [syncState, setSyncState] = useState<OrderSyncState>({
    activeOrder: null,
    orderHistory: [],
    isLoading: false,
    lastSyncTime: 0,
    connectionStatus: 'disconnected'
  });

  const syncTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Storage keys
  const getStorageKeys = useCallback(() => ({
    activeOrder: `activeOrder-${outletId}`,
    orderHistory: `orderHistory-${outletId}`,
    lastSync: `lastSync-${outletId}`,
    socketRoom: `socketRoom-${outletId}`
  }), [outletId]);

  // Load data from localStorage
  const loadFromStorage = useCallback(() => {
    const keys = getStorageKeys();
    try {
      const activeOrderData = localStorage.getItem(keys.activeOrder);
      const historyData = localStorage.getItem(keys.orderHistory);
      const lastSyncData = localStorage.getItem(keys.lastSync);

      const activeOrder = activeOrderData ? JSON.parse(activeOrderData) : null;
      const orderHistory = historyData ? JSON.parse(historyData) : [];
      const lastSyncTime = lastSyncData ? parseInt(lastSyncData) : 0;

      setSyncState(prev => ({
        ...prev,
        activeOrder,
        orderHistory,
        lastSyncTime
      }));

      return { activeOrder, orderHistory, lastSyncTime };
    } catch (error) {
      console.error('Error loading from storage:', error);
      return { activeOrder: null, orderHistory: [], lastSyncTime: 0 };
    }
  }, [getStorageKeys]);

  // Save data to localStorage
  const saveToStorage = useCallback((data: Partial<OrderSyncState>) => {
    const keys = getStorageKeys();
    try {
      if (data.activeOrder !== undefined) {
        if (data.activeOrder) {
          localStorage.setItem(keys.activeOrder, JSON.stringify(data.activeOrder));
        } else {
          localStorage.removeItem(keys.activeOrder);
        }
      }
      if (data.orderHistory) {
        localStorage.setItem(keys.orderHistory, JSON.stringify(data.orderHistory));
      }
      if (data.lastSyncTime) {
        localStorage.setItem(keys.lastSync, data.lastSyncTime.toString());
      }
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }, [getStorageKeys]);

  // Check if order is completed
  const isOrderCompleted = useCallback((order: Order) => {
    return order.orderStatus === OrderStatus.SERVED && order.paymentStatus === PaymentStatus.PAID;
  }, []);

  // Move order to history
  const moveOrderToHistory = useCallback((order: Order) => {
    console.log('Moving order to history:', order.orderId);
    
    setSyncState(prev => {
      const newHistory = [order, ...prev.orderHistory.filter(h => h.orderId !== order.orderId)];
      const newState = {
        ...prev,
        activeOrder: null,
        orderHistory: newHistory,
        lastSyncTime: Date.now()
      };
      
      saveToStorage({
        activeOrder: null,
        orderHistory: newHistory,
        lastSyncTime: newState.lastSyncTime
      });
      
      return newState;
    });

    if (onOrderComplete) {
      onOrderComplete(order);
    }
  }, [saveToStorage, onOrderComplete]);

  // Update active order
  const updateActiveOrder = useCallback((order: Order) => {
    console.log('Updating active order:', order.orderId);
    
    if (isOrderCompleted(order)) {
      moveOrderToHistory(order);
      return;
    }

    setSyncState(prev => {
      const newState = {
        ...prev,
        activeOrder: order,
        lastSyncTime: Date.now()
      };
      
      saveToStorage({
        activeOrder: order,
        lastSyncTime: newState.lastSyncTime
      });
      
      return newState;
    });

    if (onOrderUpdate) {
      onOrderUpdate(order);
    }
  }, [isOrderCompleted, moveOrderToHistory, saveToStorage, onOrderUpdate]);

  // Fetch order data from server
  const fetchOrderData = useCallback(async (orderId?: string) => {
    if (!orderId && !syncState.activeOrder) return;
    
    const targetOrderId = orderId || syncState.activeOrder?.orderId;
    if (!targetOrderId) return;

    setSyncState(prev => ({ ...prev, isLoading: true }));

    try {
      console.log('Fetching order data for:', targetOrderId);
      const response = await axios.get(`/api/orders/${targetOrderId}`);
      const order = response.data.order;
      
      if (order) {
        updateActiveOrder(order);
      }
    } catch (error) {
      console.error('Error fetching order data:', error);
      // If order not found, it might have been completed
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setSyncState(prev => {
          saveToStorage({ activeOrder: null });
          return { ...prev, activeOrder: null };
        });
      }
    } finally {
      setSyncState(prev => ({ ...prev, isLoading: false }));
    }
  }, [syncState.activeOrder, updateActiveOrder, saveToStorage]);

  // Handle socket connection
  const handleSocketConnection = useCallback(() => {
    if (!socket || !isConnected) return;

    console.log('Socket connected, setting up order sync for outlet:', outletId);
    
    setSyncState(prev => ({ ...prev, connectionStatus: 'connected' }));
    reconnectAttemptsRef.current = 0;

    // Join outlet room
    socket.emit('join-outlet', outletId);

    // Store room info
    const keys = getStorageKeys();
    localStorage.setItem(keys.socketRoom, outletId);

    // If we have an active order, join its specific room too
    if (syncState.activeOrder) {
      const orderRoom = `order-${syncState.activeOrder.orderId}`;
      socket.emit('join-order-room', orderRoom);
      console.log('Joined order room:', orderRoom);
    }

    // Fetch latest data after reconnection
    if (syncState.activeOrder) {
      fetchOrderData();
    }
  }, [socket, isConnected, outletId, syncState.activeOrder, fetchOrderData, getStorageKeys]);

  // Handle socket disconnection
  const handleSocketDisconnection = useCallback(() => {
    console.log('Socket disconnected');
    setSyncState(prev => ({ ...prev, connectionStatus: 'disconnected' }));
    
    // Attempt to reconnect
    if (reconnectAttemptsRef.current < maxReconnectAttempts) {
      setSyncState(prev => ({ ...prev, connectionStatus: 'reconnecting' }));
      reconnectAttemptsRef.current++;
      
      syncTimeoutRef.current = setTimeout(() => {
        if (syncState.activeOrder) {
          fetchOrderData();
        }
      }, 2000 * reconnectAttemptsRef.current); // Exponential backoff
    }
  }, [syncState.activeOrder, fetchOrderData]);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Connection events
    socket.on('connect', handleSocketConnection);
    socket.on('disconnect', handleSocketDisconnection);

    // Order update events
    socket.on('order-updated', (updatedOrder: Order) => {
      console.log('Received order update via socket:', updatedOrder.orderId);
      if (syncState.activeOrder && updatedOrder.orderId === syncState.activeOrder.orderId) {
        updateActiveOrder(updatedOrder);
      }
    });

    // Order completion events
    socket.on('order-completed', (completedOrder: Order) => {
      console.log('Received order completion via socket:', completedOrder.orderId);
      if (syncState.activeOrder && completedOrder.orderId === syncState.activeOrder.orderId) {
        moveOrderToHistory(completedOrder);
      }
    });

    // Room join confirmation
    socket.on('joined-outlet', (data) => {
      console.log('Successfully joined outlet room:', data);
    });

    socket.on('joined-order-room', (data) => {
      console.log('Successfully joined order room:', data);
    });

    return () => {
      socket.off('connect', handleSocketConnection);
      socket.off('disconnect', handleSocketDisconnection);
      socket.off('order-updated');
      socket.off('order-completed');
      socket.off('joined-outlet');
      socket.off('joined-order-room');
    };
  }, [socket, syncState.activeOrder, handleSocketConnection, handleSocketDisconnection, updateActiveOrder, moveOrderToHistory]);

  // Load initial data from storage
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Periodic sync when disconnected
  useEffect(() => {
    if (!isConnected && syncState.activeOrder) {
      const interval = setInterval(() => {
        console.log('Periodic sync - fetching order data');
        fetchOrderData();
      }, 10000); // Sync every 10 seconds when disconnected

      return () => clearInterval(interval);
    }
  }, [isConnected, syncState.activeOrder, fetchOrderData]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  // Public methods
  const createOrder = useCallback(async (orderData: {
    items: OrderItem[];
    totalAmount: number;
    comments?: string;
    customerName?: string;
    tableNumber?: string;
  }) => {
    try {
      setSyncState(prev => ({ ...prev, isLoading: true }));
      
      const response = await axios.post('/api/orders', {
        ...orderData,
        outletId
      });
      
      const newOrder = response.data.order;
      console.log('Order created:', newOrder.orderId);

      // Emit socket event for real-time update to manager
      if (socket) {
        socket.emit('new-order', newOrder);
        
        // Join the specific order room
        const orderRoom = `order-${newOrder.orderId}`;
        socket.emit('join-order-room', orderRoom);
      }

      updateActiveOrder(newOrder);
      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    } finally {
      setSyncState(prev => ({ ...prev, isLoading: false }));
    }
  }, [outletId, socket, updateActiveOrder]);

  const updateOrder = useCallback(async (orderId: string, updates: Partial<Order>) => {
    try {
      setSyncState(prev => ({ ...prev, isLoading: true }));
      
      const response = await axios.put(`/api/orders/${orderId}`, updates);
      const updatedOrder = response.data.order;
      
      console.log('Order updated:', updatedOrder.orderId);

      // Emit socket event for real-time update
      if (socket) {
        socket.emit('order-updated', updatedOrder);
      }

      updateActiveOrder(updatedOrder);
      return updatedOrder;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    } finally {
      setSyncState(prev => ({ ...prev, isLoading: false }));
    }
  }, [socket, updateActiveOrder]);

  const refreshOrder = useCallback(() => {
    if (syncState.activeOrder) {
      fetchOrderData(syncState.activeOrder.orderId);
    }
  }, [syncState.activeOrder, fetchOrderData]);

  const clearActiveOrder = useCallback(() => {
    setSyncState(prev => {
      saveToStorage({ activeOrder: null });
      return { ...prev, activeOrder: null };
    });
  }, [saveToStorage]);

  return {
    // State
    activeOrder: syncState.activeOrder,
    orderHistory: syncState.orderHistory,
    isLoading: syncState.isLoading,
    connectionStatus: syncState.connectionStatus,
    isConnected,
    
    // Methods
    createOrder,
    updateOrder,
    refreshOrder,
    clearActiveOrder,
    
    // Utils
    isOrderCompleted,
    lastSyncTime: syncState.lastSyncTime
  };
}