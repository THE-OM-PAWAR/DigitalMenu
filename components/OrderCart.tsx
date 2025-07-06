'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ShoppingCart, Plus, Minus, Trash2, User, Hash, 
  MessageSquare, CreditCard, CheckCircle, Loader2 
} from 'lucide-react';
import { OrderItem, Order, OrderStatus, PaymentStatus } from '@/lib/orderTypes';
import { useSocket } from '@/hooks/useSocket';
import axios from 'axios';

interface OrderCartProps {
  outletId: string;
  cartItems: OrderItem[];
  onUpdateCart: (items: OrderItem[]) => void;
}

export default function OrderCart({ outletId, cartItems, onUpdateCart }: OrderCartProps) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [comments, setComments] = useState('');
  const { socket } = useSocket(outletId);

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    const updatedItems = cartItems.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    onUpdateCart(updatedItems);
  };

  const removeItem = (itemId: string) => {
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    onUpdateCart(updatedItems);
  };

  const clearCart = () => {
    onUpdateCart([]);
    localStorage.removeItem(`cart-${outletId}`);
  };

  const handleCheckout = () => {
    setIsCheckoutOpen(true);
  };

  const submitOrder = async () => {
    if (cartItems.length === 0) return;

    setIsSubmitting(true);
    try {
      const orderData = {
        outletId,
        items: cartItems,
        totalAmount,
        comments,
        customerName,
        tableNumber,
      };

      const response = await axios.post('/api/orders', orderData);
      const newOrder = response.data.order;

      // Emit socket event for real-time update
      if (socket) {
        socket.emit('new-order', newOrder);
      }

      setSubmittedOrder(newOrder);
      setOrderSubmitted(true);
      clearCart();
      setIsCheckoutOpen(false);
      
      // Reset form
      setCustomerName('');
      setTableNumber('');
      setComments('');
    } catch (error) {
      console.error('Error submitting order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render anything if cart is empty and no order was submitted
  if (cartItems.length === 0 && !orderSubmitted) {
    return null;
  }

  if (orderSubmitted && submittedOrder) {
    return (
      <Dialog open={true} onOpenChange={() => setOrderSubmitted(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-green-600">
              Order Confirmed!
            </DialogTitle>
            <DialogDescription>
              Your order has been successfully placed
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="text-lg font-mono font-bold">{submittedOrder.orderId}</p>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-bold">₹{submittedOrder.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <Badge variant="secondary">{submittedOrder.orderStatus}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Payment:</span>
                <Badge variant="outline">{submittedOrder.paymentStatus}</Badge>
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                Your order is being prepared. You'll be notified when it's ready!
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      {/* Floating Cart Button */}
      <div className="fixed bottom-4 left-4 right-4 z-50">
        <Card className="shadow-lg border-2 border-orange-500 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <ShoppingCart className="h-6 w-6 text-orange-600" />
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-orange-600 text-white text-xs">
                    {totalItems}
                  </Badge>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">₹{totalAmount.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">{totalItems} items</p>
                </div>
              </div>
              <Button onClick={handleCheckout} className="bg-orange-600 hover:bg-orange-700 text-white">
                Checkout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Checkout Modal */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Your Order
            </DialogTitle>
            <DialogDescription>
              Review your order and provide details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Order Items */}
            <div className="space-y-3">
              <h3 className="font-semibold">Order Items</h3>
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.quantityDescription}</p>
                    <p className="text-sm font-semibold">₹{item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Customer Details */}
            <div className="space-y-4">
              <h3 className="font-semibold">Customer Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Name (Optional)</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="customerName"
                      placeholder="Your name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tableNumber">Table (Optional)</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="tableNumber"
                      placeholder="Table number"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="space-y-2">
              <Label htmlFor="comments">Special Instructions (Optional)</Label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Textarea
                  id="comments"
                  placeholder="Any special requests..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="pl-10"
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            {/* Order Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Amount:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-600">Payment will be collected at the counter</p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsCheckoutOpen(false)}
                className="flex-1"
              >
                Continue Shopping
              </Button>
              <Button
                onClick={submitOrder}
                disabled={isSubmitting || cartItems.length === 0}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Place Order
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}