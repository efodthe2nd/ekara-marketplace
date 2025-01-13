// src/components/products/ProductModal.tsx
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { Product } from '@/types/product';
import Image from 'next/image';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { user } = useAuth();
  const router = useRouter();

  // Robust image URL handling
  const getImageUrl = (imageName: string) => {
    // If it's already a full URL, return as is
    if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
      return imageName;
    }

    // Ensure the image starts with a slash
    return imageName.startsWith('/') 
      ? imageName 
      : `/uploads/${imageName}`;
  };

  // Get the first image or use a placeholder
  const imageSrc = product.images && product.images.length > 0 
    ? getImageUrl(product.images[0])
    : '/placeholder-image.jpg';

  const handleBuyNow = () => {
    if (!user) {
      router.push('/auth/login');
    } else {
      router.push(`/order/${product.id}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center backdrop-blur-sm">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 p-6">
          <div className="relative w-full h-64">
            <Image 
              src={imageSrc}
              alt={product.name}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Product Details</h3>
            <p className="mb-4 text-gray-700">{product.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="font-medium text-gray-900">Category:</span> <span className="text-gray-700">{product.category}</span>
              </div>
              <div>
                <span className="font-medium text-gray-900">Manufacturer:</span> <span className="text-gray-700">{product.manufacturer}</span>
              </div>
              <div>
                <span className="font-medium text-gray-900">Compatibility:</span> <span className="text-gray-700">{product.compatibility}</span>
              </div>
              <div>
                <span className="font-medium text-gray-900">Dimensions:</span> <span className="text-gray-700">{product.dimensions}</span>
              </div>
              <div>
                <span className="font-medium text-gray-900">Weight:</span> <span className="text-gray-700">{product.weight} kg</span>
              </div>
              <div>
                <span className="font-medium text-gray-900">Warranty:</span> <span className="text-gray-700">{product.warranty}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <span className="text-2xl font-bold text-gray-900">${parseFloat(product.price).toFixed(2)}</span>
              <span className="text-sm text-gray-500">
                {product.stock} in stock
              </span>
            </div>
            
            {product.seller?.companyName && (
              <div className="mb-4">
                <span className="font-medium text-gray-900">Seller:</span> <span className="text-gray-700">{product.seller.companyName}</span>
              </div>
            )}
            
            <button
              onClick={handleBuyNow}
              className="w-full bg-blue-500 text-white py-3 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;