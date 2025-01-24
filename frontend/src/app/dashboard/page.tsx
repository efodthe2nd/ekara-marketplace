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
  const [searchTerm, setSearchTerm] = useState('');

  //const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10; 

  const fetchProducts = useCallback(async (pageNum: number = 1) => {
    console.log('Fetching products for page:', pageNum);
    try {
      const response = await api.get<ProductResponse>(`/api/products?page=${pageNum}&limit=${limit}`);
      
      if (response.data && Array.isArray(response.data.products)) {
        // If it's the first page, replace products, otherwise append
        if (pageNum === 1) {
          setProducts(response.data.products);
          setFilteredProducts(response.data.products);
        } else {
          setProducts(prev => [...prev, ...response.data.products]);
          setFilteredProducts(prev => [...prev, ...response.data.products]);
        }
        setTotal(response.data.total);
      }
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load more products when clicking "View All"
  const loadMore = () => {
    if (products.length < total) {
      const nextPage = Math.floor(products.length / limit) + 1;
      fetchProducts(nextPage);
    }
  };

  useEffect(() => {
    console.log('Current products in state:', products);
    console.log('Current filtered products:', filteredProducts);
  }, [products, filteredProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter products when searchTerm changes
  useEffect(() => {
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const handleProductCreated = () => {
    fetchProducts();
  };

  if (loading) {
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
        onProductCreated={handleProductCreated} 
      />

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
            <h2 className="text-2xl font-bold text-gray-900">
              Featured Products ({total} total)
            </h2>
            {products.length < total && (
              <button 
                onClick={loadMore}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View More
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {loading && (
            <div className="text-center py-4">
              Loading...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
