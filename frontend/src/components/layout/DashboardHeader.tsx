'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, Bell, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import Link from 'next/link';
import SellPartModal from '@/components/products/CreatePartModal';

interface DashboardHeaderProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  onProductCreated?: () => void;
}


export function DashboardHeader({
  searchTerm,
  setSearchTerm,
  onProductCreated,
}: DashboardHeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const notificationsRef = useRef<HTMLDivElement | null>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setShowProfileMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  console.log('User seller status:', user?.isSeller);
  console.log('Modal state:', showSellModal);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span
              className="text-xl font-bold text-gray-900 cursor-pointer"
              onClick={() => router.refresh()}
            >
              CheckPartsOnline
            </span>
            <div className="ml-10">
              <div className="relative w-96">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Search for parts..."
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user?.isSeller && (
              <button
                onClick={() => {
                  console.log('Opening modal, user:', user);
                  setShowSellModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sell Parts
              </button>
            )}

            <button
              onClick={() => router.push('/cart')}
              className="p-2 text-gray-500 hover:text-gray-700 relative"
            >
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </button>

            {user && (
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <Bell className="h-6 w-6" />
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Notifications
                      </h3>
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

            {user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2"
                >
                  <User className="h-6 w-6 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {user.username}
                  </span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="mr-3 h-5 w-5 text-gray-400" />
                      Profile
                    </Link>
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

      {/* Rendering modal, isOpen: {showSellModal} */}
      <SellPartModal 
      isOpen={showSellModal} 
      onClose={() => {
        console.log('Closing modal');
        setShowSellModal(false);
      }}
      onSuccess={() => {
        console.log('Modal success');
        setShowSellModal(false);
        onProductCreated?.(); // Call this first to update parent state
        router.refresh(); // Then refresh the page
      }}
    />
    </nav>
  );
}