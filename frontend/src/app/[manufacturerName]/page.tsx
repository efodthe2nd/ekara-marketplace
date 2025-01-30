"use client"


import { useState, useCallback, useEffect } from 'react';
import { Product, ProductResponse } from '@/types/product';
import { ProductCard } from '@/components/products/ProductCard';
import api from '@/lib/api/axios';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { useSearchParams } from 'next/navigation';

const ManufacturerPage = () => {
  const [isClient, setIsClient] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 12;

  useEffect(() => {
    setIsClient(true); // Set the flag when the component is mounted on the client-side
  }, []);

  
  const searchParams = useSearchParams();
  const manufacturer = searchParams.get('manufacturer'); // Get manufacturer name from URL
  
  const fetchProducts = useCallback(async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const response = await api.get<ProductResponse>(`/api/products/manufacturer?manufacturer=${manufacturer}&page=${pageNum}&limit=${limit}`);
      
      console.log('Response from API:', response.data);
      
      if (response.data && Array.isArray(response.data.products)) {
        if (pageNum === 1) {
          setProducts(response.data.products);
        } else {
          setProducts((prev) => [...prev, ...response.data.products]);
        }
        setHasMore(response.data.products.length === limit);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [manufacturer]);
  
  useEffect(() => {
    if (manufacturer) {
      fetchProducts();
    }
  }, [manufacturer, fetchProducts]);
  
  if (!isClient) {
    return null; // Return null or a loading state until the component is mounted
  }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Products by {manufacturer}
          </h1>
          <p className="text-gray-600">Browse products manufactured by {manufacturer}</p>
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
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load More Products'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No products found for {manufacturer}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManufacturerPage;
