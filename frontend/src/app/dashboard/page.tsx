"use client";

import { useState, useEffect, useCallback } from 'react';
import { Product, ProductResponse } from '@/types/product';
import { ProductCard } from '@/components/products/ProductCard';
import { Package } from 'lucide-react';
import api from '@/lib/api/axios';
import { DashboardHeader } from '@/components/layout/DashboardHeader';

const DashboardPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // State for the search query

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    try {
      const response = await api.get<ProductResponse>('/api/products');
      setProducts(response.data.products);
      setFilteredProducts(response.data.products);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch products', error);
      setProducts([]);
      setFilteredProducts([]);
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter products whenever searchTerm changes
  useEffect(() => {
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-900">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Pass searchTerm and setSearchTerm to DashboardHeader */}
      <DashboardHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Engine Parts', 'Computer Accessories', 'Transmission', 'Electronics'].map((category) => (
              <div
                key={category}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <Package className="h-8 w-8 text-blue-600 mb-2" />
                <h3 className="font-medium text-gray-900">{category}</h3>
                <p className="text-sm text-gray-500">Browse parts</p>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Products */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
