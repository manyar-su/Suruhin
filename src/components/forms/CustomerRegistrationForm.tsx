import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, Upload } from 'lucide-react';
import { locations } from '../../data/locations';
import { Button } from '../shared/Button';
import {
  firstValidationError,
  validateEmail,
  validateMvpImageUpload,
  validateMvpUpload,
  validatePhone,
  validateRequiredText,
} from '../../lib/validation/forms';
import { registerMvpCustomer } from '../../lib/supabase/mvp';

interface CustomerRegistrationFormProps {
  onSuccess?: () => void;
}

export function CustomerRegistrationForm({ onSuccess }: CustomerRegistrationFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Kota Tasikmalaya',
    profilePhoto: null as File | null,
    ktpPhoto: null as File | null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (field: 'profilePhoto' | 'ktpPhoto', file: File | null) => {
    const nextErrors = { ...errors };
    const error = field === 'profilePhoto'
      ? validateMvpImageUpload(file, 'Foto profil')
      : validateMvpUpload(file, 'KTP');

    if (error) {
      nextErrors[field] = error;
    } else {
      delete nextErrors[field];
    }

    setErrors(nextErrors);
    setFormData({ ...formData, [field]: error ? null : file });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');

    const nextErrors: Record<string, string> = {};
    const validationError = firstValidationError(
      validateRequiredText(formData.fullName, 'Nama lengkap wajib diisi.'),
      validateEmail(formData.email),
      validatePhone(formData.phone),
      validateRequiredText(formData.address, 'Alamat lengkap wajib diisi.'),
      validateMvpImageUpload(formData.profilePhoto, 'Foto profil'),
      validateMvpUpload(formData.ktpPhoto, 'KTP')
    );

    if (validationError) {
      nextErrors.form = validationError;
      setErrors(nextErrors);
      setFormError(validationError);
      return;
    }

    setIsSubmitting(true);
    const result = await registerMvpCustomer({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      profilePhoto: formData.profilePhoto,
      ktpPhoto: formData.ktpPhoto,
    });

    setIsSubmitting(false);
    if ('error' in result) {
      setFormError(result.error);
      return;
    }

    setFormSubmitted(true);
    onSuccess?.();
    window.scrollTo(0, 0);
  };

  if (formSubmitted) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-xl">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-[#18A957]">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-2xl font-black text-[#082B5C]">Customer Berhasil Terdaftar</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#172033]/70">
          Data Anda tersimpan di Supabase. Sekarang Anda bisa mencari Talent dan membuat permintaan layanan.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl md:p-10">
      <div className="space-y-2 text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6500]/20 bg-[#FF6500]/10 px-3 py-1.5 text-xs font-bold text-[#FF6500]">
          <ShieldCheck size={14} />
          <span>Daftar Customer</span>
        </div>
        <h2 className="text-2xl font-black text-[#082B5C]">Buat akun pemesan Suruhin</h2>
        <p className="text-sm text-[#172033]/70">
          Data email disimpan sebagai profil biasa. Supabase Auth belum dipakai pada MVP ini.
        </p>
      </div>

      {formError && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-xs font-bold text-red-600">
          {formError}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">Nama Lengkap</label>
          <input
            value={formData.fullName}
            onChange={(event) => setFormData({ ...formData, fullName: event.target.value })}
            className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/15"
            placeholder="Contoh: Budi Santoso"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(event) => setFormData({ ...formData, email: event.target.value })}
            className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/15"
            placeholder="nama@email.com"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">Nomor WhatsApp</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
            className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/15"
            placeholder="08123456789"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">Kota</label>
          <select
            value={formData.city}
            onChange={(event) => setFormData({ ...formData, city: event.target.value })}
            className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500]"
          >
            {locations.map((location) => (
              <option key={location.id} value={location.name}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">Alamat Lengkap</label>
        <textarea
          rows={3}
          value={formData.address}
          onChange={(event) => setFormData({ ...formData, address: event.target.value })}
          className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/15"
          placeholder="Tuliskan alamat lengkap untuk titik layanan."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {([
          ['profilePhoto', 'Foto Profil', '.jpg,.jpeg,.png,image/jpeg,image/png'],
          ['ktpPhoto', 'Upload KTP', '.jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf'],
        ] as const).map(([field, label, accept]) => (
          <label key={field} className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-5 text-center transition hover:border-[#FF6500]/40">
            <input
              type="file"
              accept={accept}
              className="hidden"
              onChange={(event) => {
                handleFileChange(field, event.target.files?.[0] || null);
                event.target.value = '';
              }}
            />
            <Upload size={20} className="mb-2 text-gray-400" />
            <span className="text-xs font-black text-[#082B5C]">{label}</span>
            <span className="mt-1 text-[10px] text-gray-400">Maksimal 5MB</span>
            {formData[field] && (
              <span className="mt-3 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-600">
                {formData[field]?.name}
              </span>
            )}
            {errors[field] && <span className="mt-2 text-[10px] font-bold text-red-500">{errors[field]}</span>}
          </label>
        ))}
      </div>

      <Button type="submit" variant="primary" loading={isSubmitting} fullWidth className="font-extrabold">
        <span>Daftar Customer & Cari Talent</span>
        <ArrowRight size={18} className="ml-2" />
      </Button>
    </form>
  );
}
