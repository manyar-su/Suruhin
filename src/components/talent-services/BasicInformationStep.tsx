import { useState, useEffect } from 'react';
import { ServiceMode, ServiceCategory, ServiceSubCategory } from '../../types';

interface BasicInformationStepProps {
  title: string;
  setTitle: (val: string) => void;
  categoryId: string;
  setCategoryId: (val: string) => void;
  subCategoryId: string;
  setSubCategoryId: (val: string) => void;
  serviceMode: ServiceMode;
  setServiceMode: (val: ServiceMode) => void;
  shortDescription: string;
  setShortDescription: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  errors: Record<string, string>;
  categoriesList: ServiceCategory[];
  subCategoriesList: ServiceSubCategory[];
}

export function BasicInformationStep({
  title,
  setTitle,
  categoryId,
  setCategoryId,
  subCategoryId,
  setSubCategoryId,
  serviceMode,
  setServiceMode,
  shortDescription,
  setShortDescription,
  description,
  setDescription,
  errors,
  categoriesList,
  subCategoriesList
}: BasicInformationStepProps) {
  // Filter subcategories based on chosen categoryId
  const filteredSubcategories = subCategoriesList.filter(
    (sub) => sub.categoryId === categoryId && sub.isActive
  );

  return (
    <div className="space-y-5 text-left">
      {/* Category Selection */}
      <div className="space-y-1.5">
        <label className="text-xs font-extrabold text-[#082B5C] uppercase tracking-wider block">
          Kategori Layanan <span className="text-red-500">*</span>
        </label>
        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setSubCategoryId(''); // Reset subcategory when category changes
          }}
          className={`w-full bg-slate-50 border rounded-2xl px-4 py-3 text-xs font-bold text-[#082B5C] focus:bg-white focus:border-[#FF6500] focus:outline-none cursor-pointer transition-all ${
            errors.categoryId ? 'border-rose-400' : 'border-slate-100'
          }`}
        >
          <option value="">-- Pilih Kategori Jasa --</option>
          {categoriesList.filter(c => c.isActive).map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="text-[10px] font-bold text-rose-500">{errors.categoryId}</p>
        )}
      </div>

      {/* Subcategory Selection */}
      <div className="space-y-1.5">
        <label className="text-xs font-extrabold text-[#082B5C] uppercase tracking-wider block">
          Subkategori Layanan <span className="text-red-500">*</span>
        </label>
        <select
          value={subCategoryId}
          onChange={(e) => setSubCategoryId(e.target.value)}
          disabled={!categoryId}
          className={`w-full bg-slate-50 border rounded-2xl px-4 py-3 text-xs font-bold text-[#082B5C] focus:bg-white focus:border-[#FF6500] focus:outline-none cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            errors.subCategoryId ? 'border-rose-400' : 'border-slate-100'
          }`}
        >
          <option value="">-- Pilih Subkategori Jasa --</option>
          {filteredSubcategories.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.name}
            </option>
          ))}
        </select>
        <p className="text-[9px] text-gray-400">
          Subkategori disesuaikan dengan kategori utama yang dipilih di atas.
        </p>
        {errors.subCategoryId && (
          <p className="text-[10px] font-bold text-rose-500">{errors.subCategoryId}</p>
        )}
      </div>

      {/* Service Mode Selection */}
      <div className="space-y-1.5">
        <label className="text-xs font-extrabold text-[#082B5C] uppercase tracking-wider block">
          Metode Layanan <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {([
            { mode: 'ONLINE', label: 'Online', desc: 'Bantuan digital / jarak jauh' },
            { mode: 'OFFLINE', label: 'Offline', desc: 'Pertemuan fisik langsung' },
            { mode: 'ONLINE_OFFLINE', label: 'Online & Offline', desc: 'Dukung kedua opsi' }
          ] as { mode: ServiceMode; label: string; desc: string }[]).map((item) => (
            <button
              key={item.mode}
              type="button"
              onClick={() => setServiceMode(item.mode)}
              className={`p-3.5 border rounded-2xl flex flex-col items-center justify-center text-center gap-1 transition-all cursor-pointer ${
                serviceMode === item.mode
                  ? 'border-[#FF6500] bg-orange-50/10 text-[#FF6500] ring-1 ring-[#FF6500]/35'
                  : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-[#082B5C]'
              }`}
            >
              <span className="text-xs font-black leading-none">{item.label}</span>
              <span className="text-[9px] text-gray-400 font-bold leading-normal">{item.desc}</span>
            </button>
          ))}
        </div>
        {errors.serviceMode && (
          <p className="text-[10px] font-bold text-rose-500">{errors.serviceMode}</p>
        )}
      </div>

      {/* Service Title */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-xs font-extrabold text-[#082B5C] uppercase tracking-wider block">
            Judul Layanan <span className="text-red-500">*</span>
          </label>
          <span className="text-[10px] text-gray-400 font-bold">{title.length}/100</span>
        </div>
        <input
          type="text"
          value={title}
          maxLength={100}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Contoh: Temenin Nonton Bioskop XXI Asia Plaza atau Teman Jogging Lapangan Dadaha"
          className={`w-full bg-slate-50 border rounded-2xl px-4 py-3 text-xs text-[#172033] focus:bg-white focus:border-[#FF6500] focus:outline-none transition-all ${
            errors.title ? 'border-rose-400' : 'border-slate-100'
          }`}
        />
        <p className="text-[9px] text-gray-400">
          Buatlah judul yang jelas, singkat, dan menerangkan jasa Anda secara spesifik. Minimal 10 karakter.
        </p>
        {errors.title && (
          <p className="text-[10px] font-bold text-rose-500">{errors.title}</p>
        )}
      </div>

      {/* Short Description */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-xs font-extrabold text-[#082B5C] uppercase tracking-wider block">
            Deskripsi Singkat <span className="text-red-500">*</span>
          </label>
          <span className="text-[10px] text-gray-400 font-bold">{shortDescription.length}/150</span>
        </div>
        <input
          type="text"
          value={shortDescription}
          maxLength={150}
          onChange={(e) => setShortDescription(e.target.value)}
          placeholder="Ringkasan 1 kalimat yang akan tampil di halaman kartu katalog."
          className={`w-full bg-slate-50 border rounded-2xl px-4 py-3 text-xs text-[#172033] focus:bg-white focus:border-[#FF6500] focus:outline-none transition-all ${
            errors.shortDescription ? 'border-rose-400' : 'border-slate-100'
          }`}
        />
        {errors.shortDescription && (
          <p className="text-[10px] font-bold text-rose-500">{errors.shortDescription}</p>
        )}
      </div>

      {/* Full Description */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-xs font-extrabold text-[#082B5C] uppercase tracking-wider block">
            Deskripsi Lengkap <span className="text-red-500">*</span>
          </label>
          <span className="text-[10px] text-gray-400 font-bold">{description.length}/2000</span>
        </div>
        <textarea
          rows={6}
          value={description}
          maxLength={2000}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Jelaskan secara detail mengenai jasa apa saja yang Anda tawarkan, bagaimana alur pertemuan, pengalaman Anda di bidang ini, dan benefit yang didapat pengguna..."
          className={`w-full bg-slate-50 border rounded-2xl px-4 py-3 text-xs text-[#172033] focus:bg-white focus:border-[#FF6500] focus:outline-none transition-all resize-none leading-relaxed ${
            errors.description ? 'border-rose-400' : 'border-slate-100'
          }`}
        />
        <p className="text-[9px] text-gray-400">
          Tulis deskripsi dengan bahasa yang sopan, rapi, dan mudah dimengerti. Minimal 100 karakter.
        </p>
        {errors.description && (
          <p className="text-[10px] font-bold text-rose-500">{errors.description}</p>
        )}
      </div>
    </div>
  );
}
