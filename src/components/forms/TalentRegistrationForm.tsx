import React, { useState } from 'react';
import { Check, ArrowRight, ArrowLeft, Upload, FileCheck, CheckCircle2, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { services } from '../../data/services';
import { locations } from '../../data/locations';
import { Button } from '../shared/Button';

export function TalentRegistrationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form Fields State
  const [formData, setFormData] = useState({
    fullName: '',
    whatsappNumber: '',
    emailAddress: '',
    gender: 'Pria',
    birthDate: '',
    fullAddress: '',
    selectedCity: 'Kota Tasikmalaya',
    selectedServices: [] as string[],
    selectedSchedules: [] as string[],
    selectedCoverageAreas: [] as string[],
    experienceText: '',
    bioText: '',
    profilePhoto: null as File | null,
    ktpPhoto: null as File | null,
    skckPhoto: null as File | null,
    agreeTerms: false
  });

  // Checkbox/Radio Handlers
  const handleServiceToggle = (slug: string) => {
    const updated = formData.selectedServices.includes(slug)
      ? formData.selectedServices.filter(s => s !== slug)
      : [...formData.selectedServices, slug];
    setFormData({ ...formData, selectedServices: updated });
  };

  const handleScheduleToggle = (day: string) => {
    const updated = formData.selectedSchedules.includes(day)
      ? formData.selectedSchedules.filter(d => d !== day)
      : [...formData.selectedSchedules, day];
    setFormData({ ...formData, selectedSchedules: updated });
  };

  const handleAreaToggle = (area: string) => {
    const updated = formData.selectedCoverageAreas.includes(area)
      ? formData.selectedCoverageAreas.filter(a => a !== area)
      : [...formData.selectedCoverageAreas, area];
    setFormData({ ...formData, selectedCoverageAreas: updated });
  };

  const validateStep = (step: number): boolean => {
    const stepErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName.trim()) stepErrors.fullName = 'Nama lengkap wajib diisi.';
      if (!formData.whatsappNumber.trim() || formData.whatsappNumber.length < 9) stepErrors.whatsappNumber = 'Nomor WhatsApp tidak valid.';
      if (!formData.emailAddress.includes('@')) stepErrors.emailAddress = 'Alamat email tidak valid.';
      if (!formData.birthDate) stepErrors.birthDate = 'Tanggal lahir wajib diisi.';
      if (!formData.fullAddress.trim()) stepErrors.fullAddress = 'Alamat lengkap wajib diisi.';
    } else if (step === 2) {
      if (formData.selectedServices.length === 0) stepErrors.selectedServices = 'Silakan pilih minimal 1 layanan harian.';
    } else if (step === 3) {
      if (formData.selectedSchedules.length === 0) stepErrors.selectedSchedules = 'Silakan pilih jadwal hari ketersediaan.';
      if (formData.selectedCoverageAreas.length === 0) stepErrors.selectedCoverageAreas = 'Silakan pilih area jangkauan tugas.';
    } else if (step === 4) {
      // For testing, mock upload allows skip but warns
      // In production we validate file presence
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreeTerms) {
      setErrors({ agreeTerms: 'Anda harus menyetujui syarat dan ketentuan kemitraan.' });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setFormSubmitted(true);
      setIsSubmitting(false);
      window.scrollTo(0, 0);
    }, 1500);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const stepsHeader = [
    { num: 1, title: 'Data Diri' },
    { num: 2, title: 'Layanan' },
    { num: 3, title: 'Jadwal & Area' },
    { num: 4, title: 'Verifikasi KTP' },
    { num: 5, title: 'Review' },
  ];

  if (formSubmitted) {
    return (
      <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-100 shadow-xl max-w-2xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#18A957] flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 size={32} />
        </div>
        
        <h3 className="text-2xl font-black text-[#082B5C]">Pendaftaran Berhasil Dikirim!</h3>
        
        <p className="text-sm text-[#172033]/70 leading-relaxed max-w-md mx-auto">
          Terima kasih, <strong>{formData.fullName}</strong>. Data pendaftaran Anda sebagai Talent Suruhin telah terarsip dengan aman di sistem kualifikasi kami.
        </p>

        <div className="bg-[#F5F7FA] p-5 rounded-2xl border border-gray-100 text-left space-y-3">
          <h4 className="text-xs font-bold text-[#082B5C] uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck size={14} className="text-[#FF6500]" /> Tahap Seleksi Berikutnya:
          </h4>
          <ol className="list-decimal pl-4 space-y-2 text-xs text-gray-600">
            <li><strong>Verifikasi Dokumen:</strong> Tim operasional kami akan memeriksa keaslian KTP dan data keahlian Anda (1-2 hari kerja).</li>
            <li><strong>Wawancara Singkat:</strong> Anda akan dihubungi melalui WhatsApp <strong>{formData.whatsappNumber}</strong> untuk jadwal interview tatap muka di Kantor Suruhin Tasikmalaya.</li>
            <li><strong>Pelatihan Etika:</strong> Mengikuti pembekalan tata krama kesopanan, kesabaran, dan petunjuk sistem operasional.</li>
            <li><strong>Aktif Bekerja:</strong> Akun Anda diaktifkan dan siap menerima pesanan serta mulai menghasilkan rupiah harian!</li>
          </ol>
        </div>

        <p className="text-[10px] text-gray-400">
          Butuh bantuan? Hubungi Tim Rekrutmen Suruhin via WhatsApp di +62 852-2300-0111.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-xl p-6 md:p-10 relative overflow-hidden">
      {/* Step Progress Header */}
      <div className="mb-10 shrink-0">
        <div className="flex items-center justify-between relative mb-5">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 -z-10" />
          {stepsHeader.map((step) => (
            <div key={step.num} className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  currentStep >= step.num
                    ? 'bg-[#FF6500] text-white ring-4 ring-orange-100 shadow-md'
                    : 'bg-white text-gray-400 border border-slate-100'
                }`}
              >
                {currentStep > step.num ? <Check size={14} /> : step.num}
              </div>
              <span className={`text-[10px] font-bold mt-2.5 uppercase tracking-wider hidden sm:block ${
                currentStep >= step.num ? 'text-[#FF6500]' : 'text-gray-400'
              }`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Form Fields */}
      <div className="text-left">
        {/* STEP 1: Data Diri */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-black text-[#082B5C] flex items-center gap-2">
              <Sparkles size={18} className="text-[#FF6500]" /> Data Diri Calon Talent
            </h3>
            <p className="text-xs text-gray-400 -mt-2">Silakan lengkapi formulir pendaftaran kemitraan dengan jujur.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Nama Lengkap (Sesuai KTP)</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Contoh: Rizky Pratama"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6500]/15 focus:border-[#FF6500]"
                />
                {errors.fullName && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Nomor WhatsApp Aktif</label>
                <input
                  type="tel"
                  required
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  placeholder="Contoh: 085223xxxxxx"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6500]/15 focus:border-[#FF6500]"
                />
                {errors.whatsappNumber && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.whatsappNumber}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Alamat Email</label>
                <input
                  type="email"
                  required
                  value={formData.emailAddress}
                  onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                  placeholder="Contoh: rizky@email.com"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6500]/15 focus:border-[#FF6500]"
                />
                {errors.emailAddress && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.emailAddress}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Tanggal Lahir</label>
                <input
                  type="date"
                  required
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6500]/15 focus:border-[#FF6500]"
                />
                {errors.birthDate && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.birthDate}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Jenis Kelamin</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Pria', 'Wanita'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: g })}
                      className={`py-3 text-xs font-bold rounded-xl border transition-all text-center cursor-pointer ${
                        formData.gender === g
                          ? 'bg-[#082B5C] border-[#082B5C] text-white shadow-md'
                          : 'bg-[#F5F7FA] border-gray-100 text-[#082B5C] hover:bg-gray-100'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Pilih Kota Layanan</label>
                <select
                  value={formData.selectedCity}
                  onChange={(e) => setFormData({ ...formData, selectedCity: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none"
                >
                  <option value="Kota Tasikmalaya">Kota Tasikmalaya</option>
                  <option value="Kabupaten Tasikmalaya">Kabupaten Tasikmalaya</option>
                  <option value="Ciamis">Ciamis</option>
                  <option value="Banjar">Banjar</option>
                  <option value="Garut">Garut</option>
                  <option value="Bandung">Bandung</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Alamat Tempat Tinggal Lengkap (Sesuai KTP)</label>
              <textarea
                required
                rows={2}
                value={formData.fullAddress}
                onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                placeholder="Tuliskan jalan, nomor, RT/RW, kelurahan, kecamatan"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6500]/15"
              />
              {errors.fullAddress && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.fullAddress}</p>}
            </div>
          </div>
        )}

        {/* STEP 2: Pilih Layanan */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-black text-[#082B5C] flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#FF6500]" /> Pilih Bidang Bantuan Jasa
            </h3>
            <p className="text-xs text-gray-400 -mt-2">Pilih bidang bantuan harian yang ingin Anda tawarkan. Anda bisa memilih lebih dari satu.</p>

            {errors.selectedServices && (
              <div className="p-3 bg-red-50 text-[#E5484D] text-xs font-bold rounded-xl flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{errors.selectedServices}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-2">
              {services.map((srv) => {
                const isChecked = formData.selectedServices.includes(srv.slug);
                return (
                  <div
                    key={srv.id}
                    onClick={() => handleServiceToggle(srv.slug)}
                    className={`p-4 border rounded-2xl cursor-pointer transition-all flex items-start gap-3 select-none ${
                      isChecked
                        ? 'bg-orange-50/50 border-[#FF6500]/30 shadow-xs'
                        : 'bg-white border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      readOnly
                      className="mt-1 accent-[#FF6500] cursor-pointer rounded"
                    />
                    <div>
                      <h4 className="text-xs font-black text-[#082B5C]">{srv.title}</h4>
                      <p className="text-[10px] text-gray-400 line-clamp-2 mt-0.5">{srv.shortDescription}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Jadwal & Area */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-black text-[#082B5C] flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#FF6500]" /> Jadwal & Wilayah Tugas
            </h3>
            <p className="text-xs text-gray-400 -mt-2">Tentukan hari ketersediaan membantu serta area jangkauan tugas operasional Anda.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Hari Ketersediaan Kerja</label>
                <div className="flex flex-wrap gap-2">
                  {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((day) => {
                    const isChecked = formData.selectedSchedules.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleScheduleToggle(day)}
                        className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-[#082B5C] border-[#082B5C] text-white shadow-md'
                            : 'bg-[#F5F7FA] border-gray-100 text-[#082B5C] hover:bg-gray-100'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
                {errors.selectedSchedules && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.selectedSchedules}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Area Jangkauan Tugas Jasa</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {locations.map((loc) => {
                    const isChecked = formData.selectedCoverageAreas.includes(loc.name);
                    return (
                      <div
                        key={loc.id}
                        onClick={() => handleAreaToggle(loc.name)}
                        className={`p-3 border rounded-xl cursor-pointer transition-all text-center text-xs font-bold ${
                          isChecked
                            ? 'bg-orange-50 border-[#FF6500]/30 text-[#FF6500]'
                            : 'bg-white border-slate-100 hover:bg-slate-50 text-gray-600'
                        }`}
                      >
                        {loc.name}
                      </div>
                    );
                  })}
                </div>
                {errors.selectedCoverageAreas && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.selectedCoverageAreas}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Tuliskan Deskripsi Bio Singkat Diri</label>
                  <textarea
                    rows={2}
                    value={formData.bioText}
                    onChange={(e) => setFormData({ ...formData, bioText: e.target.value })}
                    placeholder="Contoh: Saya mahasiswa aktif, memiliki kegemaran olahraga lari pagi..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Tuliskan Pengalaman / Keahlian Utama</label>
                  <textarea
                    rows={2}
                    value={formData.experienceText}
                    onChange={(e) => setFormData({ ...formData, experienceText: e.target.value })}
                    placeholder="Contoh: Berpengalaman berkendara roda dua, pandai merakit PC..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Verifikasi KTP & SKCK */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-black text-[#082B5C] flex items-center gap-2">
              <Upload size={18} className="text-[#FF6500]" /> Unggah Dokumen Verifikasi Kemitraan
            </h3>
            <p className="text-xs text-gray-400 -mt-2">Dokumen Anda aman terenkripsi di server kualifikasi Suruhin. Digunakan demi menjamin ketenangan & keselamatan pelanggan.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Photo Profil dropzone */}
              <label className="border-2 border-dashed border-gray-200 hover:border-[#FF6500]/40 p-5 rounded-2xl text-center bg-slate-50/50 flex flex-col items-center justify-center min-h-[160px] cursor-pointer transition-all">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setFormData({ ...formData, profilePhoto: file });
                  }}
                />
                <Upload size={20} className="text-gray-400 mb-2" />
                <h4 className="text-xs font-bold text-[#082B5C] mb-1">Foto Profil Setengah Badan</h4>
                <p className="text-[10px] text-gray-400 mb-3 leading-relaxed">Rapi, wajah menghadap lurus (Maks. 5MB)</p>
                {formData.profilePhoto ? (
                  <div className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    ✓ {formData.profilePhoto.name}
                  </div>
                ) : (
                  <div className="text-[9px] font-bold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                    Pilih File Foto
                  </div>
                )}
              </label>

              {/* KTP dropzone */}
              <label className="border-2 border-dashed border-gray-200 hover:border-[#FF6500]/40 p-5 rounded-2xl text-center bg-slate-50/50 flex flex-col items-center justify-center min-h-[160px] cursor-pointer transition-all">
                <input 
                  type="file" 
                  accept="image/*,.pdf" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setFormData({ ...formData, ktpPhoto: file });
                  }}
                />
                <Upload size={20} className="text-gray-400 mb-2" />
                <h4 className="text-xs font-bold text-[#082B5C] mb-1">Unggah KTP Asli</h4>
                <p className="text-[10px] text-gray-400 mb-3 leading-relaxed">Harus terbaca dengan sangat jelas (Maks. 5MB)</p>
                {formData.ktpPhoto ? (
                  <div className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    ✓ {formData.ktpPhoto.name}
                  </div>
                ) : (
                  <div className="text-[9px] font-bold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                    Pilih File KTP
                  </div>
                )}
              </label>

              {/* SKCK dropzone */}
              <label className="border-2 border-dashed border-gray-200 hover:border-[#FF6500]/40 p-5 rounded-2xl text-center bg-slate-50/50 flex flex-col items-center justify-center min-h-[160px] cursor-pointer transition-all">
                <input 
                  type="file" 
                  accept="image/*,.pdf" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setFormData({ ...formData, skckPhoto: file });
                  }}
                />
                <Upload size={20} className="text-gray-400 mb-2" />
                <h4 className="text-xs font-bold text-[#082B5C] mb-1">Unggah SKCK Terkini</h4>
                <p className="text-[10px] text-gray-400 mb-3 leading-relaxed">Surat Kelakuan Baik Kepolisian (Maks. 5MB)</p>
                {formData.skckPhoto ? (
                  <div className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    ✓ {formData.skckPhoto.name}
                  </div>
                ) : (
                  <div className="text-[9px] font-bold text-[#FF6500] bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
                    Sangat Direkomendasikan
                  </div>
                )}
              </label>
            </div>
          </div>
        )}

        {/* STEP 5: Review & Send */}
        {currentStep === 5 && (
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <h3 className="text-lg font-black text-[#082B5C] flex items-center gap-2">
              <FileCheck size={18} className="text-[#FF6500]" /> Tinjau Data Pendaftaran Anda
            </h3>
            <p className="text-xs text-gray-400 -mt-2">Pastikan semua data pendaftaran kemitraan Anda sudah benar sebelum dikirimkan.</p>

            <div className="p-5 bg-slate-50 rounded-2xl border border-gray-100 text-xs space-y-3 max-h-[250px] overflow-y-auto">
              <div className="flex items-center justify-between py-1.5 border-b border-gray-200/50">
                <span className="text-gray-400 font-semibold">Nama Lengkap</span>
                <span className="font-extrabold text-[#082B5C]">{formData.fullName}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-200/50">
                <span className="text-gray-400 font-semibold">No. WhatsApp</span>
                <span className="font-extrabold text-[#082B5C]">{formData.whatsappNumber}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-200/50">
                <span className="text-gray-400 font-semibold">Grup Gender / Usia</span>
                <span className="font-extrabold text-[#082B5C]">{formData.gender}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-200/50">
                <span className="text-gray-400 font-semibold">Domisili Kota</span>
                <span className="font-extrabold text-[#082B5C]">{formData.selectedCity}</span>
              </div>
              <div className="py-1.5 border-b border-gray-200/50 flex flex-col gap-1 items-start">
                <span className="text-gray-400 font-semibold">Layanan Dipilih ({formData.selectedServices.length})</span>
                <span className="font-bold text-[#082B5C] text-left">
                  {formData.selectedServices.join(', ')}
                </span>
              </div>
              <div className="py-1.5 flex flex-col gap-1 items-start">
                <span className="text-gray-400 font-semibold">Hari Aktif Kerja ({formData.selectedSchedules.length})</span>
                <span className="font-bold text-[#082B5C]">
                  {formData.selectedSchedules.join(', ')}
                </span>
              </div>
            </div>

            {/* Terms of Agreement */}
            <div className="p-4 bg-orange-50/40 rounded-2xl border border-orange-100 flex items-start gap-2.5">
              <input
                type="checkbox"
                required
                id="agreeTerms"
                checked={formData.agreeTerms}
                onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                className="mt-1 accent-[#FF6500] cursor-pointer"
              />
              <label htmlFor="agreeTerms" className="text-[11px] text-[#172033]/80 leading-relaxed cursor-pointer select-none">
                Saya menyatakan bahwa seluruh informasi di atas adalah benar. Saya bersedia menjaga sopan santun, mematuhi hukum, dan dilarang keras menawarkan atau melakukan segala tindak asusila, kencan romantis, seksual terlarang, atau transaksi ilegal. Melanggar hal ini bersedia dituntut pidana.
              </label>
            </div>
            {errors.agreeTerms && <p className="text-red-500 text-[10px] font-bold">{errors.agreeTerms}</p>}
          </form>
        )}
      </div>

      {/* Wizard Footer Controls */}
      <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between shrink-0">
        <button
          onClick={handlePrev}
          disabled={currentStep === 1 || isSubmitting}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#082B5C] hover:text-[#FF6500] disabled:opacity-30 cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Kembali</span>
        </button>

        {currentStep < 5 ? (
          <Button onClick={handleNext} variant="primary" size="sm" className="font-bold">
            <span>Lanjut</span>
            <ArrowRight size={14} className="ml-1.5" />
          </Button>
        ) : (
          <Button
            onClick={handleFormSubmit}
            variant="success"
            loading={isSubmitting}
            size="sm"
            className="font-bold"
          >
            <span>Kirim Pendaftaran</span>
          </Button>
        )}
      </div>
    </div>
  );
}
