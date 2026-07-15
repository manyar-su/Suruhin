import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, Power, Star, XCircle } from 'lucide-react';
import { Container } from '../components/layout/Container';
import {
  listMvpOrders,
  listMvpTalentsForAdmin,
  MvpOrderRow,
  MvpTalentRow,
  updateMvpOrderStatus,
  updateMvpTalentStatus,
} from '../lib/supabase/mvp';
import { formatCurrency } from '../lib/formatCurrency';

interface MvpDashboardProps {
  role: 'admin' | 'customer' | 'talent';
}

const orderActions: Record<MvpOrderRow['status'], MvpOrderRow['status'][]> = {
  pending: ['accepted', 'rejected', 'cancelled'],
  accepted: ['ongoing', 'cancelled'],
  rejected: [],
  ongoing: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export function MvpDashboard({ role }: MvpDashboardProps) {
  const [talents, setTalents] = useState<MvpTalentRow[]>([]);
  const [orders, setOrders] = useState<MvpOrderRow[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    setError('');

    const [talentResult, orderResult] = await Promise.all([
      listMvpTalentsForAdmin(),
      listMvpOrders(),
    ]);

    if ('error' in talentResult) setError(talentResult.error);
    if ('error' in orderResult) setError(orderResult.error);
    if (talentResult.ok) setTalents(talentResult.data);
    if (orderResult.ok) setOrders(orderResult.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTalentPatch = async (id: string, patch: Partial<Pick<MvpTalentRow, 'verification_status' | 'is_available'>>) => {
    const result = await updateMvpTalentStatus(id, patch);
    if ('error' in result) {
      setError(result.error);
      return;
    }
    await loadData();
  };

  const handleOrderStatus = async (id: string, status: MvpOrderRow['status']) => {
    const result = await updateMvpOrderStatus(id, status);
    if ('error' in result) {
      setError(result.error);
      return;
    }
    await loadData();
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-24">
      <Container>
        <div className="mb-8 rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FF6500]">Dashboard MVP</p>
          <h1 className="mt-2 text-3xl font-black text-[#061B3A]">
            {role === 'admin' ? 'Admin Suruhin' : role === 'talent' ? 'Dashboard Talent' : 'Dashboard Customer'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#172033]/70">
            MVP ini belum memakai Supabase Auth. Struktur fungsi dan data sudah dipisah agar mudah dipindah ke session Auth nanti.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-xs font-bold text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center text-sm font-bold text-[#082B5C]">
            Memuat data Supabase...
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-[#061B3A]">
                <Power size={18} className="text-[#FF6500]" />
                Talent
              </h2>
              <div className="space-y-3">
                {talents.length === 0 ? (
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Belum ada pendaftar talent.</p>
                ) : talents.map((talent) => (
                  <div key={talent.id} className="rounded-2xl border border-slate-100 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-black text-[#061B3A]">{talent.full_name}</h3>
                        <p className="mt-1 text-xs text-slate-500">{talent.category} - {talent.city}</p>
                        <p className="mt-1 text-xs font-bold text-[#FF6500]">{formatCurrency(Number(talent.price_per_hour) || 0)}/jam</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                        talent.verification_status === 'approved'
                          ? 'bg-emerald-50 text-emerald-600'
                          : talent.verification_status === 'rejected'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}>
                        {talent.verification_status}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {role === 'admin' && (
                        <>
                          <button onClick={() => handleTalentPatch(talent.id, { verification_status: 'approved' })} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white">
                            Approve
                          </button>
                          <button onClick={() => handleTalentPatch(talent.id, { verification_status: 'rejected' })} className="rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white">
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleTalentPatch(talent.id, { is_available: !talent.is_available })}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-[#061B3A]"
                      >
                        {talent.is_available ? 'Matikan Terima Job' : 'Aktifkan Terima Job'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-[#061B3A]">
                <Clock size={18} className="text-[#FF6500]" />
                Order
              </h2>
              <div className="space-y-3">
                {orders.length === 0 ? (
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Belum ada order masuk.</p>
                ) : orders.map((order) => (
                  <div key={order.id} className="rounded-2xl border border-slate-100 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-black text-[#061B3A]">{order.category}</h3>
                        <p className="mt-1 text-xs text-slate-500">{order.order_date} {order.start_time} - {order.address}</p>
                        <p className="mt-1 text-xs font-bold text-[#FF6500]">{formatCurrency(Number(order.total_price) || 0)}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-[#061B3A]">
                        {order.status}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {orderActions[order.status].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleOrderStatus(order.id, status)}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-[#061B3A]"
                        >
                          {status === 'completed' ? <CheckCircle2 size={13} /> : status === 'rejected' || status === 'cancelled' ? <XCircle size={13} /> : <Star size={13} />}
                          {status === 'accepted' ? 'Terima Job' : status === 'rejected' ? 'Tolak Job' : status === 'ongoing' ? 'Mulai Job' : status === 'completed' ? 'Selesaikan Job' : status}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </Container>
    </div>
  );
}
