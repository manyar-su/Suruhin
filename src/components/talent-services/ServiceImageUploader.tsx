import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { Upload, X, Check, Image as ImageIcon, Star, StarOff, ArrowUp, ArrowDown } from 'lucide-react';
import { TalentServiceImage } from '../../types';

interface ServiceImageUploaderProps {
  images: TalentServiceImage[];
  onChange: (images: TalentServiceImage[]) => void;
}

const PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=400', // Hiking
  'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=400', // Badminton
  'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=400', // Foto
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400', // Cinema
  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400', // Ramen/Food
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400', // Smartphone/Social
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=400', // Meeting/Coffee
  'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=400'  // Party/Event
];

export function ServiceImageUploader({ images, onChange }: ServiceImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError('');

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    setError('');
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList: FileList) => {
    if (images.length >= 5) {
      setError('Maksimal hanya 5 foto per layanan.');
      return;
    }

    const validFiles: File[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      // Type validation
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Format berkas harus JPG, PNG, atau WEBP.');
        return;
      }
      // Size validation (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran foto maksimal adalah 5MB.');
        return;
      }
      validFiles.push(file);
    }

    // Convert to mock URLs for local simulation
    const newImages: TalentServiceImage[] = validFiles.map((file, idx) => {
      const url = URL.createObjectURL(file);
      const isPrimary = images.length === 0 && idx === 0;
      return {
        id: `img-${Date.now()}-${idx}`,
        talentServiceId: '',
        url,
        altText: file.name.split('.')[0],
        sortOrder: images.length + idx + 1,
        isPrimary
      };
    });

    const updated = [...images, ...newImages].slice(0, 5);
    onChange(updated);
  };

  const handleSelectPreset = (url: string) => {
    setError('');
    if (images.length >= 5) {
      setError('Maksimal hanya 5 foto per layanan.');
      return;
    }

    const isPrimary = images.length === 0;
    const newImg: TalentServiceImage = {
      id: `img-preset-${Date.now()}`,
      talentServiceId: '',
      url,
      altText: 'Foto Layanan',
      sortOrder: images.length + 1,
      isPrimary
    };

    onChange([...images, newImg]);
    setShowPresets(false);
  };

  const handleRemove = (id: string) => {
    const filtered = images.filter(img => img.id !== id);
    // If we deleted the primary, make the first remaining one primary
    if (images.find(img => img.id === id)?.isPrimary && filtered.length > 0) {
      filtered[0].isPrimary = true;
    }
    // Re-adjust sort orders
    const readjusted = filtered.map((img, idx) => ({
      ...img,
      sortOrder: idx + 1
    }));
    onChange(readjusted);
  };

  const handleSetPrimary = (id: string) => {
    const updated = images.map(img => ({
      ...img,
      isPrimary: img.id === id
    }));
    onChange(updated);
  };

  const handleUpdateCaption = (id: string, text: string) => {
    const updated = images.map(img => {
      if (img.id === id) {
        return { ...img, altText: text };
      }
      return img;
    });
    onChange(updated);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === images.length - 1) return;

    const updated = [...images];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Readjust sort orders
    const readjusted = updated.map((img, idx) => ({
      ...img,
      sortOrder: idx + 1
    }));
    onChange(readjusted);
  };

  return (
    <div className="space-y-4 text-left">
      <div className="flex items-center justify-between">
        <label className="text-xs font-extrabold text-[#082B5C] uppercase tracking-wider block">
          Foto Galeri Layanan ({images.length}/5)
        </label>
        <button
          type="button"
          onClick={() => setShowPresets(!showPresets)}
          className="text-xs font-bold text-[#FF6500] hover:underline cursor-pointer"
        >
          {showPresets ? 'Tutup Pustaka' : 'Pilih dari Pustaka Contoh'}
        </button>
      </div>

      {showPresets && (
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-in fade-in slide-in-from-top-1 duration-200">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Klik foto untuk menambahkan:</p>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {PRESET_IMAGES.map((url, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectPreset(url)}
                className="aspect-square rounded-xl overflow-hidden border border-slate-200 hover:border-[#FF6500] transition-all relative group cursor-pointer"
              >
                <img src={url} alt={`preset-${i}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Check size={14} className="text-white font-black" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Drag Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-[#FF6500] bg-orange-50/20'
            : 'border-slate-200 bg-white hover:border-slate-300'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
        <Upload className="mx-auto text-slate-400 mb-2.5" size={24} />
        <p className="text-xs font-bold text-[#082B5C]">Tarik & Lepaskan berkas di sini</p>
        <p className="text-[10px] text-gray-400 mt-1">atau klik untuk memilih dari komputer Anda</p>
        <p className="text-[9px] text-gray-400 mt-2">Mendukung JPG, PNG, WEBP (maks. 5MB per berkas)</p>
      </div>

      {error && (
        <p className="text-[10px] font-bold text-rose-500">{error}</p>
      )}

      {/* Image Previews List */}
      {images.length > 0 && (
        <div className="space-y-2.5">
          {images.map((img, idx) => (
            <div
              key={img.id}
              className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-2xl shadow-sm"
            >
              {/* Photo */}
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 relative">
                <img src={img.url} alt={img.altText} className="w-full h-full object-cover" />
                {img.isPrimary && (
                  <div className="absolute top-1 left-1 bg-amber-500 text-white rounded-md p-0.5 text-[8px] font-black uppercase leading-none shadow-sm">
                    UTAMA
                  </div>
                )}
              </div>

              {/* Details and Caption */}
              <div className="flex-grow space-y-1 text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Foto #{idx + 1}</span>
                  {img.isPrimary ? (
                    <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Foto Utama</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(img.id)}
                      className="text-[9px] font-black text-gray-400 hover:text-amber-500 flex items-center gap-0.5 cursor-pointer"
                    >
                      <Star size={10} />
                      Set Utama
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={img.altText || ''}
                  onChange={(e) => handleUpdateCaption(img.id, e.target.value)}
                  placeholder="Beri keterangan foto (cth: Lapangan Badminton UNSIL)..."
                  className="w-full text-xs text-[#172033] bg-transparent border-b border-slate-100 focus:border-[#FF6500] focus:outline-none pb-0.5"
                />
              </div>

              {/* Sort controls & Delete */}
              <div className="flex flex-col sm:flex-row items-center gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, 'up')}
                  className="p-1 text-gray-400 hover:text-[#082B5C] disabled:opacity-30 cursor-pointer"
                  title="Naikkan urutan"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  disabled={idx === images.length - 1}
                  onClick={() => handleMove(idx, 'down')}
                  className="p-1 text-gray-400 hover:text-[#082B5C] disabled:opacity-30 cursor-pointer"
                  title="Turunkan urutan"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(img.id)}
                  className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Hapus foto"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
