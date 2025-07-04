'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Store, Settings, User, LogOut, Building, Settings2Icon, Settings2, SettingsIcon, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

interface Outlet {
  _id: string;
  name: string;
  logo?: string;
}

interface DashboardHeaderProps {
  outlet?: Outlet;
  onSignOut: () => void;
}

export default function DashboardHeader({ outlet, onSignOut }: DashboardHeaderProps) {
  const { user } = useAuth();

  return (
    <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Outlet Logo and Name */}
          <div className="flex items-center space-x-3">
            {outlet ? (
              <>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center">
                  {outlet.logo ? (
                    <img 
                      src={outlet.logo} 
                      alt={outlet.name}
                      className="w-8 h-8 rounded object-cover"
                    />
                  ) : (
                    <Store className="h-6 w-6 text-white" />
                  )}
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">{outlet.name}</h1>
                  <p className="text-xs text-gray-500">Dashboard</p>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Store className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                  MenuMaster
                </span>
              </div>
            )}
          </div>

          {/* Right side - Settings and Profile */}
          <div className="flex items-center space-x-4">
            {/* Outlet Settings */}
            {outlet && (
              <Link href="#">
                <Button variant="ghost" size="sm" className="text-gray-700 hover:text-blue-600">
                  <Menu className="h-5 w-5 mr-2" />
                  Manage Menu
                </Button>
              </Link>
            )}

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" alt={user?.username} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white">
                      {user?.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">{user?.username}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/outlet-settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Outlet Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSignOut} className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}