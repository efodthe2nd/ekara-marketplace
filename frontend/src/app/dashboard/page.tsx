"use client";

import { useState, useCallback, useEffect } from "react";
import { Product, ProductResponse } from "@/types/product";
import { ProductCard } from "@/components/products/ProductCard";
import { Package } from "lucide-react";
import api from "@/lib/api/axios";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { useRouter } from "next/navigation";
import LoadingSpinner from '@/components/ui/LoadingSpinner';



const DashboardPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;
  const router = useRouter();

  const handleProductDelete = (productId: string) => {
    // Remove the product from local state
    setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
  };

  const fetchProducts = useCallback(async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const response = await api.get<ProductResponse>(
        `api/products?page=${pageNum}&limit=${limit}`
      );

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
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchProducts = useCallback(async (query: string) => {
    try {
      setLoading(true);
      const response = await api.get<ProductResponse>(
        `/api/products/search?query=${encodeURIComponent(query)}&limit=${limit}`
      );

      if (response.data && Array.isArray(response.data.products)) {
        setProducts(response.data.products);
        setHasMore(response.data.products.length === limit);
        setPage(1);
      }
    } catch (error) {
      console.error("Failed to search products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = async () => {
    if (loadingMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const params = new URLSearchParams({
        page: nextPage.toString(),
        limit: limit.toString()
      });
  
      if (searchTerm) {
        params.append('search', searchTerm);
      }
  
      const response = await api.get<ProductResponse>(`/api/products?${params}`);
      
      if (response.data && Array.isArray(response.data.products)) {
        setProducts(prev => [...prev, ...response.data.products]);
        setPage(nextPage);
        setHasMore(response.data.products.length === limit);
      }
    } catch (error) {
      console.error('Failed to load more products:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleProductSelected = async (selectedProduct: Product) => {
    try {
      setLoading(true);
      setSearchTerm(selectedProduct.name);

      const response = await api.get<ProductResponse>(
        `/api/products/search?query=${encodeURIComponent(selectedProduct.name)}&limit=${limit}`
      );

      if (response.data && Array.isArray(response.data.products)) {
        setProducts(response.data.products);
        setHasMore(response.data.products.length === limit);
        setPage(1);
      }
    } catch (error) {
      console.error("Failed to fetch related products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      searchProducts(term);
    } else {
      fetchProducts(1);
    }
  };

  const handleProductCreated = () => {
    fetchProducts(1);
  };

  if (loading && products.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        searchTerm={searchTerm}
        setSearchTerm={handleSearch}
        onProductCreated={handleProductCreated}
        onProductSelected={handleProductSelected}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "Engine Parts",
              "Computer Accessories",
              "Transmission",
              "Electronics",
            ].map((category) => (
              <div
                key={category}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  // Convert the category name to a URL-friendly format
                  const categorySlug = category.toLowerCase().replace(/ /g, '-');
                  // Navigate to the dynamic route with the category parameter
                  router.push(`/categoryName?category=${categorySlug}`);
                }}
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
              {searchTerm ? "Search Results" : "Featured Parts"}
            </h2>
          </div>
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} onProductDelete={handleProductDelete}  />
                ))}
              </div>
              {hasMore && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loadingMore ? "Loading..." : "Load More Products"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No products found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
