'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Store, Plus, Menu, Users, Settings, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';
import { OutletInput, OutletSchema } from '@/lib/validations';

interface Outlet {
  _id: string;
  name: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [isLoadingOutlets, setIsLoadingOutlets] = useState(true);
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
      fetchOutlets();
    }
  }, [user]);

  const fetchOutlets = async () => {
    try {
      const response = await axios.get('/api/outlets');
      setOutlets(response.data.outlets);
      
      // Show onboarding if no outlets exist
      if (response.data.outlets.length === 0) {
        setIsOnboardingOpen(true);
      }
    } catch (error) {
      console.error('Error fetching outlets:', error);
    } finally {
      setIsLoadingOutlets(false);
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
        setOutlets([...outlets, response.data.outlet]);
        setIsOnboardingOpen(false);
        setOutletName('');
      }
    } catch (error) {
      setOutletError('Failed to create outlet. Please try again.');
    } finally {
      setIsCreatingOutlet(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading || isLoadingOutlets) {
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
      {/* Header */}
      <nav className="border-b bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Store className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                MenuMaster
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.username}!</span>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="text-gray-700 hover:text-red-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage your digital menu outlets</p>
        </div>

        {outlets.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No outlets yet</h3>
              <p className="text-gray-600 mb-6">Get started by creating your first outlet</p>
              <Button
                onClick={() => setIsOnboardingOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Outlet
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {outlets.map((outlet) => (
              <Card key={outlet._id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center">
                      <Store className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-xl">{outlet.name}</CardTitle>
                  <CardDescription>
                    Created on {new Date(outlet.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Menu className="h-4 w-4 mr-2" />
                      Manage Menu
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Staff Access
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Add New Outlet Card */}
            <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Plus className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Add New Outlet</h3>
                <p className="text-gray-600 text-center mb-4">Expand your digital presence</p>
                <Button
                  onClick={() => setIsOnboardingOpen(true)}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Create Outlet
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Onboarding Modal */}
      <Dialog open={isOnboardingOpen} onOpenChange={setIsOnboardingOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Your First Outlet</DialogTitle>
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