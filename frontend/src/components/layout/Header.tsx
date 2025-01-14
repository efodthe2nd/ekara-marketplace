"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";

export function Header() {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const pathname = usePathname();
  
  if (pathname === "/dashboard") {
    return null;
  }

  return (
    <header className="bg-gray-900 text-white py-4 shadow">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold ml-4">
          Checkprices
        </Link>

        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Explore
          </Link>
          {user ? (
            <div className="relative">
              <button
                className="flex items-center space-x-2 focus:outline-none hover:text-gray-300"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="font-medium">{user.username}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {isDropdownOpen && (
                <ul className="absolute right-4 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10">
                  <li>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 hover:bg-gray-700"
                    >
                      Settings
                    </Link>
                  </li>
                  <li>
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-700"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 mr-8"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
