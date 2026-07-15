export function getWhatsAppNumber(): string {
  // Try to read environment variable, or use fallback
  const envNumber = (import.meta as any).env?.VITE_WHATSAPP_NUMBER;
  if (envNumber) {
    return envNumber.replace(/[^0-9]/g, '');
  }
  // Fallback Tasikmalaya local company official number
  return '6282298511930';
}

export function generateWhatsAppUrl(message: string): string {
  const number = getWhatsAppNumber();
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export interface BookingWhatsAppPayload {
  orderId: string;
  customerName: string;
  customerPhone: string;
  serviceTitle: string;
  talentName: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  notes: string;
  price: number;
  platformFee: number;
  total: number;
}

export function generateBookingMessage(payload: BookingWhatsAppPayload): string {
  return `Halo Suruhin, saya ingin memesan layanan.

Nomor Pesanan: ${payload.orderId}
Nama: ${payload.customerName}
Nomor WhatsApp: ${payload.customerPhone}
Layanan: ${payload.serviceTitle}
Talent: ${payload.talentName}
Tanggal: ${payload.date}
Waktu: ${payload.time}
Durasi: ${payload.duration}
Lokasi: ${payload.location}
Catatan: ${payload.notes || '-'}

Harga Layanan: Rp ${payload.price.toLocaleString('id-ID')}
Biaya Platform: Rp ${payload.platformFee.toLocaleString('id-ID')}
Total: Rp ${payload.total.toLocaleString('id-ID')}

Mohon konfirmasi ketersediaannya. Terima kasih.`;
}
