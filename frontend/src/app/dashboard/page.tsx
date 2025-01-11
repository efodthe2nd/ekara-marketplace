// src/app/dashboard/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { Product, ProductResponse } from '@/types/product';
import { ProductCard } from '@/components/products/ProductCard';
import api from '@/lib/api/axios';

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get<ProductResponse>('/products');
        
        if (response.data && 'products' in response.data) {
          setProducts(response.data.products);
        } else {
          console.error('Unexpected data format', response.data);
          setProducts([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch products', error);
        setProducts([]);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading products...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">No products found</div>
      )}
    </div>
  );
}