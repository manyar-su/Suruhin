import { useState } from 'react';
import { Plus, Trash2, HelpCircle } from 'lucide-react';

interface ServiceRulesStepProps {
  includedItems: string[];
  setIncludedItems: (val: string[]) => void;
  excludedItems: string[];
  setExcludedItems: (val: string[]) => void;
  requirements: string[];
  setRequirements: (val: string[]) => void;
}

export function ServiceRulesStep({
  includedItems,
  setIncludedItems,
  excludedItems,
  setExcludedItems,
  requirements,
  setRequirements
}: ServiceRulesStepProps) {
  const [newInc, setNewInc] = useState('');
  const [newExc, setNewExc] = useState('');
  const [newReq, setNewReq] = useState('');

  const handleAdd = (val: string, setVal: (s: string) => void, list: string[], setList: (arr: string[]) => void) => {
    if (!val.trim()) return;
    if (list.includes(val.trim())) return;
    setList([...list, val.trim()]);
    setVal('');
  };

  const handleRemove = (index: number, list: string[], setList: (arr: string[]) => void) => {
    const updated = list.filter((_, i) => i !== index);
    setList(updated);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Included Items */}
      <div className="space-y-2.5">
        <label className="text-xs font-extrabold text-[#082B5C] uppercase tracking-wider block">
          Sudah Termasuk dalam Harga (Included)
        </label>
        <p className="text-[9px] text-gray-400 leading-normal mb-1">
          Tulis benefit atau barang apa saja yang sudah termasuk dalam harga jasa Anda (cth: Air mineral, Sesi foto, Jasa antre).
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={newInc}
            onChange={(e) => setNewInc(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd(newInc, setNewInc, includedItems, setIncludedItems);
              }
            }}
            placeholder="Tambah poin included..."
            className="flex-grow bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs text-[#172033] focus:bg-white focus:border-[#FF6500] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => handleAdd(newInc, setNewInc, includedItems, setIncludedItems)}
            className="bg-[#082B5C] hover:bg-[#113a70] text-white p-2.5 rounded-xl transition-all cursor-pointer shrink-0"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="space-y-1.5 mt-2">
          {includedItems.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100/50 rounded-xl">
              <span className="text-xs text-[#172033] font-medium leading-normal">{item}</span>
              <button
                type="button"
                onClick={() => handleRemove(idx, includedItems, setIncludedItems)}
                className="text-rose-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          {includedItems.length === 0 && (
            <p className="text-[10px] text-gray-400 italic">Belum ada poin yang ditambahkan.</p>
          )}
        </div>
      </div>

      {/* Excluded Items */}
      <div className="space-y-2.5">
        <label className="text-xs font-extrabold text-[#082B5C] uppercase tracking-wider block">
          Belum Termasuk (Excluded)
        </label>
        <p className="text-[9px] text-gray-400 leading-normal mb-1">
          Tulis biaya tambahan yang harus ditanggung pelanggan (cth: Tiket masuk wisata, Bensin, Parkir, Makan siang).
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={newExc}
            onChange={(e) => setNewExc(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd(newExc, setNewExc, excludedItems, setExcludedItems);
              }
            }}
            placeholder="Tambah poin excluded..."
            className="flex-grow bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs text-[#172033] focus:bg-white focus:border-[#FF6500] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => handleAdd(newExc, setNewExc, excludedItems, setExcludedItems)}
            className="bg-[#082B5C] hover:bg-[#113a70] text-white p-2.5 rounded-xl transition-all cursor-pointer shrink-0"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="space-y-1.5 mt-2">
          {excludedItems.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100/50 rounded-xl">
              <span className="text-xs text-[#172033] font-medium leading-normal">{item}</span>
              <button
                type="button"
                onClick={() => handleRemove(idx, excludedItems, setExcludedItems)}
                className="text-rose-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          {excludedItems.length === 0 && (
            <p className="text-[10px] text-gray-400 italic">Belum ada poin yang ditambahkan.</p>
          )}
        </div>
      </div>

      {/* Requirements */}
      <div className="space-y-2.5">
        <label className="text-xs font-extrabold text-[#082B5C] uppercase tracking-wider block">
          Syarat & Prasyarat Pelanggan (Requirements)
        </label>
        <p className="text-[9px] text-gray-400 leading-normal mb-1">
          Ketentuan khusus yang wajib dipenuhi oleh pelanggan sebelum Anda melayani (cth: Sehat jasmani, Membawa sepatu hiking, Menjaga etika).
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={newReq}
            onChange={(e) => setNewReq(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd(newReq, setNewReq, requirements, setRequirements);
              }
            }}
            placeholder="Tambah prasyarat..."
            className="flex-grow bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs text-[#172033] focus:bg-white focus:border-[#FF6500] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => handleAdd(newReq, setNewReq, requirements, setRequirements)}
            className="bg-[#082B5C] hover:bg-[#113a70] text-white p-2.5 rounded-xl transition-all cursor-pointer shrink-0"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="space-y-1.5 mt-2">
          {requirements.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100/50 rounded-xl">
              <span className="text-xs text-[#172033] font-medium leading-normal">{item}</span>
              <button
                type="button"
                onClick={() => handleRemove(idx, requirements, setRequirements)}
                className="text-rose-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          {requirements.length === 0 && (
            <p className="text-[10px] text-gray-400 italic">Belum ada prasyarat yang ditambahkan.</p>
          )}
        </div>
      </div>
    </div>
  );
}
