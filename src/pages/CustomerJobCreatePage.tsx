import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Paperclip, Upload } from 'lucide-react';
import { Container } from '../components/layout/Container';
import { categories } from '../data/categories';
import { getCurrentCustomerProfile } from '../lib/customerProfile';
import { createJobEntityId, createJobPost } from '../lib/jobsMarketplace';

interface CustomerJobCreatePageProps {
  navigate: (path: string) => void;
}

export function CustomerJobCreatePage({ navigate }: CustomerJobCreatePageProps) {
  const customer = useMemo(() => getCurrentCustomerProfile(), []);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: categories[0]?.id || '',
    budget: '',
    location: customer?.address || customer?.city || 'Kota Tasikmalaya',
    serviceMode: 'OFFLINE' as 'ONLINE' | 'OFFLINE' | 'HYBRID',
    deadline: '',
    imageFile: null as File | null,
    attachmentFile: null as File | null,
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!customer) {
    return (
      <div className="min-h-screen bg-slate-50/60 py-24">
        <Container>
          <div className="rounded-[32px] border border-slate-100 bg-white p-8 text-center shadow-sm">
            <h1 className="text-3xl font-black text-[#082B5C]">Buat Posting Pekerjaan</h1>
            <p className="mt-3 text-sm text-[#172033]/70">Dashboard ini membutuhkan profil customer aktif.</p>
            <button
              onClick={() => navigate('/register/customer')}
              className="mt-6 rounded-2xl bg-[#082B5C] px-5 py-3 text-sm font-black text-white transition hover:bg-[#061e40]"
            >
              Daftar Customer
            </button>
          </div>
        </Container>
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    const selectedCategory = categories.find((category) => category.id === formData.categoryId);
    if (!formData.title.trim() || !formData.description.trim() || !selectedCategory || !formData.location.trim()) {
      setError('Judul, deskripsi, kategori, dan lokasi pekerjaan wajib diisi.');
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await createJobPost({
        id: createJobEntityId(),
        customerId: customer.id,
        customerName: customer.fullName,
        title: formData.title,
        description: formData.description,
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
        budget: Number(formData.budget || 0),
        location: formData.location,
        serviceMode: formData.serviceMode,
        deadline: formData.deadline,
        imageFile: formData.imageFile,
        attachmentFile: formData.attachmentFile,
      });

      navigate(`/dashboard/customer/jobs/${created.id}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Gagal membuat pekerjaan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-24">
      <Container>
        <button
          onClick={() => navigate('/dashboard/customer/jobs')}
          className="mb-5 inline-flex items-center gap-2 text-sm font-black text-[#082B5C] transition hover:text-[#FF6500]"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke pekerjaan saya</span>
        </button>

        <form onSubmit={handleSubmit} className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6500]/20 bg-[#FF6500]/10 px-3 py-1.5 text-xs font-black text-[#FF6500]">
              <BriefcaseBusiness size={14} />
              <span>Buat Posting</span>
            </div>
            <h1 className="text-3xl font-black text-[#082B5C]">Publikasikan kebutuhan pekerjaan Anda</h1>
            <p className="text-sm text-[#172033]/70">Posting akan tampil di area Cari Pekerjaan untuk dilihat seluruh talent yang tersedia.</p>
          </div>

          {error && <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600">{error}</div>}

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-black uppercase text-gray-500">Judul Pekerjaan</label>
                <input
                  value={formData.title}
                  onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500]"
                  placeholder="Contoh: Butuh pendamping wisuda setengah hari"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-black uppercase text-gray-500">Deskripsi</label>
                <textarea
                  rows={6}
                  value={formData.description}
                  onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500]"
                  placeholder="Jelaskan kebutuhan, preferensi talent, detail waktu, dan ekspektasi pekerjaan."
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase text-gray-500">Kategori</label>
                  <select
                    value={formData.categoryId}
                    onChange={(event) => setFormData((prev) => ({ ...prev, categoryId: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500]"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase text-gray-500">Budget</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.budget}
                    onChange={(event) => setFormData((prev) => ({ ...prev, budget: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500]"
                    placeholder="250000"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase text-gray-500">Mode Layanan</label>
                  <select
                    value={formData.serviceMode}
                    onChange={(event) => setFormData((prev) => ({ ...prev, serviceMode: event.target.value as 'ONLINE' | 'OFFLINE' | 'HYBRID' }))}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500]"
                  >
                    <option value="OFFLINE">Offline</option>
                    <option value="ONLINE">Online</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase text-gray-500">Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(event) => setFormData((prev) => ({ ...prev, deadline: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500]"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-black uppercase text-gray-500">Lokasi Pekerjaan</label>
                <textarea
                  rows={3}
                  value={formData.location}
                  onChange={(event) => setFormData((prev) => ({ ...prev, location: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500]"
                  placeholder="Alamat detail pekerjaan"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-5 text-center transition hover:border-[#FF6500]/40">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  className="hidden"
                  onChange={(event) => setFormData((prev) => ({ ...prev, imageFile: event.target.files?.[0] || null }))}
                />
                <Upload size={20} className="mb-2 text-gray-400" />
                <span className="text-xs font-black text-[#082B5C]">Gambar Pekerjaan</span>
                <span className="mt-1 text-[10px] text-gray-400">Private bucket `job-images`, maksimal 5MB</span>
                {formData.imageFile && <span className="mt-3 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-600">{formData.imageFile.name}</span>}
              </label>

              <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-5 text-center transition hover:border-[#FF6500]/40">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                  className="hidden"
                  onChange={(event) => setFormData((prev) => ({ ...prev, attachmentFile: event.target.files?.[0] || null }))}
                />
                <Paperclip size={20} className="mb-2 text-gray-400" />
                <span className="text-xs font-black text-[#082B5C]">Lampiran Brief</span>
                <span className="mt-1 text-[10px] text-gray-400">Private bucket `job-files`, admin akses via signed URL</span>
                {formData.attachmentFile && <span className="mt-3 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-600">{formData.attachmentFile.name}</span>}
              </label>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-[11px] leading-relaxed text-[#172033]/70">
                File pekerjaan disimpan di bucket private. Publik hanya melihat detail teks pekerjaan, bukan dokumen sensitif.
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#082B5C] px-5 py-3 text-sm font-black text-white transition hover:bg-[#061e40] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>{isSubmitting ? 'Menyimpan...' : 'Publikasikan Pekerjaan'}</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </Container>
    </div>
  );
}
