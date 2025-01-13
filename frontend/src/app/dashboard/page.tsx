"use client"

import { useState, useEffect } from 'react';
import { Product, ProductResponse } from '@/types/product';
import { ProductCard } from '@/components/products/ProductCard';
import api from '@/lib/api/axios';

const DashboardPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get<ProductResponse>('/products');
        setProducts(response.data.products);
        setFilteredProducts(response.data.products);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch products', error);
        setProducts([]);
        setFilteredProducts([]);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <div className="py-20 flex justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">What are you looking for?</h1>
          <div className="relative w-3/5">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full rounded-full py-3 px-4 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="absolute right-0 top-0 h-full bg-blue-500 text-white px-8 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="container mx-auto py-8 bg-gray-900">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;