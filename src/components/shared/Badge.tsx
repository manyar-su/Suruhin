import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'neutral';
  outline?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = 'neutral',
  outline = false,
  className = '',
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full select-none transition-colors duration-200';
  
  const colors = {
    primary: outline 
      ? 'border border-[#FF6500] text-[#FF6500] bg-orange-50/50' 
      : 'bg-orange-50 text-[#FF6500]',
    secondary: outline 
      ? 'border border-[#082B5C] text-[#082B5C] bg-[#082B5C]/5' 
      : 'bg-[#082B5C] text-white',
    success: outline 
      ? 'border border-[#18A957] text-[#18A957] bg-green-50/50' 
      : 'bg-green-50 text-[#18A957]',
    danger: outline 
      ? 'border border-[#E5484D] text-[#E5484D] bg-red-50/50' 
      : 'bg-red-50 text-[#E5484D]',
    warning: outline 
      ? 'border border-amber-500 text-amber-600 bg-amber-50/50' 
      : 'bg-amber-50 text-amber-700',
    info: outline 
      ? 'border border-blue-500 text-blue-600 bg-blue-50/50' 
      : 'bg-blue-50 text-blue-700',
    neutral: outline 
      ? 'border border-[#172033]/20 text-[#172033]/75 bg-[#F5F7FA]' 
      : 'bg-[#F5F7FA] text-[#172033]'
  };

  return (
    <span className={`${baseStyles} ${colors[variant]} ${className}`}>
      {children}
    </span>
  );
}
