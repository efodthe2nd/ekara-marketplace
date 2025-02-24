import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 border-4 border-t-transparent border-r-blue-400 border-b-transparent border-l-transparent rounded-full animate-spin-slow"></div>
        <div className="absolute inset-0 border-4 border-t-transparent border-r-transparent border-b-blue-300 border-l-transparent rounded-full animate-spin-slower"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;