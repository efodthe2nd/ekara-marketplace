'use client';

import { useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Product } from '@/types/product';
import api from '@/lib/api/axios';
import SearchSuggestions from '../common/SearchSuggestions';
import debounce from 'lodash/debounce';

interface SuggestionResponse {
  suggestions: Product[];
}

interface AuthAwareHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onProductSelected?: (product: Product) => void;
}

export function AuthAwareHeader({
  searchTerm,
  setSearchTerm,
  onProductSelected
}: AuthAwareHeaderProps) {
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchSuggestions = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await api.get<SuggestionResponse>(`/api/products/suggestions?query=${encodeURIComponent(query)}`);
        setSuggestions(response.data.suggestions);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(true);
    fetchSuggestions(value);
  };

  const handleSuggestionSelect = (product: Product) => {
    setShowSuggestions(false);
    onProductSelected?.(product);
  };

  return (
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <span className="text-xl font-bold text-gray-900">CheckPartsOnline</span>
            </div>
            
            {/* Search Bar Container */}
            <div className="relative w-96"> {/* Fixed width for search */}
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Search for parts..."
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
  
              {showSuggestions && (
                <SearchSuggestions
                  suggestions={suggestions}
                  isLoading={isLoading}
                  onSelect={handleSuggestionSelect}
                  onClickOutside={() => setShowSuggestions(false)}
                />
              )}
            </div>
  
            {/* Right side buttons/menu */}
            <div className="flex items-center space-x-4">
              {/* Add your other header items here */}
            </div>
          </div>
        </div>
      </nav>
    );
}