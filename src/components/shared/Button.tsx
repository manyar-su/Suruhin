import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  fullWidth?: boolean;
  loading?: boolean;
  className?: string;
  disabled?: boolean;
  onClick?: (e: any) => void;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  // Styles based on brand specifications
  // Navy gelap: "#082B5C" => bg-[#082B5C]
  // Orange: "#FF6500" => bg-[#FF6500]
  // Putih: "#FFFFFF"
  // Abu terang: "#F5F7FA"
  // Hijau status: "#18A957"
  // Merah peringatan: "#E5484D"

  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';
  
  const variants = {
    primary: 'bg-[#FF6500] hover:bg-[#e05900] text-white focus:ring-[#FF6500]',
    secondary: 'bg-[#082B5C] hover:bg-[#062045] text-white focus:ring-[#082B5C]',
    outline: 'border border-[#082B5C]/20 hover:bg-[#F5F7FA] text-[#082B5C] focus:ring-[#082B5C]',
    ghost: 'hover:bg-[#F5F7FA] text-[#172033]',
    success: 'bg-[#18A957] hover:bg-[#138e48] text-white focus:ring-[#18A957]',
    danger: 'bg-[#E5484D] hover:bg-[#ca3a3e] text-white focus:ring-[#E5484D]'
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs h-9',
    md: 'px-5 py-2.5 text-sm h-11',
    lg: 'px-7 py-3 text-base h-13',
    icon: 'p-2.5 w-11 h-11'
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4.5 w-4.5 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Mohon tunggu...
        </>
      ) : (
        children
      )}
    </button>
  );
}
