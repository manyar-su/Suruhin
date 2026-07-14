import { Star } from 'lucide-react';

interface RatingProps {
  value: number;
  count?: number;
  showText?: boolean;
  size?: number;
  className?: string;
}

export function Rating({
  value,
  count,
  showText = true,
  size = 16,
  className = '',
}: RatingProps) {
  // Generate stars array
  const fullStars = Math.floor(value);
  const hasHalfStar = value % 1 >= 0.25 && value % 1 <= 0.75;
  const starsArray = Array.from({ length: 5 }, (_, i) => {
    if (i < fullStars) return 'full';
    if (i === fullStars && hasHalfStar) return 'half';
    return 'empty';
  });

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5">
        {starsArray.map((type, idx) => {
          if (type === 'full') {
            return (
              <Star
                key={idx}
                size={size}
                className="fill-[#FF6500] stroke-[#FF6500]"
                aria-hidden="true"
              />
            );
          }
          if (type === 'half') {
            return (
              <div key={idx} className="relative inline-block" style={{ width: size, height: size }}>
                <Star
                  size={size}
                  className="stroke-[#FF6500] fill-none"
                  aria-hidden="true"
                />
                <div
                  className="absolute top-0 left-0 overflow-hidden"
                  style={{ width: '50%' }}
                >
                  <Star
                    size={size}
                    className="fill-[#FF6500] stroke-[#FF6500]"
                    aria-hidden="true"
                  />
                </div>
              </div>
            );
          }
          return (
            <Star
              key={idx}
              size={size}
              className="stroke-[#FF6500]/40 fill-none"
              aria-hidden="true"
            />
          );
        })}
      </div>

      {showText && (
        <span className="text-xs font-semibold text-[#172033] flex items-center gap-1">
          {value.toFixed(1)}
          {count !== undefined && (
            <span className="text-gray-400 font-normal">({count} ulasan)</span>
          )}
        </span>
      )}
    </div>
  );
}
