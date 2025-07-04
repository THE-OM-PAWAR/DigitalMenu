'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, ChefHat, Package, Utensils, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import DashboardHeader from '@/components/DashboardHeader';
import axios from 'axios';
import Link from 'next/link';

interface Outlet {
  _id: string;
  name: string;
  logo?: string;
}

export default function MenuManagementPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [outlet, setOutlet] = useState<Outlet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchOutlet();
    }
  }, [user]);

  const fetchOutlet = async () => {
    try {
      const response = await axios.get('/api/outlets');
      setOutlet(response.data.outlet);
      
      if (!response.data.outlet) {
        router.push('/dashboard');
        return;
      }
    } catch (error) {
      console.error('Error fetching outlet:', error);
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading menu management...</p>
        </div>
      </div>
    );
  }

  if (!user || !outlet) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <DashboardHeader outlet={outlet} onSignOut={handleSignOut} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Menu Management</h1>
          <p className="text-gray-600">Create and organize your menu categories, quantities, and items</p>
        </div>

        {/* Management Options */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Create Category */}
          <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-200">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <ChefHat className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                Create Category
              </CardTitle>
              <CardDescription className="text-gray-600 leading-relaxed">
                Organize your menu with categories like appetizers, main courses, desserts, and beverages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/menu/create-category">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-300">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Category
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Create Quantity */}
          <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-emerald-200">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Package className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                Create Quantity
              </CardTitle>
              <CardDescription className="text-gray-600 leading-relaxed">
                Define portion sizes and quantity options like small, medium, large, or custom measurements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/menu/create-quantity">
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-md hover:shadow-lg transition-all duration-300">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Quantity
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Create Item */}
          <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-orange-200">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Utensils className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                Create Item
              </CardTitle>
              <CardDescription className="text-gray-600 leading-relaxed">
                Add delicious menu items with descriptions, prices, images, and dietary information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/menu/create-item">
                <Button className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-md hover:shadow-lg transition-all duration-300">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Item
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Total Categories</CardTitle>
              <ChefHat className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">0</div>
              <p className="text-xs text-blue-600">Ready to organize your menu</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-800">Quantity Options</CardTitle>
              <Package className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-900">0</div>
              <p className="text-xs text-emerald-600">No portion sizes defined</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">Menu Items</CardTitle>
              <Utensils className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">0</div>
              <p className="text-xs text-orange-600">Start adding your dishes</p>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started Guide */}
        <Card className="mt-12 bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Getting Started</CardTitle>
            <CardDescription className="text-gray-600">
              Follow these steps to set up your digital menu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Create Categories</h4>
                  <p className="text-gray-600 text-sm">Start by organizing your menu into logical categories</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Define Quantities</h4>
                  <p className="text-gray-600 text-sm">Set up portion sizes and quantity options for your items</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Add Menu Items</h4>
                  <p className="text-gray-600 text-sm">Create your delicious menu items with photos and descriptions</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}