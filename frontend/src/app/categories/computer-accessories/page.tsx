'use client';

import { useState, useCallback, useEffect } from 'react';
import { Product, ProductResponse } from '@/types/product';
import { ProductCard } from '@/components/products/ProductCard';
import api from '@/lib/api/axios';
import { DashboardHeader } from '@/components/layout/DashboardHeader';

const ComputerAccessories = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore] = useState(false);
  const limit = 12;

  const fetchProducts = useCallback(async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const response = await api.get<ProductResponse>(
        `/api/products?page=${pageNum}&limit=${limit}&category=computer-accessories`
      );
      
      console.log('Response from API:', response.data); // Debug log
      
      if (response.data && Array.isArray(response.data.products)) {
        if (pageNum === 1) {
          setProducts(response.data.products);
        } else {
          setProducts(prev => [...prev, ...response.data.products]);
        }
        setHasMore(response.data.products.length === limit);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Failed to fetch computer accessories:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    console.log('Current products:', products);
  }, [products]);

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onProductSelected={() => {}}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Computer Accessories</h1>
          <p className="text-gray-600">Browse our collection of high-quality computer accessories</p>
        </div>

        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={() => fetchProducts(page + 1)}
                  disabled={loadingMore}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loadingMore ? 'Loading...' : 'Load More Products'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No computer accessories found
          </div>
        )}
      </div>
    </div>
  );
};

export default ComputerAccessories;