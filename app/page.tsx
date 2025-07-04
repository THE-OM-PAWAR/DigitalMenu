import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, Menu, QrCode, Users, TrendingUp, Shield } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Store className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                MenuMaster
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white hover:from-blue-700 hover:to-emerald-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Create Your
              <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                {' '}Digital Menu{' '}
              </span>
              in Minutes
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your restaurant or cafe with our powerful digital menu platform. 
              Create, manage, and share your menu with customers through QR codes and beautiful web interfaces.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white hover:from-blue-700 hover:to-emerald-700 px-8 py-4 text-lg">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button size="lg" variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Go Digital
          </h2>
          <p className="text-xl text-gray-600">
            Powerful features designed for modern restaurants and cafes
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="group hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <Menu className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Easy Menu Management</CardTitle>
              <CardDescription>
                Create and update your menu items with our intuitive interface. Add photos, descriptions, and pricing with ease.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition-colors">
                <QrCode className="h-6 w-6 text-emerald-600" />
              </div>
              <CardTitle>QR Code Generation</CardTitle>
              <CardDescription>
                Generate QR codes for your tables. Customers can scan and view your menu instantly on their devices.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Analytics & Insights</CardTitle>
              <CardDescription>
                Track menu performance, popular items, and customer preferences with detailed analytics.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>
                Manage multiple outlets and team members with role-based access control and permissions.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-200 transition-colors">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Secure & Reliable</CardTitle>
              <CardDescription>
                Enterprise-grade security with regular backups and 99.9% uptime guarantee for your business.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
                <Store className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle>Multi-Outlet Support</CardTitle>
              <CardDescription>
                Manage multiple restaurant locations from a single dashboard with centralized control.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Restaurant?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of restaurants already using MenuMaster to enhance their customer experience.
            </p>
            <Link href="/auth/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg">
                Get Started Today
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Store className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">MenuMaster</span>
            </div>
            <div className="text-gray-400">
              © 2024 MenuMaster. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}