import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle2, FileCheck, LoaderCircle, ShieldCheck, Upload, UserCheck } from 'lucide-react';
import { services } from '../../data/services';
import { locations } from '../../data/locations';
import { requestKtpOcr } from '../../lib/ocr/client';
import type { KtpParsedFields } from '../../lib/ocr/ktp';
import { Button } from '../shared/Button';
import {
  validateEmail,
  validateMvpImageUpload,
  validateMvpUpload,
  validatePhone,
  validatePositiveNumber,
  validateRequiredText,
  validateSelected,
} from '../../lib/validation/forms';
import { createMvpEntityId, registerMvpTalent, uploadMvpPrivateFile } from '../../lib/supabase/mvp';

interface TalentRegistrationFormProps {
  onSuccess?: () => void;
}

function getFileExtension(file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext && ['jpg', 'jpeg', 'png', 'pdf'].includes(ext)) return ext;
  if (file.type === 'image/png') return 'png';
  if (file.type === 'application/pdf') return 'pdf';
  return 'jpg';
}

function getCityFromOcr(city: string, currentCity: string) {
  if (!city) return currentCity;
  const match = locations.find((location) => city.toLowerCase().includes(location.name.toLowerCase()));
  return match?.name || currentCity;
}

export function TalentRegistrationForm({ onSuccess }: TalentRegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReadingKtp, setIsReadingKtp] = useState(false);
  const [ocrNotice, setOcrNotice] = useState('');
  const [ocrError, setOcrError] = useState('');
  const [formData, setFormData] = useState({
    id: '',
    fullName: '',
    whatsappNumber: '',
    emailAddress: '',
    nik: '',
    birthPlace: '',
    birthDate: '',
    gender: 'LAKI-LAKI',
    fullAddress: '',
    rtRw: '',
    village: '',
    district: '',
    selectedCity: 'Kota Tasikmalaya',
    religion: '',
    maritalStatus: '',
    occupation: '',
    nationality: 'WNI',
    selectedServices: [] as string[],
    pricePerHour: 50000,
    selectedSchedules: [] as string[],
    selectedCoverageAreas: [] as string[],
    experienceText: '',
    bioText: '',
    profilePhoto: null as File | null,
    ktpPhoto: null as File | null,
    skckPhoto: null as File | null,
    agreeTerms: false,
  });

  const ktpPreviewUrl = useMemo(
    () => (formData.ktpPhoto && formData.ktpPhoto.type.startsWith('image/') ? URL.createObjectURL(formData.ktpPhoto) : ''),
    [formData.ktpPhoto]
  );

  useEffect(() => {
    return () => {
      if (ktpPreviewUrl) URL.revokeObjectURL(ktpPreviewUrl);
    };
  }, [ktpPreviewUrl]);

  const handleFieldChange = (field: string, value: string | number | boolean | File | null | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      delete next.submit;
      return next;
    });
  };

  const handleServiceToggle = (slug: string) => {
    const updated = formData.selectedServices.includes(slug)
      ? formData.selectedServices.filter((service) => service !== slug)
      : [...formData.selectedServices, slug];
    handleFieldChange('selectedServices', updated);
  };

  const handleScheduleToggle = (day: string) => {
    const updated = formData.selectedSchedules.includes(day)
      ? formData.selectedSchedules.filter((item) => item !== day)
      : [...formData.selectedSchedules, day];
    handleFieldChange('selectedSchedules', updated);
  };

  const handleAreaToggle = (area: string) => {
    const updated = formData.selectedCoverageAreas.includes(area)
      ? formData.selectedCoverageAreas.filter((item) => item !== area)
      : [...formData.selectedCoverageAreas, area];
    handleFieldChange('selectedCoverageAreas', updated);
  };

  const handleFileChange = (field: 'profilePhoto' | 'ktpPhoto' | 'skckPhoto', file: File | null) => {
    const label = field === 'profilePhoto' ? 'Foto profil' : field === 'ktpPhoto' ? 'KTP' : 'SKCK';
    const error = field === 'profilePhoto'
      ? validateMvpImageUpload(file, label)
      : validateMvpUpload(file, label);

    if (error) {
      setErrors((prev) => ({ ...prev, [field]: error }));
      setFormData((prev) => ({ ...prev, [field]: null }));
      return;
    }

    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const applyKtpFields = (parsed: KtpParsedFields) => {
    setFormData((prev) => ({
      ...prev,
      nik: parsed.nik || prev.nik,
      fullName: parsed.full_name || prev.fullName,
      birthPlace: parsed.birth_place || prev.birthPlace,
      birthDate: parsed.birth_date || prev.birthDate,
      gender: parsed.gender || prev.gender,
      fullAddress: parsed.address || prev.fullAddress,
      rtRw: parsed.rt_rw || prev.rtRw,
      village: parsed.village || prev.village,
      district: parsed.district || prev.district,
      selectedCity: getCityFromOcr(parsed.city, prev.selectedCity),
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
    setFormData((prev) => ({ ...prev, id: entityId, ktpPhoto: file }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.ktpPhoto;
      return next;
    });
    setIsReadingKtp(true);
    setOcrError('');
    setOcrNotice('Membaca data KTP...');

    try {
      const extension = getFileExtension(file);
      await uploadMvpPrivateFile('talent-files', `talent/ktp/${entityId}/ktp.${extension}`, file, { upsert: true });
      const parsed = await requestKtpOcr(file);
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

  const validateStep = (step: number): boolean => {
    const stepErrors: Record<string, string> = {};

    if (step === 1) {
      const fullNameError = validateRequiredText(formData.fullName, 'Nama lengkap wajib diisi.');
      const phoneError = validatePhone(formData.whatsappNumber);
      const emailError = validateEmail(formData.emailAddress);
      const nikError = validateRequiredText(formData.nik, 'NIK wajib diisi.');
      const birthPlaceError = validateRequiredText(formData.birthPlace, 'Tempat lahir wajib diisi.');
      const birthDateError = validateRequiredText(formData.birthDate, 'Tanggal lahir wajib diisi.');
      const genderError = validateRequiredText(formData.gender, 'Jenis kelamin wajib diisi.');
      const addressError = validateRequiredText(formData.fullAddress, 'Alamat lengkap wajib diisi.');
      const rtRwError = validateRequiredText(formData.rtRw, 'RT/RW wajib diisi.');
      const villageError = validateRequiredText(formData.village, 'Kelurahan/desa wajib diisi.');
      const districtError = validateRequiredText(formData.district, 'Kecamatan wajib diisi.');
      const religionError = validateRequiredText(formData.religion, 'Agama wajib diisi.');
      const maritalStatusError = validateRequiredText(formData.maritalStatus, 'Status perkawinan wajib diisi.');
      const occupationError = validateRequiredText(formData.occupation, 'Pekerjaan wajib diisi.');
      const nationalityError = validateRequiredText(formData.nationality, 'Kewarganegaraan wajib diisi.');

      if (fullNameError) stepErrors.fullName = fullNameError;
      if (phoneError) stepErrors.whatsappNumber = phoneError;
      if (emailError) stepErrors.emailAddress = emailError;
      if (nikError) stepErrors.nik = nikError;
      if (birthPlaceError) stepErrors.birthPlace = birthPlaceError;
      if (birthDateError) stepErrors.birthDate = birthDateError;
      if (genderError) stepErrors.gender = genderError;
      if (addressError) stepErrors.fullAddress = addressError;
      if (rtRwError) stepErrors.rtRw = rtRwError;
      if (villageError) stepErrors.village = villageError;
      if (districtError) stepErrors.district = districtError;
      if (religionError) stepErrors.religion = religionError;
      if (maritalStatusError) stepErrors.maritalStatus = maritalStatusError;
      if (occupationError) stepErrors.occupation = occupationError;
      if (nationalityError) stepErrors.nationality = nationalityError;
    } else if (step === 2) {
      const selectedServicesError = validateSelected(formData.selectedServices, 'Silakan pilih minimal 1 layanan harian.');
      const priceError = validatePositiveNumber(formData.pricePerHour, 'Harga per jam harus lebih dari 0.');
      if (selectedServicesError) stepErrors.selectedServices = selectedServicesError;
      if (priceError) stepErrors.pricePerHour = priceError;
    } else if (step === 3) {
      const selectedSchedulesError = validateSelected(formData.selectedSchedules, 'Silakan pilih jadwal hari ketersediaan.');
      const selectedCoverageError = validateSelected(formData.selectedCoverageAreas, 'Silakan pilih area jangkauan tugas.');
      if (selectedSchedulesError) stepErrors.selectedSchedules = selectedSchedulesError;
      if (selectedCoverageError) stepErrors.selectedCoverageAreas = selectedCoverageError;
    } else if (step === 4) {
      const profilePhotoError = validateMvpImageUpload(formData.profilePhoto, 'Foto profil');
      const ktpPhotoError = validateMvpUpload(formData.ktpPhoto, 'KTP');
      const skckPhotoError = validateMvpUpload(formData.skckPhoto, 'SKCK');
      if (profilePhotoError) stepErrors.profilePhoto = profilePhotoError;
      if (ktpPhotoError) stepErrors.ktpPhoto = ktpPhotoError;
      if (skckPhotoError) stepErrors.skckPhoto = skckPhotoError;
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo(0, 0);
  };

  const handleFormSubmit = async (event: React.FormEvent | React.MouseEvent) => {
    event.preventDefault();
    if (!formData.agreeTerms) {
      setErrors({ agreeTerms: 'Anda harus menyetujui syarat dan ketentuan kemitraan.' });
      return;
    }

    setIsSubmitting(true);
    const result = await registerMvpTalent({
      id: formData.id || createMvpEntityId(),
      fullName: formData.fullName,
      email: formData.emailAddress,
      phone: formData.whatsappNumber,
      nik: formData.nik,
      birthPlace: formData.birthPlace,
      birthDate: formData.birthDate,
      gender: formData.gender,
      address: formData.fullAddress,
      rtRw: formData.rtRw,
      village: formData.village,
      district: formData.district,
      city: formData.selectedCity,
      religion: formData.religion,
      maritalStatus: formData.maritalStatus,
      occupation: formData.occupation,
      nationality: formData.nationality,
      category: formData.selectedServices[0] || 'temenin',
      bio: formData.bioText,
      hobby: formData.experienceText,
      pricePerHour: formData.pricePerHour,
      profilePhoto: formData.profilePhoto,
      ktpPhoto: formData.ktpPhoto,
      skckPhoto: formData.skckPhoto,
    });

    setIsSubmitting(false);
    if ('error' in result) {
      setErrors({ submit: result.error });
      return;
    }

    setFormSubmitted(true);
    onSuccess?.();
    window.scrollTo(0, 0);
  };

  const stepsHeader = [
    { num: 1, title: 'Data Diri' },
    { num: 2, title: 'Layanan' },
    { num: 3, title: 'Jadwal & Area' },
    { num: 4, title: 'Verifikasi KTP' },
    { num: 5, title: 'Review' },
  ];

  if (formSubmitted) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-xl md:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-[#18A957] shadow-inner">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-2xl font-black text-[#082B5C]">Pendaftaran Berhasil Dikirim!</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-[#172033]/70">
          Terima kasih, <strong>{formData.fullName}</strong>. Data pendaftaran Anda sebagai Talent Suruhin telah terarsip dengan aman di sistem kualifikasi kami.
        </p>
        <div className="space-y-3 rounded-2xl border border-gray-100 bg-[#F5F7FA] p-5 text-left">
          <h4 className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#082B5C]">
            <ShieldCheck size={14} className="text-[#FF6500]" /> Tahap Seleksi Berikutnya:
          </h4>
          <ol className="list-decimal space-y-2 pl-4 text-xs text-gray-600">
            <li><strong>Verifikasi Dokumen:</strong> Tim operasional kami akan memeriksa keaslian KTP dan data keahlian Anda (1-2 hari kerja).</li>
            <li><strong>Wawancara Singkat:</strong> Anda akan dihubungi melalui WhatsApp <strong>{formData.whatsappNumber}</strong> untuk jadwal interview tatap muka di Kantor Suruhin Tasikmalaya.</li>
            <li><strong>Pelatihan Etika:</strong> Mengikuti pembekalan tata krama kesopanan, kesabaran, dan petunjuk sistem operasional.</li>
            <li><strong>Aktif Bekerja:</strong> Akun Anda diaktifkan dan siap menerima pesanan serta mulai menghasilkan rupiah harian.</li>
          </ol>
        </div>
        <p className="text-[10px] text-gray-400">Butuh bantuan? Hubungi Tim Rekrutmen Suruhin via WhatsApp di +62 852-2300-0111.</p>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-xl md:p-10">
      <div className="mb-10 shrink-0">
        <div className="relative mb-5 flex items-center justify-between">
          <div className="absolute left-0 right-0 top-1/2 -z-10 h-1 -translate-y-1/2 bg-slate-100" />
          {stepsHeader.map((step) => (
            <div key={step.num} className="flex flex-col items-center">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-black transition-all ${currentStep >= step.num ? 'bg-[#FF6500] text-white ring-4 ring-orange-100 shadow-md' : 'border border-slate-100 bg-white text-gray-400'}`}>
                {currentStep > step.num ? <Check size={14} /> : step.num}
              </div>
              <span className={`mt-2.5 hidden text-[10px] font-bold uppercase tracking-wider sm:block ${currentStep >= step.num ? 'text-[#FF6500]' : 'text-gray-400'}`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-left">
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="flex items-center gap-2 text-lg font-black text-[#082B5C]">
              <UserCheck size={18} className="text-[#FF6500]" /> Data Diri Calon Talent
            </h3>
            <p className="-mt-2 text-xs text-gray-400">Upload KTP di langkah verifikasi untuk mengisi otomatis field di bawah, lalu koreksi bila ada yang kurang tepat.</p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">Nama Lengkap</label>
                <input value={formData.fullName} onChange={(event) => handleFieldChange('fullName', event.target.value)} className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500]" placeholder="Contoh: Rizky Pratama" />
                {errors.fullName && <p className="mt-1 text-[10px] font-bold text-red-500">{errors.fullName}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">Nomor WhatsApp</label>
                <input value={formData.whatsappNumber} onChange={(event) => handleFieldChange('whatsappNumber', event.target.value)} className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500]" placeholder="085223xxxxxx" />
                {errors.whatsappNumber && <p className="mt-1 text-[10px] font-bold text-red-500">{errors.whatsappNumber}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">Email</label>
                <input type="email" value={formData.emailAddress} onChange={(event) => handleFieldChange('emailAddress', event.target.value)} className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500]" placeholder="rizky@email.com" />
                {errors.emailAddress && <p className="mt-1 text-[10px] font-bold text-red-500">{errors.emailAddress}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">NIK</label>
                <input value={formData.nik} onChange={(event) => handleFieldChange('nik', event.target.value)} className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500]" placeholder="16 digit NIK" />
                {errors.nik && <p className="mt-1 text-[10px] font-bold text-red-500">{errors.nik}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">Tempat Lahir</label>
                <input value={formData.birthPlace} onChange={(event) => handleFieldChange('birthPlace', event.target.value)} className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500]" placeholder="Tasikmalaya" />
                {errors.birthPlace && <p className="mt-1 text-[10px] font-bold text-red-500">{errors.birthPlace}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">Tanggal Lahir</label>
                <input type="date" value={formData.birthDate} onChange={(event) => handleFieldChange('birthDate', event.target.value)} className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500]" />
                {errors.birthDate && <p className="mt-1 text-[10px] font-bold text-red-500">{errors.birthDate}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">Jenis Kelamin</label>
                <input value={formData.gender} onChange={(event) => handleFieldChange('gender', event.target.value.toUpperCase())} className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm uppercase outline-none focus:border-[#FF6500]" placeholder="LAKI-LAKI / PEREMPUAN" />
                {errors.gender && <p className="mt-1 text-[10px] font-bold text-red-500">{errors.gender}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">Kota Layanan</label>
                <select value={formData.selectedCity} onChange={(event) => handleFieldChange('selectedCity', event.target.value)} className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none">
                  {locations.map((location) => (
                    <option key={location.id} value={location.name}>{location.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">Alamat Lengkap</label>
              <textarea rows={3} value={formData.fullAddress} onChange={(event) => handleFieldChange('fullAddress', event.target.value)} className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500]" placeholder="Tuliskan jalan, nomor, RT/RW, kelurahan, kecamatan" />
              {errors.fullAddress && <p className="mt-1 text-[10px] font-bold text-red-500">{errors.fullAddress}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ['rtRw', 'RT/RW', '001/002'],
                ['village', 'Kelurahan/Desa', 'Kelurahan'],
                ['district', 'Kecamatan', 'Kecamatan'],
                ['religion', 'Agama', 'Islam'],
                ['maritalStatus', 'Status Perkawinan', 'Belum Kawin'],
                ['occupation', 'Pekerjaan', 'Mahasiswa'],
              ].map(([field, label, placeholder]) => (
                <div key={field}>
                  <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">{label}</label>
                  <input value={String(formData[field as keyof typeof formData] || '')} onChange={(event) => handleFieldChange(field, event.target.value)} className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500]" placeholder={placeholder} />
                  {errors[field] && <p className="mt-1 text-[10px] font-bold text-red-500">{errors[field]}</p>}
                </div>
              ))}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">Kewarganegaraan</label>
              <input value={formData.nationality} onChange={(event) => handleFieldChange('nationality', event.target.value.toUpperCase())} className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm uppercase outline-none focus:border-[#FF6500]" placeholder="WNI" />
              {errors.nationality && <p className="mt-1 text-[10px] font-bold text-red-500">{errors.nationality}</p>}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="flex items-center gap-2 text-lg font-black text-[#082B5C]">
              <CheckCircle2 size={18} className="text-[#FF6500]" /> Pilih Bidang Bantuan Jasa
            </h3>
            <p className="-mt-2 text-xs text-gray-400">Pilih bidang bantuan harian yang ingin Anda tawarkan. Anda bisa memilih lebih dari satu.</p>

            {errors.selectedServices && <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-bold text-[#E5484D]"><AlertCircle size={14} /><span>{errors.selectedServices}</span></div>}
            {errors.pricePerHour && <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-bold text-[#E5484D]"><AlertCircle size={14} /><span>{errors.pricePerHour}</span></div>}

            <div className="grid max-h-[350px] grid-cols-1 gap-3 overflow-y-auto pr-2 sm:grid-cols-2">
              {services.map((service) => {
                const isChecked = formData.selectedServices.includes(service.slug);
                return (
                  <div key={service.id} onClick={() => handleServiceToggle(service.slug)} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all select-none ${isChecked ? 'border-[#FF6500]/30 bg-orange-50/50 shadow-xs' : 'border-slate-100 bg-white hover:bg-slate-50'}`}>
                    <input type="checkbox" checked={isChecked} readOnly className="mt-1 rounded accent-[#FF6500]" />
                    <div>
                      <h4 className="text-xs font-black text-[#082B5C]">{service.title}</h4>
                      <p className="mt-0.5 line-clamp-2 text-[10px] text-gray-400">{service.shortDescription}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">Harga Jasa per Jam</label>
              <input type="number" min={10000} step={5000} value={formData.pricePerHour} onChange={(event) => handleFieldChange('pricePerHour', Number(event.target.value))} className="w-full rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm outline-none focus:border-[#FF6500]" placeholder="Contoh: 50000" />
              <p className="mt-1.5 text-[10px] text-gray-400">Tarif ini dipakai sebagai estimasi awal di dashboard order.</p>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="flex items-center gap-2 text-lg font-black text-[#082B5C]">
              <ShieldCheck size={18} className="text-[#FF6500]" /> Jadwal & Wilayah Tugas
            </h3>
            <p className="-mt-2 text-xs text-gray-400">Tentukan hari ketersediaan membantu serta area jangkauan tugas operasional Anda.</p>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-gray-500">Hari Ketersediaan Kerja</label>
                <div className="flex flex-wrap gap-2">
                  {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((day) => {
                    const isChecked = formData.selectedSchedules.includes(day);
                    return (
                      <button key={day} type="button" onClick={() => handleScheduleToggle(day)} className={`rounded-xl border px-4 py-2 text-xs font-bold transition-all ${isChecked ? 'border-[#082B5C] bg-[#082B5C] text-white shadow-md' : 'border-gray-100 bg-[#F5F7FA] text-[#082B5C] hover:bg-gray-100'}`}>
                        {day}
                      </button>
                    );
                  })}
                </div>
                {errors.selectedSchedules && <p className="mt-1 text-[10px] font-bold text-red-500">{errors.selectedSchedules}</p>}
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-gray-500">Area Jangkauan Tugas Jasa</label>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {locations.map((location) => {
                    const isChecked = formData.selectedCoverageAreas.includes(location.name);
                    return (
                      <div key={location.id} onClick={() => handleAreaToggle(location.name)} className={`cursor-pointer rounded-xl border p-3 text-center text-xs font-bold transition-all ${isChecked ? 'border-[#FF6500]/30 bg-orange-50 text-[#FF6500]' : 'border-slate-100 bg-white text-gray-600 hover:bg-slate-50'}`}>
                        {location.name}
                      </div>
                    );
                  })}
                </div>
                {errors.selectedCoverageAreas && <p className="mt-1 text-[10px] font-bold text-red-500">{errors.selectedCoverageAreas}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">Deskripsi Bio Singkat</label>
                  <textarea rows={2} value={formData.bioText} onChange={(event) => handleFieldChange('bioText', event.target.value)} placeholder="Contoh: Saya mahasiswa aktif, memiliki kegemaran olahraga lari pagi..." className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">Pengalaman / Keahlian Utama</label>
                  <textarea rows={2} value={formData.experienceText} onChange={(event) => handleFieldChange('experienceText', event.target.value)} placeholder="Contoh: Berpengalaman berkendara roda dua, pandai merakit PC..." className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="flex items-center gap-2 text-lg font-black text-[#082B5C]">
              <Upload size={18} className="text-[#FF6500]" /> Unggah Dokumen Verifikasi Kemitraan
            </h3>
            <p className="-mt-2 text-xs text-gray-400">KTP akan diupload ke bucket private lalu dibaca otomatis. Semua field hasil OCR tetap bisa diedit manual di langkah sebelumnya.</p>

            {(isReadingKtp || ocrNotice || ocrError) && (
              <div className={`rounded-2xl border p-4 text-xs font-bold ${ocrError ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-blue-100 bg-blue-50 text-[#082B5C]'}`}>
                <div className="flex items-center gap-2">
                  {isReadingKtp ? <LoaderCircle size={14} className="animate-spin" /> : ocrError ? <AlertCircle size={14} /> : <CheckCircle2 size={14} className="text-[#18A957]" />}
                  <span>{isReadingKtp ? 'Membaca data KTP...' : ocrError || ocrNotice}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <label className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-slate-50/50 p-5 text-center transition-all hover:border-[#FF6500]/40">
                <input type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" className="hidden" onChange={(event) => { handleFileChange('profilePhoto', event.target.files?.[0] || null); event.target.value = ''; }} />
                <Upload size={20} className="mb-2 text-gray-400" />
                <h4 className="mb-1 text-xs font-bold text-[#082B5C]">Foto Profil Setengah Badan</h4>
                <p className="mb-3 text-[10px] leading-relaxed text-gray-400">Rapi, wajah menghadap lurus (Maks. 5MB)</p>
                {formData.profilePhoto ? (
                  <div className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[9px] font-extrabold text-emerald-600">{formData.profilePhoto.name}</div>
                ) : (
                  <div className="rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[9px] font-bold text-amber-500">Pilih File Foto</div>
                )}
                {errors.profilePhoto && <p className="mt-2 text-[10px] font-bold text-red-500">{errors.profilePhoto}</p>}
              </label>

              <label className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-slate-50/50 p-5 text-center transition-all hover:border-[#FF6500]/40">
                <input type="file" accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf" className="hidden" onChange={(event) => { void handleKtpChange(event.target.files?.[0] || null); event.target.value = ''; }} />
                <Upload size={20} className="mb-2 text-gray-400" />
                <h4 className="mb-1 text-xs font-bold text-[#082B5C]">Unggah KTP Asli</h4>
                <p className="mb-3 text-[10px] leading-relaxed text-gray-400">Setelah upload, OCR otomatis membaca data KTP</p>
                {formData.ktpPhoto ? (
                  <div className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[9px] font-extrabold text-emerald-600">{formData.ktpPhoto.name}</div>
                ) : (
                  <div className="rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[9px] font-bold text-amber-500">Pilih File KTP</div>
                )}
                {errors.ktpPhoto && <p className="mt-2 text-[10px] font-bold text-red-500">{errors.ktpPhoto}</p>}
                {ktpPreviewUrl && <img src={ktpPreviewUrl} alt="Preview KTP" className="mt-4 h-32 w-full rounded-xl border border-slate-200 object-cover" />}
              </label>

              <label className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-slate-50/50 p-5 text-center transition-all hover:border-[#FF6500]/40">
                <input type="file" accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf" className="hidden" onChange={(event) => { handleFileChange('skckPhoto', event.target.files?.[0] || null); event.target.value = ''; }} />
                <Upload size={20} className="mb-2 text-gray-400" />
                <h4 className="mb-1 text-xs font-bold text-[#082B5C]">Unggah SKCK Terkini</h4>
                <p className="mb-3 text-[10px] leading-relaxed text-gray-400">Surat Kelakuan Baik Kepolisian (Maks. 5MB)</p>
                {formData.skckPhoto ? (
                  <div className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[9px] font-extrabold text-emerald-600">{formData.skckPhoto.name}</div>
                ) : (
                  <div className="rounded-full border border-orange-100 bg-orange-50 px-2.5 py-1 text-[9px] font-bold text-[#FF6500]">Sangat Direkomendasikan</div>
                )}
                {errors.skckPhoto && <p className="mt-2 text-[10px] font-bold text-red-500">{errors.skckPhoto}</p>}
              </label>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <h3 className="flex items-center gap-2 text-lg font-black text-[#082B5C]">
              <FileCheck size={18} className="text-[#FF6500]" /> Tinjau Data Pendaftaran Anda
            </h3>
            <p className="-mt-2 text-xs text-gray-400">Pastikan semua data pendaftaran kemitraan Anda sudah benar sebelum dikirimkan.</p>

            <div className="max-h-[280px] space-y-3 overflow-y-auto rounded-2xl border border-gray-100 bg-slate-50 p-5 text-xs">
              {[
                ['Nama Lengkap', formData.fullName],
                ['No. WhatsApp', formData.whatsappNumber],
                ['Email', formData.emailAddress],
                ['NIK', formData.nik],
                ['TTL', `${formData.birthPlace}${formData.birthDate ? `, ${formData.birthDate}` : ''}`],
                ['Jenis Kelamin', formData.gender],
                ['Kota Domisili', formData.selectedCity],
                ['RT/RW', formData.rtRw],
                ['Kelurahan/Desa', formData.village],
                ['Kecamatan', formData.district],
                ['Agama', formData.religion],
                ['Status Perkawinan', formData.maritalStatus],
                ['Pekerjaan', formData.occupation],
                ['Kewarganegaraan', formData.nationality],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 border-b border-gray-200/50 py-1.5 last:border-b-0">
                  <span className="font-semibold text-gray-400">{label}</span>
                  <span className="text-right font-extrabold text-[#082B5C]">{value || '-'}</span>
                </div>
              ))}
              <div className="flex flex-col gap-1 border-b border-gray-200/50 py-1.5">
                <span className="font-semibold text-gray-400">Alamat</span>
                <span className="font-bold text-[#082B5C]">{formData.fullAddress || '-'}</span>
              </div>
              <div className="flex flex-col gap-1 border-b border-gray-200/50 py-1.5">
                <span className="font-semibold text-gray-400">Layanan Dipilih ({formData.selectedServices.length})</span>
                <span className="font-bold text-[#082B5C]">{formData.selectedServices.join(', ') || '-'}</span>
              </div>
              <div className="flex flex-col gap-1 py-1.5">
                <span className="font-semibold text-gray-400">Hari Aktif Kerja ({formData.selectedSchedules.length})</span>
                <span className="font-bold text-[#082B5C]">{formData.selectedSchedules.join(', ') || '-'}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-2xl border border-orange-100 bg-orange-50/40 p-4">
              <input type="checkbox" required id="agreeTerms" checked={formData.agreeTerms} onChange={(event) => handleFieldChange('agreeTerms', event.target.checked)} className="mt-1 cursor-pointer accent-[#FF6500]" />
              <label htmlFor="agreeTerms" className="cursor-pointer select-none text-[11px] leading-relaxed text-[#172033]/80">
                Saya menyatakan bahwa seluruh informasi di atas adalah benar. Saya bersedia menjaga sopan santun, mematuhi hukum, dan dilarang keras menawarkan atau melakukan segala tindak asusila, kencan romantis, seksual terlarang, atau transaksi ilegal. Melanggar hal ini bersedia dituntut pidana.
              </label>
            </div>
            {errors.agreeTerms && <p className="text-[10px] font-bold text-red-500">{errors.agreeTerms}</p>}
            {errors.submit && <p className="text-[10px] font-bold text-red-500">{errors.submit}</p>}
          </form>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6 shrink-0">
        <button onClick={handlePrev} disabled={currentStep === 1 || isSubmitting} className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-bold text-[#082B5C] hover:text-[#FF6500] disabled:opacity-30">
          <ArrowLeft size={16} />
          <span>Kembali</span>
        </button>

        {currentStep < 5 ? (
          <Button onClick={handleNext} variant="primary" size="sm" className="font-bold">
            <span>Lanjut</span>
            <ArrowRight size={14} className="ml-1.5" />
          </Button>
        ) : (
          <Button onClick={handleFormSubmit} variant="success" loading={isSubmitting} size="sm" className="font-bold">
            <span>Daftar Talent</span>
          </Button>
        )}
      </div>
    </div>
  );
}
