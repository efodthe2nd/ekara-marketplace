"use client";

import { useState, useRef } from "react";
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
} from "lucide-react";

// Mock data for products
const mockProducts = [
  { id: 1, name: "Product 1", price: 100, rating: 4.5, sales: 10 },
  { id: 2, name: "Product 2", price: 200, rating: 4.0, sales: 20 },
  { id: 3, name: "Product 3", price: 300, rating: 3.5, sales: 30 },
];

// Mock data for reviews
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

const ProfilePage = () => {
  const { user, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("products");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New states for image preview and cropping
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 50,
    height: 50,
    x: 25,
    y: 25,
  });
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleProfilePicChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setSelectedFile(previewUrl);
    setShowCropModal(true);
  };

  const handleCropComplete = async () => {
    if (!imageRef.current || !selectedFile) return;

    const canvas = document.createElement("canvas");
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;

    const pixelCrop: PixelCrop = {
      unit: "px",
      x: crop.x! * scaleX,
      y: crop.y! * scaleY,
      width: crop.width! * scaleX,
      height: crop.height! * scaleY,
    };

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    const ctx = canvas.getContext("2d");
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

    // Convert canvas to blob
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          console.error("Blob is null");
          return;
        }

        setIsUploading(true);
        setUploadError("");
        setShowCropModal(false);

        try {
          const formData = new FormData();
          formData.append("profilePicture", blob, "profile.jpg");

          const response = await fetch(
            "http://localhost:3000/api/auth/profile/picture",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: formData,
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            console.error("Response error text:", errorText);
            throw new Error("Failed to upload profile picture");
          }

          const data = await response.json();
          if (data.profilePicUrl) {
            const profilePicUrl = data.profilePicUrl.replace(/\\/g, "/");
            updateUserProfile({ profilePicture: profilePicUrl });
          } else {
            throw new Error("Profile picture URL is missing in the response");
          }
        } catch (error) {
          console.error("Upload error:", error);
          setUploadError("Failed to upload profile picture");
        } finally {
          setIsUploading(false);
          URL.revokeObjectURL(selectedFile);
          setSelectedFile(null);
        }
      },
      "image/jpeg",
      0.95
    );
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
                        src={`http://localhost:3000/${user.profilePicture}`}
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
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user?.username}
                  </h1>
                  <p className="text-gray-500">{user?.email}</p>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    Location
                  </div>
                  {user?.isSeller && (
                    <div className="mt-2 flex items-center">
                      <div className="flex items-center text-yellow-400">
                        <Star className="h-5 w-5 fill-current" />
                        <span className="ml-1 text-gray-900 font-medium">
                          4.8
                        </span>
                      </div>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-gray-600">128 reviews</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => (window.location.href = "/settings")}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>

            {/* Upload Status Messages */}
            {isUploading && (
              <div className="mt-4 text-sm text-blue-600">
                Uploading profile picture...
              </div>
            )}
            {uploadError && (
              <div className="mt-4 text-sm text-red-600">{uploadError}</div>
            )}
          </div>

          {/* Profile Tabs */}
          <div className="border-t border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("products")}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "products"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Products
                </div>
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "reviews"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
        {activeTab === "products" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <div className="aspect-w-3 aspect-h-2">
                  <Image
                    src={`/api/placeholder/400/300`}
                    alt={product.name}
                    width={400}
                    height={300}
                    className="object-cover w-full h-48"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {product.name}
                  </h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      ${product.price}
                    </span>
                    <div className="flex items-center text-sm text-gray-500">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      {product.rating}
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    {product.sales} sales
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-6">
            {mockReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {review.author[0]}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {review.author}
                      </h4>
                      <div className="mt-1 flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
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
            <div
              className="bg-white p-6 rounded-lg max-w-2xl w-full"
              style={{ maxHeight: "90vh", overflow: "auto" }}
            >
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
              <div
                className="relative"
                style={{ width: "100%", paddingTop: "min(100%, 90vh - 120px)" }}
              >
                <div className="absolute inset-0">
                  <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    aspect={1}
                    circularCrop
                  >
                    <img
                      ref={imageRef}
                      src={selectedFile}
                      alt="Crop preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "calc(90vh - 120px)",
                        objectFit: "contain",
                      }}
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
