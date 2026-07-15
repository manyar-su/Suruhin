import { BriefcaseBusiness, CircleHelp, Grid2x2, Home, Search, User } from 'lucide-react';
import type { CustomerProfile, Talent } from '../../types';

interface MobileBottomNavProps {
  activePath: string;
  currentUser?: Talent | null;
  currentCustomer?: CustomerProfile | null;
  onNavigate: (path: string) => void;
  onOpenMenu: () => void;
}

export function MobileBottomNav({
  activePath,
  currentUser,
  currentCustomer,
  onNavigate,
  onOpenMenu,
}: MobileBottomNavProps) {
  const items = [
    { label: 'Beranda', path: '/', icon: Home, action: () => onNavigate('/') },
    { label: 'Layanan', path: '/layanan', icon: Search, action: () => onNavigate('/layanan') },
    { label: 'Jobs', path: '/jobs', icon: BriefcaseBusiness, action: () => onNavigate('/jobs') },
    { label: 'Bantuan', path: '/bantuan', icon: CircleHelp, action: () => onNavigate('/bantuan') },
    currentUser
      ? { label: 'Profil', path: '/profil-talent', icon: User, action: () => onNavigate('/profil-talent') }
      : currentCustomer
      ? { label: 'Akun', path: '/dashboard/customer', icon: User, action: () => onNavigate('/dashboard/customer') }
      : { label: 'Menu', path: '__menu__', icon: Grid2x2, action: onOpenMenu },
  ];

  const isActive = (path: string) => {
    if (path === '/') return activePath === '/';
    if (path === '__menu__') return false;
    return activePath === path || activePath.startsWith(`${path}/`);
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#082B5C]/8 bg-white/96 px-3 pb-[calc(0.9rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-16px_40px_rgba(8,43,92,0.12)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1 rounded-[1.75rem] bg-[#f7f9fd] p-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.label}
              onClick={item.action}
              className={`flex min-h-[4.1rem] flex-col items-center justify-center gap-1 rounded-[1.2rem] px-1.5 text-[10px] font-black transition ${
                active
                  ? 'bg-[#082B5C] text-white shadow-[0_10px_24px_rgba(8,43,92,0.22)]'
                  : 'text-[#082B5C]/72'
              }`}
              aria-label={item.label}
            >
              <Icon size={18} className={active ? 'text-[#FFB36A]' : 'text-[#082B5C]'} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
