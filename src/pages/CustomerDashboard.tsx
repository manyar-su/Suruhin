import { useEffect, useMemo, useState } from 'react';
import { BriefcaseBusiness, CheckCircle2, LogOut, Pencil, Plus, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import { Container } from '../components/layout/Container';
import { Button } from '../components/shared/Button';
import { clearCurrentCustomerProfile, getCurrentCustomerProfile, saveCurrentCustomerProfile } from '../lib/customerProfile';
import { deleteMvpAccount, listMvpOrders, MvpOrderRow, updateMvpCustomerProfile } from '../lib/supabase/mvp';
import { formatCurrency } from '../lib/formatCurrency';
import type { CustomerProfile } from '../types';

interface CustomerDashboardProps {
  navigate: (path: string) => void;
  onCustomerChange?: (profile: CustomerProfile | null) => void;
}

export function CustomerDashboard({ navigate, onCustomerChange }: CustomerDashboardProps) {
  const [customer, setCustomer] = useState<CustomerProfile | null>(() => getCurrentCustomerProfile());
  const [orders, setOrders] = useState<MvpOrderRow[]>([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({
    fullName: customer?.fullName || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    city: customer?.city || 'Kota Tasikmalaya',
    address: customer?.address || '',
  });

  const customerOrders = useMemo(
    () => orders.filter((order) => !customer?.id || order.customer_id === customer.id),
    [customer?.id, orders]
  );

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      setLoading(true);
      setError('');
      const result = await listMvpOrders();
      if (!active) return;
      if (result.ok === false) {
        setError(result.error);
      } else {
        setOrders(result.data);
      }
      setLoading(false);
    }

    loadOrders();
    return () => {
      active = false;
    };
  }, []);

  const handleSave = async () => {
    if (!customer) return;
    setSaving(true);
    setError('');
    setNotice('');

    const updatedProfile: CustomerProfile = {
      ...customer,
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      city: form.city.trim(),
      address: form.address.trim(),
    };

    const result = await updateMvpCustomerProfile(customer.id, updatedProfile);
    setSaving(false);

    if (result.ok === false) {
      setError(result.error);
      return;
    }

    saveCurrentCustomerProfile(updatedProfile);
    setCustomer(updatedProfile);
    onCustomerChange?.(updatedProfile);
    setEditing(false);
    setNotice('Profil customer berhasil diperbarui.');
  };

  const handleLogout = () => {
    clearCurrentCustomerProfile();
    setCustomer(null);
    onCustomerChange?.(null);
    navigate('/');
  };

  const handleDelete = async () => {
    if (!customer) return;
    const confirmed = window.confirm('Akun Anda akan dihapus dari Suruhin. Data profil dan dokumen yang tersimpan akan ikut dihapus jika tersedia. Lanjutkan?');
    if (!confirmed) return;

    setDeleting(true);
    setError('');
    const result = await deleteMvpAccount(customer.id);
    setDeleting(false);

    if (result.ok === false) {
      setError(result.error);
      return;
    }

    clearCurrentCustomerProfile();
    setCustomer(null);
    onCustomerChange?.(null);
    navigate('/');
  };

  if (!customer) {
    return (
      <div className="min-h-screen bg-slate-50/50 py-24">
        <Container>
          <div className="mx-auto max-w-2xl rounded-[32px] border border-slate-100 bg-white p-8 text-center shadow-xl">
            <UserRound size={36} className="mx-auto text-[#FF6500]" />
            <h1 className="mt-4 text-3xl font-black text-[#082B5C]">Dashboard Customer</h1>
            <p className="mt-2 text-sm text-slate-500">Anda belum memiliki sesi customer aktif. Daftar sebagai customer untuk membuka akun pemesan.</p>
            <Button onClick={() => navigate('/register/customer')} variant="primary" className="mt-6 font-bold">
              Daftar Customer
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-24">
      <Container>
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FF6500]">Akun Customer</p>
                <h1 className="mt-2 text-3xl font-black text-[#082B5C]">{customer.fullName}</h1>
                <p className="mt-1 text-sm text-slate-500">{customer.city}</p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#082B5C] text-white">
                <UserRound size={24} />
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
                <CheckCircle2 size={16} className="mr-2 inline" />
                Data customer aktif
              </div>
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm font-bold text-[#082B5C]">
                <ShieldCheck size={16} className="mr-2 inline" />
                KTP sudah diunggah ke bucket private
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <Button onClick={() => navigate('/layanan')} variant="primary" fullWidth className="font-bold">
                Cari Layanan
              </Button>
              <Button onClick={() => navigate('/dashboard/customer/jobs/create')} variant="secondary" fullWidth className="font-bold">
                <Plus size={16} className="mr-2" />
                Buat Pekerjaan
              </Button>
              <Button onClick={() => setEditing((value) => !value)} variant="secondary" fullWidth className="font-bold">
                <Pencil size={16} className="mr-2" />
                Edit Profil
              </Button>
            </div>
          </section>

          <section className="space-y-6">
            {(error || notice) && (
              <div className={`rounded-2xl border p-4 text-xs font-bold ${error ? 'border-red-100 bg-red-50 text-red-600' : 'border-emerald-100 bg-emerald-50 text-emerald-700'}`}>
                {error || notice}
              </div>
            )}

            <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-black text-[#082B5C]">Profil Pemesan</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black text-[#082B5C]">Customer</span>
              </div>

              {editing ? (
                <div className="grid gap-4">
                  {[
                    ['fullName', 'Nama Lengkap'],
                    ['email', 'Email'],
                    ['phone', 'Nomor WhatsApp'],
                    ['city', 'Kota'],
                    ['address', 'Alamat'],
                  ].map(([key, label]) => (
                    <label key={key} className="block text-xs font-black uppercase tracking-wider text-slate-500">
                      {label}
                      <input
                        value={form[key as keyof typeof form]}
                        onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
                        className="mt-2 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-[#082B5C] outline-none focus:border-[#FF6500]"
                      />
                    </label>
                  ))}
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button onClick={handleSave} loading={saving} variant="primary" className="font-bold">
                      Simpan Perubahan
                    </Button>
                    <Button onClick={() => setEditing(false)} variant="secondary" className="font-bold">
                      Batal
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-3 text-sm">
                  <p><span className="font-black text-[#082B5C]">Email:</span> {customer.email}</p>
                  <p><span className="font-black text-[#082B5C]">WhatsApp:</span> {customer.phone}</p>
                  <p><span className="font-black text-[#082B5C]">Alamat:</span> {customer.address || '-'}</p>
                </div>
              )}
            </div>

            <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-black text-[#082B5C]">
                  <BriefcaseBusiness size={20} className="text-[#FF6500]" />
                  Pesanan Saya
                </h2>
                <button onClick={() => navigate('/dashboard/customer/jobs')} className="text-xs font-black text-[#FF6500]">
                  Jobs Saya
                </button>
              </div>

              {loading ? (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">Memuat pesanan...</p>
              ) : customerOrders.length === 0 ? (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Belum ada order. Mulai dari cari layanan atau buat posting pekerjaan.</p>
              ) : (
                <div className="space-y-3">
                  {customerOrders.slice(0, 6).map((order) => (
                    <div key={order.id} className="rounded-2xl border border-slate-100 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-black text-[#082B5C]">{order.category}</h3>
                          <p className="mt-1 text-xs text-slate-500">{order.order_date} {order.start_time} - {order.address}</p>
                          <p className="mt-1 text-xs font-black text-[#FF6500]">{formatCurrency(Number(order.total_price) || 0)}</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-[#082B5C]">{order.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={handleLogout} variant="secondary" className="font-bold">
                <LogOut size={16} className="mr-2" />
                Keluar
              </Button>
              <Button onClick={handleDelete} loading={deleting} variant="danger" className="font-bold">
                <Trash2 size={16} className="mr-2" />
                Hapus Akun
              </Button>
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}
