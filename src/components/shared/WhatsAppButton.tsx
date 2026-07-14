import { MessageCircle } from 'lucide-react';
import { generateWhatsAppUrl } from '../../lib/whatsapp';

interface WhatsAppButtonProps {
  message: string;
  label?: string;
  fullWidth?: boolean;
  className?: string;
}

export function WhatsAppButton({
  message,
  label = 'Hubungi via WhatsApp',
  fullWidth = false,
  className = '',
}: WhatsAppButtonProps) {
  const handleClick = () => {
    const url = generateWhatsAppUrl(message);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-2 bg-[#18A957] hover:bg-[#138e48] text-white font-medium px-5 py-2.5 rounded-xl transition-colors duration-200 shadow-sm shadow-green-200 cursor-pointer ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
    >
      <MessageCircle size={18} className="fill-white stroke-[#18A957]" />
      <span>{label}</span>
    </button>
  );
}
