import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, LoaderCircle, ShieldCheck, Upload } from 'lucide-react';
import { locations } from '../../data/locations';
import { requestKtpOcr } from '../../lib/ocr/client';
import type { KtpParsedFields } from '../../lib/ocr/ktp';
import { Button } from '../shared/Button';
import { saveCurrentCustomerProfile } from '../../lib/customerProfile';
import {
  firstValidationError,
  validateEmail,
  validateMvpImageUpload,
  validateMvpUpload,
  validatePhone,
  validateRequiredText,
} from '../../lib/validation/forms';
import { createMvpEntityId, registerMvpCustomer } from '../../lib/supabase/mvp';

interface CustomerRegistrationFormProps {
  onSuccess?: () => void;
}

function getCityFromOcr(city: string, currentCity: string) {
  if (!city) return currentCity;
  const match = locations.find((location) => city.toLowerCase().includes(location.name.toLowerCase()));
  return match?.name || currentCity;
}

export function CustomerRegistrationForm({ onSuccess }: CustomerRegistrationFormProps) {
  const [formData, setFormData] = useState({
    id: '',
    fullName: '',
    email: '',
    phone: '',
    nik: '',
    birthPlace: '',
    birthDate: '',
    gender: '',
    address: '',
    rtRw: '',
    village: '',
    district: '',
    city: 'Kota Tasikmalaya',
    religion: '',
    maritalStatus: '',
    occupation: '',
    nationality: 'WNI',
    profilePhoto: null as File | null,
    ktpPhoto: null as File | null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReadingKtp, setIsReadingKtp] = useState(false);
  const [ocrNotice, setOcrNotice] = useState('');
  const [ocrError, setOcrError] = useState('');

  const ktpPreviewUrl = useMemo(
    () => (formData.ktpPhoto && formData.ktpPhoto.type.startsWith('image/') ? URL.createObjectURL(formData.ktpPhoto) : ''),
    [formData.ktpPhoto]
  );

  useEffect(() => {
    return () => {
      if (ktpPreviewUrl) URL.revokeObjectURL(ktpPreviewUrl);
    };
  }, [ktpPreviewUrl]);

  const handleFieldChange = (field: string, value: string | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      delete next.form;
      return next;
    });
  };

  const handleProfilePhotoChange = (file: File | null) => {
    const error = validateMvpImageUpload(file, 'Foto profil');
    if (error) {
      setErrors((prev) => ({ ...prev, profilePhoto: error }));
      setFormData((prev) => ({ ...prev, profilePhoto: null }));
      return;
    }

    setErrors((prev) => {
      const next = { ...prev };
      delete next.profilePhoto;
      return next;
    });
    setFormData((prev) => ({ ...prev, profilePhoto: file }));
  };

  const applyKtpFields = (parsed: KtpParsedFields) => {
    setFormData((prev) => ({
      ...prev,
      nik: parsed.nik || prev.nik,
      fullName: parsed.full_name || prev.fullName,
      birthPlace: parsed.birth_place || prev.birthPlace,
      birthDate: parsed.birth_date || prev.birthDate,
      gender: parsed.gender || prev.gender,
      address: parsed.address || prev.address,
      rtRw: parsed.rt_rw || prev.rtRw,
      village: parsed.village || prev.village,
      district: parsed.district || prev.district,
      city: getCityFromOcr(parsed.city, prev.city),
      religion: parsed.religion || prev.religion,
      maritalStatus: parsed.marital_status || prev.maritalStatus,
      occupation: parsed.occupation || prev.occupation,
      nationality: parsed.nationality || prev.nationality,
    }));
  };

  const handleKtpChange = async (file: File | null) => {
    const error = validateMvpUpload(file, 'KTP');
    if (error) {
      setErrors((prev) => ({ ...prev, ktpPhoto: error }));
      setFormData((prev) => ({ ...prev, ktpPhoto: null }));
      return;
    }

    if (!file) return;

    const entityId = formData.id || createMvpEntityId();
    setErrors((prev) => {
      const next = { ...prev };
      delete next.ktpPhoto;
      return next;
    });
    setFormData((prev) => ({ ...prev, id: entityId, ktpPhoto: file }));
    setIsReadingKtp(true);
    setOcrError('');
    setOcrNotice('Membaca data KTP...');

    try {
      const parsed = await requestKtpOcr(file, { entityId, entityType: 'customer' });
      applyKtpFields(parsed);
      setOcrNotice('Data KTP berhasil diisi otomatis');
      window.alert('Data berhasil dibaca dari KTP. Mohon cek kembali sebelum disimpan.');
    } catch (ktpError) {
      const message = ktpError instanceof Error
        ? ktpError.message
        : 'Data KTP belum terbaca jelas. Silakan upload ulang foto yang lebih terang atau isi manual.';
      setOcrNotice('');
      setOcrError(message);
      window.alert(message);
    } finally {
      setIsReadingKtp(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');

    const validationError = firstValidationError(
      validateRequiredText(formData.fullName, 'Nama lengkap wajib diisi.'),
      validateEmail(formData.email),
      validatePhone(formData.phone),
      validateRequiredText(formData.nik, 'NIK wajib diisi.'),
      validateRequiredText(formData.birthPlace, 'Tempat lahir wajib diisi.'),
      validateRequiredText(formData.birthDate, 'Tanggal lahir wajib diisi.'),
      validateRequiredText(formData.gender, 'Jenis kelamin wajib diisi.'),
      validateRequiredText(formData.address, 'Alamat lengkap wajib diisi.'),
      validateRequiredText(formData.rtRw, 'RT/RW wajib diisi.'),
      validateRequiredText(formData.village, 'Kelurahan/desa wajib diisi.'),
      validateRequiredText(formData.district, 'Kecamatan wajib diisi.'),
      validateRequiredText(formData.religion, 'Agama wajib diisi.'),
      validateRequiredText(formData.maritalStatus, 'Status perkawinan wajib diisi.'),
      validateRequiredText(formData.occupation, 'Pekerjaan wajib diisi.'),
      validateRequiredText(formData.nationality, 'Kewarganegaraan wajib diisi.'),
      validateMvpImageUpload(formData.profilePhoto, 'Foto profil'),
      validateMvpUpload(formData.ktpPhoto, 'KTP')
    );

    if (validationError) {
      setErrors((prev) => ({ ...prev, form: validationError }));
      setFormError(validationError);
      return;
    }

    setIsSubmitting(true);
    const result = await registerMvpCustomer({
      id: formData.id || createMvpEntityId(),
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      nik: formData.nik,
      birthPlace: formData.birthPlace,
      birthDate: formData.birthDate,
      gender: formData.gender,
      address: formData.address,
      rtRw: formData.rtRw,
      village: formData.village,
      district: formData.district,
      city: formData.city,
      religion: formData.religion,
      maritalStatus: formData.maritalStatus,
      occupation: formData.occupation,
      nationality: formData.nationality,
      profilePhoto: formData.profilePhoto,
      ktpPhoto: formData.ktpPhoto,
    });

    setIsSubmitting(false);
    if (result.ok === false) {
      setFormError(result.error);
      return;
    }

    saveCurrentCustomerProfile({
      id: result.data.id,
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      city: formData.city.trim(),
      address: formData.address.trim(),
    });
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
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl md:p-10">
      <div className="space-y-2 text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6500]/20 bg-[#FF6500]/10 px-3 py-1.5 text-xs font-bold text-[#FF6500]">
          <ShieldCheck size={14} />
          <span>Daftar Customer</span>
        </div>
        <h2 className="text-2xl font-black text-[#082B5C]">Buat akun pemesan Suruhin</h2>
        <p className="text-sm text-[#172033]/70">
          Upload KTP akan dibaca otomatis lalu seluruh field tetap bisa Anda koreksi manual sebelum disimpan.
        </p>
      </div>

      {formError && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-xs font-bold text-red-600">
          {formError}
        </div>
      )}

      {(isReadingKtp || ocrNotice || ocrError) && (
        <div className={`rounded-2xl border p-4 text-xs font-bold ${ocrError ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-blue-100 bg-blue-50 text-[#082B5C]'}`}>
          <div className="flex items-center gap-2">
            {isReadingKtp ? <LoaderCircle size={14} className="animate-spin" /> : ocrError ? <AlertCircle size={14} /> : <CheckCircle2 size={14} className="text-[#18A957]" />}
            <span>{isReadingKtp ? 'Membaca data KTP...' : ocrError || ocrNotice}</span>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">Nama Lengkap</label>
              <input value={formData.fullName} onChange={(event) => handleFieldChange('fullName', event.target.value)} className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/15" placeholder="Contoh: Budi Santoso" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">Email</label>
              <input type="email" value={formData.email} onChange={(event) => handleFieldChange('email', event.target.value)} className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/15" placeholder="nama@email.com" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">Nomor WhatsApp</label>
              <input type="tel" value={formData.phone} onChange={(event) => handleFieldChange('phone', event.target.value)} className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/15" placeholder="08123456789" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">NIK</label>
              <input value={formData.nik} onChange={(event) => handleFieldChange('nik', event.target.value)} className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/15" placeholder="16 digit NIK" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">Tempat Lahir</label>
              <input value={formData.birthPlace} onChange={(event) => handleFieldChange('birthPlace', event.target.value)} className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/15" placeholder="Tasikmalaya" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">Tanggal Lahir</label>
              <input type="date" value={formData.birthDate} onChange={(event) => handleFieldChange('birthDate', event.target.value)} className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/15" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">Jenis Kelamin</label>
              <input value={formData.gender} onChange={(event) => handleFieldChange('gender', event.target.value)} className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm uppercase outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/15" placeholder="LAKI-LAKI / PEREMPUAN" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">Kota</label>
              <select value={formData.city} onChange={(event) => handleFieldChange('city', event.target.value)} className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500]">
                {locations.map((location) => (
                  <option key={location.id} value={location.name}>{location.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">Alamat Lengkap</label>
            <textarea rows={3} value={formData.address} onChange={(event) => handleFieldChange('address', event.target.value)} className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/15" placeholder="Tuliskan alamat lengkap sesuai KTP." />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">RT/RW</label>
              <input value={formData.rtRw} onChange={(event) => handleFieldChange('rtRw', event.target.value)} className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/15" placeholder="001/002" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">Kelurahan/Desa</label>
              <input value={formData.village} onChange={(event) => handleFieldChange('village', event.target.value)} className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/15" placeholder="Kelurahan" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">Kecamatan</label>
              <input value={formData.district} onChange={(event) => handleFieldChange('district', event.target.value)} className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/15" placeholder="Kecamatan" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">Agama</label>
              <input value={formData.religion} onChange={(event) => handleFieldChange('religion', event.target.value)} className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/15" placeholder="Islam" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">Status Perkawinan</label>
              <input value={formData.maritalStatus} onChange={(event) => handleFieldChange('maritalStatus', event.target.value)} className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/15" placeholder="Belum Kawin" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">Pekerjaan</label>
              <input value={formData.occupation} onChange={(event) => handleFieldChange('occupation', event.target.value)} className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/15" placeholder="Karyawan Swasta" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">Kewarganegaraan</label>
            <input value={formData.nationality} onChange={(event) => handleFieldChange('nationality', event.target.value)} className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm uppercase outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/15" placeholder="WNI" />
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-5 text-center transition hover:border-[#FF6500]/40">
            <input type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" className="hidden" onChange={(event) => { handleProfilePhotoChange(event.target.files?.[0] || null); event.target.value = ''; }} />
            <Upload size={20} className="mb-2 text-gray-400" />
            <span className="text-xs font-black text-[#082B5C]">Foto Profil</span>
            <span className="mt-1 text-[10px] text-gray-400">Maksimal 5MB</span>
            {formData.profilePhoto && <span className="mt-3 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-600">{formData.profilePhoto.name}</span>}
            {errors.profilePhoto && <span className="mt-2 text-[10px] font-bold text-red-500">{errors.profilePhoto}</span>}
          </label>

          <label className="flex cursor-pointer flex-col rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-5 text-center transition hover:border-[#FF6500]/40">
            <input type="file" accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf" className="hidden" onChange={(event) => { void handleKtpChange(event.target.files?.[0] || null); event.target.value = ''; }} />
            <Upload size={20} className="mx-auto mb-2 text-gray-400" />
            <span className="text-xs font-black text-[#082B5C]">Upload KTP</span>
            <span className="mt-1 text-[10px] text-gray-400">Upload dulu, lalu sistem membaca data otomatis</span>
            {formData.ktpPhoto && <span className="mt-3 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-600">{formData.ktpPhoto.name}</span>}
            {errors.ktpPhoto && <span className="mt-2 text-[10px] font-bold text-red-500">{errors.ktpPhoto}</span>}
            {ktpPreviewUrl && (
              <img src={ktpPreviewUrl} alt="Preview KTP" className="mt-4 h-44 w-full rounded-2xl border border-slate-200 object-cover" />
            )}
          </label>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-[11px] leading-relaxed text-[#172033]/75">
            NIK dan dokumen KTP tidak ditampilkan di halaman publik. File KTP disimpan di bucket private Supabase dan admin harus memakai signed URL untuk melihatnya.
          </div>
        </div>
      </div>

      <Button type="submit" variant="primary" loading={isSubmitting} fullWidth className="font-extrabold">
        <span>Daftar Customer</span>
        <ArrowRight size={18} className="ml-2" />
      </Button>
    </form>
  );
}
