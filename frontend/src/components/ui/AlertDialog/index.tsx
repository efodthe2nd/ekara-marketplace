import * as React from "react";

interface AlertDialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClick?: () => void;
  className?: string;
}

// Root dialog component that controls visibility
const AlertDialog: React.FC<AlertDialogProps> = ({ children, open, onOpenChange }) => {
  // Simply don't render anything if not open
  if (!open) return null;
  
  // Using setTimeout to ensure the event loop completes before closing
  const handleBackdropClick = () => {
    setTimeout(() => {
      if (onOpenChange) onOpenChange(false);
    }, 0);
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {children}
    </div>
  );
};

// Content wrapper that prevents backdrop clicks from closing
const AlertDialogContent: React.FC<AlertDialogProps> = ({ children, className = "" }) => {
  // Use mousedown instead of click to capture the event earlier
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  return (
    <div 
      className={`bg-white rounded-lg shadow-lg max-w-md w-full mx-4 overflow-hidden ${className}`}
      onMouseDown={handleMouseDown}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
};

const AlertDialogHeader: React.FC<AlertDialogProps> = ({ children }) => (
  <div className="px-6 pt-6 pb-4">
    {children}
  </div>
);

const AlertDialogTitle: React.FC<AlertDialogProps> = ({ children }) => (
  <h2 className="text-xl font-semibold text-gray-900">
    {children}
  </h2>
);

const AlertDialogDescription: React.FC<AlertDialogProps> = ({ children }) => (
  <p className="mt-2 text-gray-500">
    {children}
  </p>
);

const AlertDialogFooter: React.FC<AlertDialogProps> = ({ children }) => (
  <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-2">
    {children}
  </div>
);

const AlertDialogCancel: React.FC<AlertDialogProps> = ({ children, onClick }) => {
  // Safe click handler with timeout
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Use setTimeout to avoid React event conflicts
    setTimeout(() => {
      if (onClick) onClick();
    }, 0);
  };
  
  return (
    <button
      type="button"
      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

const AlertDialogAction: React.FC<AlertDialogProps> = ({ children, onClick }) => {
  // Safe click handler with timeout
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Use setTimeout to avoid React event conflicts
    setTimeout(() => {
      if (onClick) onClick();
    }, 0);
  };
  
  return (
    <button
      type="button"
      className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
};