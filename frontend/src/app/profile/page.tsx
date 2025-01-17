// src/app/(protected)/profile/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { Star, Package, MessageCircle, Settings, MapPin } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('products');

  // This would come from your API
  const mockProducts = [
    { id: 1, name: 'Brake Pad Set', price: 89.99, sales: 24, rating: 4.5 },
    { id: 2, name: 'Engine Oil Filter', price: 12.99, sales: 56, rating: 4.8 },
  ];

  const mockReviews = [
    { 
      id: 1, 
      author: 'John Doe', 
      rating: 5,
      date: '2024-01-05',
      comment: 'Great seller, fast shipping and excellent product quality.'
    },
    { 
      id: 2, 
      author: 'Jane Smith', 
      rating: 4,
      date: '2024-01-03',
      comment: 'Product was as described. Would buy from again.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-6">
                {/* Profile Image */}
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-3xl text-gray-600">
                    {user?.username?.[0]?.toUpperCase()}
                  </span>
                </div>
                
                {/* Profile Info */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{user?.username}</h1>
                  <p className="text-gray-500">{user?.email}</p>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    Location
                  </div>
                  {user?.isSeller && (
                    <div className="mt-2 flex items-center">
                      <div className="flex items-center text-yellow-400">
                        <Star className="h-5 w-5 fill-current" />
                        <span className="ml-1 text-gray-900 font-medium">4.8</span>
                      </div>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-gray-600">128 reviews</span>
                    </div>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => window.location.href = '/settings'}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Profile Tabs */}
          <div className="border-t border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('products')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'products'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Products
                </div>
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'reviews'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Reviews
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockProducts.map(product => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="aspect-w-3 aspect-h-2">
                  <img
                    src={`/api/placeholder/400/300`}
                    alt={product.name}
                    className="object-cover w-full h-48"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      ${product.price}
                    </span>
                    <div className="flex items-center text-sm text-gray-500">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      {product.rating}
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    {product.sales} sales
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {mockReviews.map(review => (
              <div key={review.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {review.author[0]}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{review.author}</h4>
                      <div className="mt-1 flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <time className="text-sm text-gray-500">{review.date}</time>
                </div>
                <p className="mt-4 text-sm text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;