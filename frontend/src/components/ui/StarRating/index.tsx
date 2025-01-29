import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  isEditable?: boolean;
  onRatingChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  isEditable = false, 
  onRatingChange,
  size = 'md' 
}) => {
  const [hoverRating, setHoverRating] = React.useState<number>(0);

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'h-4 w-4';
      case 'lg': return 'h-6 w-6';
      default: return 'h-5 w-5';
    }
  };

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${getSizeClass()} ${
            isEditable ? 'cursor-pointer' : ''
          } ${
            (hoverRating || rating) >= star
              ? 'text-yellow-400 fill-current'
              : 'text-gray-300'
          }`}
          onMouseEnter={() => isEditable && setHoverRating(star)}
          onMouseLeave={() => isEditable && setHoverRating(0)}
          onClick={() => isEditable && onRatingChange?.(star)}
        />
      ))}
    </div>
  );
};

export default StarRating;