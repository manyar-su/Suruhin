import { TalentServiceStatus } from '../../types';

interface ServiceStatusBadgeProps {
  status: TalentServiceStatus;
}

export function ServiceStatusBadge({ status }: ServiceStatusBadgeProps) {
  let bg = 'bg-gray-100 text-gray-800';
  let label = 'Draft';

  switch (status) {
    case TalentServiceStatus.DRAFT:
      bg = 'bg-slate-100 border-slate-200 text-slate-700';
      label = 'Draft';
      break;
    case TalentServiceStatus.PENDING_REVIEW:
      bg = 'bg-amber-50 border-amber-200 text-amber-700';
      label = 'Menunggu Review';
      break;
    case TalentServiceStatus.ACTIVE:
      bg = 'bg-emerald-50 border-emerald-200 text-emerald-700';
      label = 'Aktif';
      break;
    case TalentServiceStatus.REJECTED:
      bg = 'bg-rose-50 border-rose-200 text-rose-700';
      label = 'Ditolak';
      break;
    case TalentServiceStatus.INACTIVE:
      bg = 'bg-zinc-100 border-zinc-200 text-zinc-600';
      label = 'Nonaktif';
      break;
    case TalentServiceStatus.ARCHIVED:
      bg = 'bg-purple-50 border-purple-200 text-purple-700';
      label = 'Diarsipkan';
      break;
    case TalentServiceStatus.DELETED:
      bg = 'bg-red-50 border-red-200 text-red-600';
      label = 'Dihapus';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wide leading-none ${bg}`}>
      {label}
    </span>
  );
}
