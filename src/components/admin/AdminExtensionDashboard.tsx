import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Settings, 
  DollarSign, 
  Clock, 
  HelpCircle, 
  AlertTriangle, 
  RotateCcw, 
  CheckCircle2, 
  TrendingUp, 
  FileText,
  User,
  Activity,
  ThumbsUp
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  getSystemConfig, 
  saveSystemConfig, 
  getExtensions, 
  saveExtensions, 
  getTips, 
  saveTips,
  getAuditLogs, 
  addAuditLog, 
  getBookings, 
  saveBookings,
  getClientBalance,
  saveClientBalance,
  addNotification
} from '../../data/mockExtensionData';
import { ServiceExtension, Tip, AuditLog, SystemConfig } from '../../types';

export function AdminExtensionDashboard() {
  const [config, setConfig] = useState<SystemConfig>(getSystemConfig());
  const [extensions, setExtensions] = useState<ServiceExtension[]>(getExtensions());
  const [tips, setTips] = useState<Tip[]>(getTips());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(getAuditLogs());
  const [successMsg, setSuccessMsg] = useState('');

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveSystemConfig(config);
    addAuditLog('SYSTEM', 'CONFIG_UPDATED', 'admin', `Admin memperbarui pengaturan: Tarif Rp ${config.hourlyOvertimeRate}/jam, Toleransi gratis ${config.toleranceFreeMinutes}m`);
    setAuditLogs(getAuditLogs());
    setSuccessMsg('Pengaturan sistem berhasil diperbarui!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Resolve Dispute
  const handleResolveDispute = (extId: string, resolution: 'approve' | 'refund') => {
    const allExts = getExtensions();
    const targetExt = allExts.find(e => e.id === extId);
    if (!targetExt) return;

    const bookings = getBookings();
    const booking = bookings.find(b => b.id === targetExt.bookingId);

    if (resolution === 'approve') {
      targetExt.status = 'approved';
      targetExt.approvedAt = new Date().toISOString();
      if (booking) {
        booking.status = 'EXTENSION_ACTIVE';
      }
      addAuditLog(targetExt.bookingId, 'DISPUTE_RESOLVED_APPROVED', 'admin', `Admin menyelesaikan sengketa untuk ${targetExt.id} dengan persetujuan dana diteruskan.`);
      addNotification('Sengketa Diselesaikan', `Sengketa perpanjangan waktu disetujui oleh admin. Tarif tambahan Rp ${targetExt.approvedPrice.toLocaleString('id-ID')} diteruskan.`, 'approved');
    } else {
      targetExt.status = 'refunded';
      // Refund cash to customer balance
      const customerBalance = getClientBalance();
      saveClientBalance(customerBalance + targetExt.approvedPrice);
      if (booking) {
        booking.status = 'confirmed'; // Revert back to original booking duration
      }
      addAuditLog(targetExt.bookingId, 'DISPUTE_RESOLVED_REFUNDED', 'admin', `Admin menyelesaikan sengketa untuk ${targetExt.id} dengan melakukan refund Rp ${targetExt.approvedPrice} ke saldo pelanggan.`);
      addNotification('Refund Berhasil', `Admin menyetujui refund Rp ${targetExt.approvedPrice.toLocaleString('id-ID')} untuk sengketa perpanjangan.`, 'info');
    }

    saveExtensions(allExts);
    saveBookings(bookings);
    setExtensions(allExts);
    setAuditLogs(getAuditLogs());
  };

  // Trigger Manual Refund
  const handleRefund = (extId: string) => {
    const allExts = getExtensions();
    const targetExt = allExts.find(e => e.id === extId);
    if (!targetExt || targetExt.status !== 'completed' && targetExt.status !== 'approved') return;

    targetExt.status = 'refunded';
    
    // Refund cash to customer balance
    const customerBalance = getClientBalance();
    saveClientBalance(customerBalance + targetExt.approvedPrice);

    const bookings = getBookings();
    const booking = bookings.find(b => b.id === targetExt.bookingId);
    if (booking) {
      booking.status = 'confirmed';
    }

    saveExtensions(allExts);
    saveBookings(bookings);
    setExtensions(allExts);

    addAuditLog(targetExt.bookingId, 'EXTENSION_REFUNDED', 'admin', `Admin melakukan refund manual Rp ${targetExt.approvedPrice} untuk perpanjangan ${targetExt.id}.`);
    addNotification('Refund Berhasil', `Dana tambahan sebesar Rp ${targetExt.approvedPrice.toLocaleString('id-ID')} berhasil direfund ke saldo Anda.`, 'info');
    setAuditLogs(getAuditLogs());
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-8 text-left">
      {/* Header Banner */}
      <div className="bg-[#082B5C] text-white p-6 rounded-3xl relative overflow-hidden shadow-md">
        <div className="relative z-10 space-y-1.5">
          <span className="bg-[#FF6500] text-xs font-black uppercase px-2.5 py-1 rounded-md">Administrator Panel</span>
          <h2 className="text-xl font-black">Dashboard Pengaturan Overtime & Tips</h2>
          <p className="text-xs text-blue-100 max-w-xl">Konfigurasi toleransi keterlambatan, tarif denda overtime otomatis, audit log keamanan, dan penyelesaian sengketa transaksi.</p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
          <Shield size={160} />
        </div>
      </div>

      {successMsg && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-xs font-bold"
        >
          ✓ {successMsg}
        </motion.div>
      )}

      {/* Grid: Settings & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Settings Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-[#082B5C] uppercase tracking-wider flex items-center gap-2">
            <Settings size={16} className="text-[#FF6500]" /> Atur Aturan & Kebijakan Toleransi (Global)
          </h3>
          <p className="text-[11px] text-gray-400 -mt-2">Semua perhitungan denda overtime pelanggan harian secara otomatis merujuk pada metrik di bawah ini.</p>
          
          <form onSubmit={handleSaveSettings} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Tarif Overtime Standar (Rp/Jam)</label>
                <div className="relative flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5">
                  <span className="text-xs font-bold text-gray-400 mr-1.5">Rp</span>
                  <input 
                    type="number"
                    value={config.hourlyOvertimeRate}
                    onChange={(e) => setConfig({ ...config, hourlyOvertimeRate: Number(e.target.value) })}
                    className="w-full bg-transparent text-xs font-bold text-[#082B5C] focus:outline-none"
                    placeholder="40000"
                    min="1000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Toleransi Gratis (Menit)</label>
                <div className="relative flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5">
                  <input 
                    type="number"
                    value={config.toleranceFreeMinutes}
                    onChange={(e) => setConfig({ ...config, toleranceFreeMinutes: Number(e.target.value) })}
                    className="w-full bg-transparent text-xs font-bold text-[#082B5C] focus:outline-none"
                    placeholder="10"
                    min="0"
                  />
                  <span className="text-xs font-bold text-gray-400 ml-1.5">Menit</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Batas Hitungan 30 Menit</label>
                <div className="relative flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5">
                  <input 
                    type="number"
                    value={config.tolerance30MinLimit}
                    onChange={(e) => setConfig({ ...config, tolerance30MinLimit: Number(e.target.value) })}
                    className="w-full bg-transparent text-xs font-bold text-[#082B5C] focus:outline-none"
                    placeholder="30"
                    min="1"
                  />
                  <span className="text-xs font-bold text-gray-400 ml-1.5">Menit</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Batas Hitungan 1 Jam</label>
                <div className="relative flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5">
                  <input 
                    type="number"
                    value={config.tolerance60MinLimit}
                    onChange={(e) => setConfig({ ...config, tolerance60MinLimit: Number(e.target.value) })}
                    className="w-full bg-transparent text-xs font-bold text-[#082B5C] focus:outline-none"
                    placeholder="60"
                    min="1"
                  />
                  <span className="text-xs font-bold text-gray-400 ml-1.5">Menit</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-[#FF6500] hover:bg-[#e05900] text-white text-xs font-extrabold rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Simpan Aturan Global
            </button>
          </form>
        </div>

        {/* Global Policy info */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-[#082B5C] uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle size={15} className="text-[#FF6500]" /> Panduan Perhitungan
          </h3>
          <div className="space-y-3.5 text-xs text-gray-500 leading-relaxed">
            <div className="flex gap-2">
              <span className="w-5 h-5 bg-orange-50 text-[#FF6500] rounded-md flex items-center justify-center shrink-0 font-bold text-[10px]">1</span>
              <p>Durasi overtime <b>0 s/d {config.toleranceFreeMinutes} menit</b> diringankan biaya secara gratis.</p>
            </div>
            <div className="flex gap-2">
              <span className="w-5 h-5 bg-orange-50 text-[#FF6500] rounded-md flex items-center justify-center shrink-0 font-bold text-[10px]">2</span>
              <p>Durasi overtime <b>{config.toleranceFreeMinutes + 1} s/d {config.tolerance30MinLimit} menit</b> otomatis dibulatkan senilai 30 menit (setengah tarif).</p>
            </div>
            <div className="flex gap-2">
              <span className="w-5 h-5 bg-orange-50 text-[#FF6500] rounded-md flex items-center justify-center shrink-0 font-bold text-[10px]">3</span>
              <p>Durasi overtime <b>{config.tolerance30MinLimit + 1} s/d {config.tolerance60MinLimit} menit</b> otomatis dibulatkan senilai 1 jam penuh.</p>
            </div>
          </div>
        </div>

      </div>

      {/* Grid: Extensions & Disputes */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Service Extensions List */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-50 pb-3">
            <h3 className="text-sm font-extrabold text-[#082B5C] uppercase tracking-wider flex items-center gap-2">
              <Clock size={16} className="text-[#FF6500]" /> Pengajuan Perpanjangan Layanan
            </h3>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
              {extensions.length} Transaksi
            </span>
          </div>

          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
            {extensions.map((ext) => {
              const statusColors = {
                pending: 'bg-amber-50 border-amber-100 text-amber-600',
                approved: 'bg-blue-50 border-blue-100 text-blue-600',
                completed: 'bg-emerald-50 border-emerald-100 text-emerald-600',
                cancelled: 'bg-red-50 border-red-100 text-red-500',
                disputed: 'bg-purple-50 border-purple-100 text-purple-600',
                held: 'bg-yellow-50 border-yellow-100 text-yellow-700',
                refunded: 'bg-slate-50 border-slate-100 text-slate-400',
              }[ext.status] || 'bg-slate-50 text-slate-500';

              return (
                <div key={ext.id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-black text-[#082B5C] mr-2">{ext.id}</span>
                      <span className="text-[10px] text-gray-400">Booking: #{ext.bookingId}</span>
                    </div>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${statusColors}`}>
                      {ext.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-left text-[11px]">
                    <div>
                      <span className="block text-gray-400">Durasi Tambahan</span>
                      <span className="font-extrabold text-[#082B5C]">{ext.requestedMinutes} Menit</span>
                    </div>
                    <div>
                      <span className="block text-gray-400">Biaya Tambahan</span>
                      <span className="font-extrabold text-[#FF6500]">{formatIDR(ext.approvedPrice || ext.requestedPrice)}</span>
                    </div>
                    <div>
                      <span className="block text-gray-400">Diajukan Oleh</span>
                      <span className="font-extrabold text-blue-600 capitalize">{ext.requestedBy}</span>
                    </div>
                  </div>

                  {ext.reason && (
                    <p className="text-[10px] text-gray-500 italic bg-white p-2 rounded-lg border border-slate-100">
                      "Alasan: {ext.reason}"
                    </p>
                  )}

                  {/* Actions depending on status */}
                  {ext.status === 'disputed' && (
                    <div className="pt-2 flex gap-2 border-t border-slate-100/50">
                      <button
                        onClick={() => handleResolveDispute(ext.id, 'approve')}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 size={11} />
                        Selesaikan (Approve)
                      </button>
                      <button
                        onClick={() => handleResolveDispute(ext.id, 'refund')}
                        className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <RotateCcw size={11} />
                        Refund Pelanggan
                      </button>
                    </div>
                  )}

                  {(ext.status === 'completed' || ext.status === 'approved') && (
                    <div className="pt-2 flex justify-end border-t border-slate-100/50">
                      <button
                        onClick={() => handleRefund(ext.id)}
                        className="py-1.5 px-3 bg-slate-100 hover:bg-red-50 hover:text-red-600 hover:border-red-100 text-[#082B5C] border border-transparent text-[10px] font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw size={11} />
                        Refund Manual
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {extensions.length === 0 && (
              <p className="text-center py-10 text-xs text-gray-400">Belum ada riwayat perpanjangan terekam.</p>
            )}
          </div>
        </div>

        {/* Tips Registry */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-50 pb-3">
            <h3 className="text-sm font-extrabold text-[#082B5C] uppercase tracking-wider flex items-center gap-2">
              <ThumbsUp size={16} className="text-[#FF6500]" /> Log Tips Masuk Ke Talent
            </h3>
            <span className="text-[10px] bg-orange-100 text-[#FF6500] px-2 py-0.5 rounded-full font-bold">
              {tips.length} Pemberian
            </span>
          </div>

          <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
            {tips.map((tip) => (
              <div key={tip.id} className="p-3.5 bg-orange-50/20 rounded-2xl border border-orange-100/40 flex justify-between gap-3 items-start text-left">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-[#082B5C]">Nominal Tip: {formatIDR(tip.amount)}</span>
                  </div>
                  <p className="text-[10px] text-gray-400">Booking: #{tip.bookingId} • {tip.createdAt.split('T')[0]}</p>
                  {tip.message && (
                    <p className="text-[10px] text-gray-500 italic">"{tip.message}"</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[9px] bg-orange-100 text-[#FF6500] px-2 py-0.5 rounded font-black uppercase">Tips Sent</span>
                </div>
              </div>
            ))}

            {tips.length === 0 && (
              <p className="text-center py-10 text-xs text-gray-400">Belum ada pemberian tips yang terekam.</p>
            )}
          </div>
        </div>

      </div>

      {/* Security Audit Logs */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-[#082B5C] uppercase tracking-wider flex items-center gap-2 border-b border-slate-50 pb-3">
          <Activity size={16} className="text-[#FF6500]" /> Audit Trail Log & Keamanan Sistem
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-gray-400 font-bold uppercase">
                <th className="py-2.5">ID Log</th>
                <th className="py-2.5">Waktu</th>
                <th className="py-2.5">Booking ID</th>
                <th className="py-2.5">Aksi</th>
                <th className="py-2.5">Pelaku</th>
                <th className="py-2.5">Detail Log</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="py-2 text-[#082B5C] font-black">{log.id}</td>
                  <td className="py-2 text-gray-400">{log.timestamp.replace('T', ' ').substring(0, 19)}</td>
                  <td className="py-2 text-gray-400">#{log.bookingId}</td>
                  <td className="py-2">
                    <span className="bg-[#082B5C]/5 text-[#082B5C] px-1.5 py-0.5 rounded text-[9px] font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2 capitalize font-semibold">{log.performedBy}</td>
                  <td className="py-2 text-gray-600 italic">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
