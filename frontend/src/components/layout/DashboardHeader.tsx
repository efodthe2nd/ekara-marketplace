// src/components/layout/DashboardHeader.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, Bell, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import Link from 'next/link';

export function DashboardHeader() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/api/auth/login');
  };
  console.log('Current user:', user);

  return (
    
    <nav className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold text-gray-900">Spareparts</span>
            <div className="ml-10">
              <div className="relative w-96">
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search for parts..."
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.push('/cart')}
              className="p-2 text-gray-500 hover:text-gray-700 relative"
            >
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </button>

            {/* Notifications - Only show if user is logged in */}
            {user && (
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <Bell className="h-6 w-6" />
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="px-4 py-3 hover:bg-gray-50">
                        <p className="text-sm text-gray-600">No new notifications</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Section */}
            {user ? (
              <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 p-2"
              >
                <User className="h-6 w-6 text-gray-500" />
                {user ? (
                  <span className="text-sm font-medium text-gray-700">{user.username}</span>
                ) : (
                  <span className="text-sm font-medium text-gray-700">Sign In</span>
                )}
              </button>
            
              {showProfileMenu && user && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                  <Link 
                    href="/settings" 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Settings className="mr-3 h-5 w-5 text-gray-400" />
                    Settings
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <LogOut className="mr-3 h-5 w-5 text-gray-400" />
                    Logout
                  </button>
                </div>
              )}
            </div>
            ) : (
              <button 
                onClick={() => router.push('/auth/login')}
                className="flex items-center space-x-2 p-2 text-gray-700 hover:text-gray-900"
              >
                <User className="h-6 w-6" />
                <span className="text-sm font-medium">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}