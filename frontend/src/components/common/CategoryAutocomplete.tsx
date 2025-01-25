// src/components/common/CategoryAutocomplete.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

export interface Category {
  id: number;
  name: string;
  level: number;
  parentId?: number;
}

interface CategoryAutocompleteProps {
  onSelect: (category: Category) => void;
  initialValue?: string;
}

const API_BASE_URL = 'http://localhost:3000';

export function CategoryAutocomplete({ onSelect, initialValue = '' }: CategoryAutocompleteProps) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }
    
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/categories/search?query=${encodeURIComponent(query)}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (category: Category) => {
    setQuery(category.name);
    setShowSuggestions(false);
    onSelect(category);
  };

  const handleCreateNew = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: query })
      });
      const newCategory = await response.json();
      handleSelect(newCategory);
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          placeholder="Search or create category..."
        />
        <Search className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
      </div>

      {showSuggestions && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-gray-500">Loading...</div>
          ) : suggestions.length > 0 ? (
            <ul>
              {suggestions.map((category) => (
                <li
                  key={category.id}
                  onClick={() => handleSelect(category)}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
                >
                  {category.name}
                </li>
              ))}
            </ul>
          ) : query.length >= 2 ? (
            <div
              onClick={handleCreateNew}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm text-blue-600"
            >
              Create new category &quot;{query}&quot;
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}