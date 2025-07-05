'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Store, Plus, Menu, Users, QrCode, TrendingUp, Loader2, Link } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import DashboardHeader from '@/components/DashboardHeader';
import axios from 'axios';
import { OutletInput, OutletSchema } from '@/lib/validations';

interface Outlet {
  _id: string;
  name: string;
  logo?: string;
  description?: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [outlet, setOutlet] = useState<Outlet | null>(null);
  const [isLoadingOutlet, setIsLoadingOutlet] = useState(true);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isCreatingOutlet, setIsCreatingOutlet] = useState(false);
  const [outletName, setOutletName] = useState('');
  const [outletError, setOutletError] = useState('');

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
      
      // Show onboarding if no outlet exists
      if (!response.data.outlet) {
        setIsOnboardingOpen(true);
      }
    } catch (error) {
      console.error('Error fetching outlet:', error);
    } finally {
      setIsLoadingOutlet(false);
    }
  };

  const handleCreateOutlet = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingOutlet(true);
    setOutletError('');

    try {
      const validatedFields = OutletSchema.safeParse({ name: outletName });
      if (!validatedFields.success) {
        setOutletError(validatedFields.error.issues[0].message);
        return;
      }

      const response = await axios.post('/api/outlets', { name: outletName });
      
      if (response.status === 201) {
        setOutlet(response.data.outlet);
        setIsOnboardingOpen(false);
        setOutletName('');
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        setOutletError('You already have an outlet');
      } else {
        setOutletError('Failed to create outlet. Please try again.');
      }
    } finally {
      setIsCreatingOutlet(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading || isLoadingOutlet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <DashboardHeader outlet={outlet || undefined} onSignOut={handleSignOut} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!outlet ? (
          <div className="text-center py-12">
            <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to MenuMaster!</h3>
            <p className="text-gray-600 mb-6">Get started by creating your outlet</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">Manage your digital menu and outlet</p>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Menu Items</CardTitle>
                  <Menu className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">No items yet</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">QR Code Scans</CardTitle>
                  <QrCode className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1</div>
                  <p className="text-xs text-muted-foreground">You (Admin)</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Performance</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">100%</div>
                  <p className="text-xs text-muted-foreground">Uptime</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <Link href="/dashboard/menu">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
                    <Menu className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>Manage Menu</CardTitle>
                  <CardDescription>
                    Add, edit, and organize your menu items and categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    Get Started
                  </Button>
                </CardContent>
                </Link>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <QrCode className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>QR Codes</CardTitle>
                  <CardDescription>
                    Generate and download QR codes for your tables
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Generate QR
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>Analytics</CardTitle>
                  <CardDescription>
                    View insights and performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    View Analytics
                  </Button>
                </CardContent>
              </Card>

              {outlet && (
                <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg flex items-center justify-center mb-4">
                      <Store className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle>View Public Menu</CardTitle>
                    <CardDescription>
                      See how your menu looks to customers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full" onClick={() => window.open(`/menu/${outlet._id}`, '_blank')}>
                      Open Menu
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </div>

      {/* Onboarding Modal */}
      <Dialog open={isOnboardingOpen} onOpenChange={setIsOnboardingOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Your Outlet</DialogTitle>
            <DialogDescription>
              Let's set up your digital menu. What's the name of your restaurant or cafe?
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateOutlet} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="outlet-name">Outlet Name</Label>
              <Input
                id="outlet-name"
                placeholder="e.g., Downtown Cafe"
                value={outletName}
                onChange={(e) => {
                  setOutletName(e.target.value);
                  if (outletError) setOutletError('');
                }}
                className={outletError ? 'border-red-500' : ''}
              />
              {outletError && (
                <p className="text-sm text-red-500">{outletError}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
              disabled={isCreatingOutlet}
            >
              {isCreatingOutlet ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Outlet'
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}