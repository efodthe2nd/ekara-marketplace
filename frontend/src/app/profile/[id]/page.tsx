"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
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
  Check,
  ChevronDown,
} from "lucide-react";
import StarRating from "@/components/ui/StarRating";
import ReviewForm from "@/components/ui/ReviewForm/ReviewForm";
import { User } from "@/types/auth";

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: Date;
  buyer: {
    user: {
      username: string;
    };
  };
  reply?: {
    comment: string;
    createdAt: Date;
  } | null;
}

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
  //const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const viewedProfileId = params?.id || searchParams.get("id");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const getProfileId = (id: string | string[] | null): string | null => {
    if (!id) return null;
    return Array.isArray(id) ? id[0] : id;
  };

  // States
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState("");
  const [activeTab, setActiveTab] = useState("products");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const isOwnProfile = useMemo(() => {
    return !viewedProfileId || viewedProfileId === user?.id?.toString();
  }, [viewedProfileId, user?.id]);
  const [viewedUser, setViewedUser] = useState<User | null>(null);
  const [sellerProfileId, setSellerProfileId] = useState<number | null>(null);
  const [sellerStats, setSellerStats] = useState<{
    averageRating: number;
    totalReviews: number;
  }>({
    averageRating: 0,
    totalReviews: 0,
  });

  // States for image cropping
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
  const displayedUser =
    viewedProfileId && viewedProfileId !== user?.id?.toString()
      ? viewedUser
      : user;

  // State for editable location
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [location, setLocation] = useState(user?.location || "");

  // Effects
    const fetchSellerStats = useCallback(async (id: string) => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/users/seller/${id}/stats`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
  
        if (!response.ok) {
          throw new Error("Failed to fetch seller stats");
        }
  
        const data = await response.json();
        setSellerStats(data);
      } catch (err) {
        console.error("Error fetching seller stats:", err);
      }
    }, []);
  
    // Use the function in useEffect
    // useEffect(() => {
    //   const profileId = getProfileId(viewedProfileId) || user?.id?.toString();
    //   if (profileId && (viewedUser?.isSeller || user?.isSeller)) {
    //     fetchSellerStats(profileId);
    //   }
    // }, [viewedProfileId, user?.id, viewedUser?.isSeller, user?.isSeller, fetchSellerStats]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     if (viewedProfileId && !isOwnProfile) {
  //       try {
  //         const response = await fetch(
  //           `http://localhost:3000/api/users/${viewedProfileId}`,
  //           {
  //             headers: {
  //               Authorization: `Bearer ${localStorage.getItem("token")}`,
  //             },
  //           }
  //         );

  //         if (!response.ok) {
  //           throw new Error("Failed to fetch user data");
  //         }

  //         const data = await response.json();
  //         setViewedUser(data.user);
  //       } catch (err) {
  //         console.error("Error fetching user data:", err);
  //       }
  //     }
  //   };

  //   fetchData();
  // }, [viewedProfileId, isOwnProfile]);


  useEffect(() => {
    const fetchSellerStats = async () => {
      if (user?.id && user.isSeller) {
        try {
          const response = await fetch(
            `http://localhost:3000/api/users/seller/${user.id}/stats`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to fetch seller stats");
          }

          const data = await response.json();
          setSellerStats(data);
        } catch (err) {
          console.error("Error fetching seller stats:", err);
        }
      }
    };

    if (user?.isSeller) {
      fetchSellerStats();
    }
  }, [user]);

  // Functions

  const fetchUserData = useCallback(async (userId: string | string[]) => {
    const profileId = getProfileId(userId);
    if (!profileId) return;

    try {
      // Updated URL path to match backend route structure
      const response = await fetch(
        `http://localhost:3000/api/auth/${profileId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        // Parse error response properly
        const errorData = await response.text();
        try {
          const parsedError = JSON.parse(errorData);
          throw new Error(parsedError.message || "Failed to fetch user data");
        } catch {
          throw new Error("Failed to fetch user data");
        }
      }

      const data = await response.json();
      setViewedUser(data.user);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load user profile"
      );
    }
  }, []);

  const fetchSellerProfile = useCallback(async (userId: string) => {
    try {
      console.log('Fetching seller profile for userId:', userId);
      const response = await fetch(
        `http://localhost:3000/api/users/${userId}/seller-profile`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.message || "Failed to fetch seller profile");
      }
  
      const data = await response.json();
      console.log('Received seller profile:', data);
      setSellerProfileId(data.sellerId);
    } catch (err) {
      console.error("Error fetching seller profile:", err);
      throw err; // Re-throw to handle in the component
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    if ((user?.id && user.isSeller) || viewedProfileId) {
      try {
        // Convert viewedProfileId to string if it's an array
        const sellerId = Array.isArray(viewedProfileId)
          ? viewedProfileId[0]
          : viewedProfileId;

        const response = await fetch(
          `http://localhost:3000/api/products/seller/${sellerId || user?.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError("Failed to load products");
        console.error("Error fetching products:", err);
      } finally {
        setIsLoading(false);
      }
    }
  }, [user?.id, user?.isSeller, viewedProfileId]);

  useEffect(() => {
    if ((user?.id && user.isSeller) || viewedProfileId) {
      fetchProducts();
    }
  }, [user, viewedProfileId, fetchProducts]);

  useEffect(() => {
    const profileId = getProfileId(viewedProfileId);
    if (profileId && profileId !== user?.id?.toString()) {
      fetchUserData(profileId);
    }
  }, [viewedProfileId, user?.id, fetchUserData]);

  const fetchReviews = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    // Only proceed if we have a seller ID
    if (!sellerProfileId) return;
    
    setIsLoadingReviews(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/reviews/seller/${sellerProfileId}/reviews?page=${pageNum}&limit=5`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }
  
      const data = await response.json();
      console.log('Received reviews data:', data);
      
      setHasMore(data.hasMore);
  
      if (append) {
        setReviews((prev) => [...prev, ...data.reviews]);
      } else {
        setReviews(data.reviews);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setReviewsError("Failed to load reviews");
    } finally {
      setIsLoadingReviews(false);
    }
  }, [sellerProfileId]);


  useEffect(() => {
    const profileId = getProfileId(viewedProfileId);
    if (profileId) {
      // First fetch the seller profile to get the seller ID
      fetchSellerProfile(profileId);
    }
  }, [viewedProfileId, fetchSellerProfile]);
  
  // Add another useEffect to fetch reviews when we have the seller ID
  useEffect(() => {
    if (sellerProfileId) {
      fetchReviews(1, false);
    }
  }, [sellerProfileId, fetchReviews]);

  useEffect(() => {
    if (viewedProfileId || user?.id) {
      fetchReviews(1, false);
    }
  }, [viewedProfileId, user?.id, fetchReviews]);



  const loadMoreReviews = () => {
    if (!isLoadingReviews && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchReviews(nextPage, true);
    }
  };

  // const handleReviewSubmitted = () => {
  //   setShowReviewForm(false);
  //   setPage(1);
  //   fetchReviews(1, false);
  // };

  const handleProfilePicChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

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

    setIsUploading(true);
    setUploadError("");
    setShowCropModal(false);

    try {
      const base64Image = canvas.toDataURL("image/jpeg");

      const response = await fetch(
        "http://localhost:3000/api/auth/profile/picture",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            profilePicture: base64Image,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error text:", errorText);
        throw new Error("Failed to upload profile picture");
      }

      const data = await response.json();
      if (data.profilePicUrl) {
        updateUserProfile({ profilePicture: data.profilePicUrl });
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
  };

  const handleSaveLocation = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/auth/profile/location",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ location }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update location");
      }

      const data = await response.json();
      console.log(data);
      setIsEditingLocation(false);
    } catch (error) {
      console.error("Error updating location:", error);
      throw error;
    }
  };

  useEffect(() => {
    console.log("Profile params:", params);
    console.log("Viewed profile ID:", viewedProfileId);
  }, [params, viewedProfileId]);

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
                    {displayedUser?.profilePicture ? (
                      <Image
                        src={displayedUser.profilePicture}
                        alt="Profile"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                        priority
                      />
                    ) : (
                      <span className="text-3xl text-gray-600">
                        {displayedUser?.username?.[0]?.toUpperCase()}
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
                    {displayedUser?.username}
                  </h1>
                  <p className="text-gray-500">{displayedUser?.email}</p>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {isOwnProfile ? (
                      // Show editable location for own profile
                      isEditingLocation ? (
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
                          <span>{location || "Add location"}</span>
                          <button
                            onClick={() => setIsEditingLocation(true)}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      )
                    ) : (
                      // Show static location for other users' profiles
                      <span>
                        {displayedUser?.location || "No location set"}
                      </span>
                    )}
                  </div>
                  {displayedUser?.isSeller && (
                    <div className="mt-2 flex items-center">
                      <div className="flex items-center text-yellow-400">
                        <Star className="h-5 w-5 fill-current" />
                        <span className="ml-1 text-gray-900 font-medium">
                          {sellerStats.averageRating > 0
                            ? sellerStats.averageRating.toFixed(1)
                            : "No ratings"}
                        </span>
                      </div>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-gray-600">
                        {sellerStats.totalReviews}{" "}
                        {sellerStats.totalReviews === 1 ? "review" : "reviews"}
                      </span>
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
            {isLoading ? (
              <div className="col-span-full text-center py-8">
                Loading products...
              </div>
            ) : error ? (
              <div className="col-span-full text-center text-red-600 py-8">
                {error}
              </div>
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
                    <h3 className="text-lg font-medium text-gray-900">
                      {product.name}
                    </h3>
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

        {activeTab === "reviews" && (
          <div className="space-y-6">
            {!isOwnProfile && !showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Write a Review
              </button>
            )}

            {showReviewForm && (
              <ReviewForm
                sellerId={parseInt(getProfileId(viewedProfileId) || "")}
                onReviewSubmitted={() => {
                  setShowReviewForm(false);
                  // Refresh reviews and stats
                  const profileId = getProfileId(viewedProfileId);
                  if (profileId) {
                    fetchSellerStats(profileId);
                    fetchReviews(1, false);
                  }
                }}
              />
            )}

            {isLoadingReviews && reviews.length === 0 ? (
              <div className="text-center py-8">Loading reviews...</div>
            ) : reviewsError ? (
              <div className="text-center text-red-600 py-8">
                {reviewsError}
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8">No reviews yet</div>
            ) : (
              <>
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white rounded-xl shadow-sm p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {review.buyer.user.username[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {review.buyer.user.username}
                          </h4>
                          <div className="mt-1">
                            <StarRating rating={review.rating} size="sm" />
                          </div>
                        </div>
                      </div>
                      <time className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </time>
                    </div>
                    <p className="mt-4 text-sm text-gray-600">
                      {review.comment}
                    </p>

                    {/* Seller Reply Section */}
                    {review.reply && (
                      <div className="mt-4 pl-4 border-l-2 border-gray-200">
                        <div className="text-sm">
                          <span className="font-medium text-gray-900">
                            Seller&apos;s response
                          </span>
                          <time className="ml-2 text-gray-500">
                            {new Date(
                              review.reply.createdAt
                            ).toLocaleDateString()}
                          </time>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {review.reply.comment}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {hasMore && (
                  <div className="text-center mt-6">
                    <button
                      onClick={loadMoreReviews}
                      disabled={isLoadingReviews}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      {isLoadingReviews ? (
                        "Loading..."
                      ) : (
                        <>
                          Show More
                          <ChevronDown className="ml-1 h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
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
