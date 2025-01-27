"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import ReactCrop, { type Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  Star,
  Package,
  MessageCircle,
  Settings,
  MapPin,
  Camera,
  X,
  Edit,
  Check
} from "lucide-react";

// Mock data for reviews (keeping these until you implement review functionality)
const mockReviews = [
  {
    id: 1,
    author: "User 1",
    rating: 5,
    date: "2023-01-01",
    comment: "Great product!",
  },
  {
    id: 2,
    author: "User 2",
    rating: 4,
    date: "2023-01-02",
    comment: "Good value for money.",
  },
  {
    id: 3,
    author: "User 3",
    rating: 3,
    date: "2023-01-03",
    comment: "Average experience.",
  },
];

interface Product {
  id: number;
  name: string;
  price: number;
  images: string[];
  description: string;
  stock: number;
  manufacturer: string;
  warranty: string;
  compatibility: string;
  dimensions: string;
  weight: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProfilePage = () => {
  const { user, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('products');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // States for image cropping
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 50,
    height: 50,
    x: 25,
    y: 25,
  });
  const imageRef = useRef<HTMLImageElement | null>(null);

  // State for editable location
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [location, setLocation] = useState(user?.location || '');

  // Fetch seller's products
  useEffect(() => {
    const fetchProducts = async () => {
      if (user?.id && user.isSeller) {
        try {
          const response = await fetch(`http://localhost:3000/api/products/seller/${user.id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch products');
          }

          const data = await response.json();
          setProducts(data);
        } catch (err) {
          setError('Failed to load products');
          console.error('Error fetching products:', err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (user?.isSeller) {
      fetchProducts();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  
  const handleProfilePicChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setSelectedFile(previewUrl);
    setShowCropModal(true);
  };

  const handleCropComplete = async () => {
    if (!imageRef.current || !selectedFile) return;
  
    const canvas = document.createElement('canvas');
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
  
    const pixelCrop: PixelCrop = {
      unit: 'px',
      x: crop.x! * scaleX,
      y: crop.y! * scaleY,
      width: crop.width! * scaleX,
      height: crop.height! * scaleY,
    };
  
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
  
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
  
    ctx.drawImage(
      imageRef.current,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );
  
    setIsUploading(true);
    setUploadError('');
    setShowCropModal(false);
  
    try {
      const base64Image = canvas.toDataURL('image/jpeg');

      const response = await fetch('http://localhost:3000/api/auth/profile/picture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          profilePicture: base64Image
        })
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error text:', errorText);
        throw new Error('Failed to upload profile picture');
      }
  
      const data = await response.json();
      if (data.profilePicUrl) {
        updateUserProfile({ profilePicture: data.profilePicUrl });
      } else {
        throw new Error('Profile picture URL is missing in the response');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload profile picture');
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(selectedFile);
      setSelectedFile(null);
    }
  };

  const handleSaveLocation = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/profile/location', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ location }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update location');
      }

      const data = await response.json();
      console.log(data);
      setIsEditingLocation(false);
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-6">
                {/* Profile Image with Upload Functionality */}
                <div className="relative group">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden relative">
                    {user?.profilePicture ? (
                      <Image
                        src={user.profilePicture}
                        alt="Profile"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                        priority
                      />
                    ) : (
                      <span className="text-3xl text-gray-600">
                        {user?.username?.[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Upload Overlay */}
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-6 w-6 text-white" />
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePicChange}
                  />
                </div>

                {/* Profile Info */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{user?.username}</h1>
                  <p className="text-gray-500">{user?.email}</p>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {isEditingLocation ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1"
                          placeholder="Enter city and state"
                        />
                        <button
                          onClick={handleSaveLocation}
                          className="p-1 text-green-600 hover:text-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>{location || 'Add location'}</span>
                        <button
                          onClick={() => setIsEditingLocation(true)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  {user?.isSeller && (
                    <div className="mt-2 flex items-center">
                      <div className="flex items-center text-yellow-400">
                        <Star className="h-5 w-5 fill-current" />
                        <span className="ml-1 text-gray-900 font-medium">4.8</span>
                      </div>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-gray-600">128 reviews</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => (window.location.href = '/settings')}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>

            {/* Upload Status Messages */}
            {/* Upload Status Messages */}
            {isUploading && (
              <div className="mt-4 text-sm text-blue-600">Uploading profile picture...</div>
            )}
            {uploadError && (
              <div className="mt-4 text-sm text-red-600">{uploadError}</div>
            )}
          </div>

          {/* Profile Tabs */}
          <div className="border-t border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('products')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'products'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Products
                </div>
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'reviews'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Reviews
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-8">Loading products...</div>
            ) : error ? (
              <div className="col-span-full text-center text-red-600 py-8">{error}</div>
            ) : products.length === 0 ? (
              <div className="col-span-full text-center py-8">
                No products found. Start selling by adding your first product!
              </div>
            ) : (
              products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                >
                  <div className="aspect-w-3 aspect-h-2">
                    <Image
                      src={product.images?.[0] || `/api/placeholder/400/300`}
                      alt={product.name}
                      width={400}
                      height={300}
                      className="object-cover w-full h-48"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">
                        ${product.price}
                      </span>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Stock: {product.stock}
                        </span>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-gray-600 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="mt-4 text-sm text-gray-500">
                      Manufacturer: {product.manufacturer}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

{activeTab === 'reviews' && (
          <div className="space-y-6">
            {mockReviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {review.author[0]}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{review.author}</h4>
                      <div className="mt-1 flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <time className="text-sm text-gray-500">{review.date}</time>
                </div>
                <p className="mt-4 text-sm text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        )}

        {/* Crop Modal */}
        {showCropModal && selectedFile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-2xl w-full" style={{ maxHeight: '90vh', overflow: 'auto' }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Crop Profile Picture</h3>
                <button
                  onClick={() => {
                    setShowCropModal(false);
                    setSelectedFile(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Dynamically adjust modal content size based on image aspect ratio */}
              <div className="relative" style={{ width: '100%', paddingTop: 'min(100%, 90vh - 120px)' }}>
                <div className="absolute inset-0">
                  <ReactCrop crop={crop} onChange={(c) => setCrop(c)} aspect={1} circularCrop>
                    <img
                      ref={imageRef}
                      src={selectedFile}
                      alt="Crop preview"
                      style={{ maxWidth: '100%', maxHeight: 'calc(90vh - 120px)', objectFit: 'contain' }}
                    />
                  </ReactCrop>
                </div>
              </div>

              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCropModal(false);
                    setSelectedFile(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCropComplete}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
