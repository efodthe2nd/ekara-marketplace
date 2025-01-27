'use client';

import { Product } from '@/types/product';
import Image from 'next/image';
import { useEffect, useRef } from 'react';

interface SearchSuggestionsProps {
  suggestions: Product[];
  isLoading: boolean;
  onSelect: (product: Product) => void;
  onClickOutside: () => void;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  isLoading,
  onSelect,
  onClickOutside,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClickOutside();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClickOutside]);

  if (isLoading) {
    return (
      <div className="absolute z-50 w-full bg-white mt-1 rounded-md shadow-lg border border-gray-200 p-2">
        <div className="animate-pulse flex items-center space-x-4 p-2">
          <div className="h-12 w-12 bg-gray-200 rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute z-50 w-full bg-white mt-1 rounded-md shadow-lg border border-gray-200"
    >
      {suggestions.map((product) => (
        <div
          key={product.id}
          className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
          onClick={() => onSelect(product)}
        >
          <div className="relative h-12 w-12 flex-shrink-0">
            <Image
              src={product.images?.[0] || '/placeholder-image.jpg'}
              alt={product.name}
              fill
              className="object-cover rounded"
            />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-900">{product.name}</p>
            <p className="text-sm text-gray-500">${product.price}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchSuggestions;