import { useState, useEffect } from 'react';

export interface RouteInfo {
  path: string;
  page: string;         // 'home' | 'layanan-list' | 'layanan-detail' | 'kategori' | 'talent-list' | 'talent-detail' | 'jadi-talent' | 'cara-kerja' | 'keamanan' | 'tentang' | 'bantuan' | 'kontak' | 'checkout' | 'kebijakan-privasi' | 'syarat-ketentuan' | 'not-found'
  slug?: string;
  queryParams: Record<string, string>;
}

export function parseRoute(urlPath: string): RouteInfo {
  // Split path and query
  const [pathname, queryString] = urlPath.split('?');
  
  // Parse query params
  const queryParams: Record<string, string> = {};
  if (queryString) {
    queryString.split('&').forEach(param => {
      const [key, val] = param.split('=');
      if (key) {
        queryParams[decodeURIComponent(key)] = decodeURIComponent(val || '');
      }
    });
  }

  // Normalize path
  const path = pathname === '' || pathname === '/' ? '/' : pathname;

  // Matching routing
  if (path === '/') {
    return { path, page: 'home', queryParams };
  }
  if (path === '/layanan') {
    return { path, page: 'layanan-list', queryParams };
  }
  if (path.startsWith('/layanan/')) {
    const slug = path.substring('/layanan/'.length);
    return { path, page: 'layanan-detail', slug, queryParams };
  }
  if (path.startsWith('/kategori/')) {
    const slug = path.substring('/kategori/'.length);
    return { path, page: 'kategori', slug, queryParams };
  }
  if (path === '/talent') {
    return { path, page: 'talent-list', queryParams };
  }
  if (path === '/jobs' || path === '/public/jobs') {
    return { path, page: 'jobs-list', queryParams };
  }
  if (path.startsWith('/jobs/')) {
    const slug = path.substring('/jobs/'.length);
    return { path, page: 'job-detail', slug, queryParams };
  }
  if (path.startsWith('/talent/')) {
    const slug = path.substring('/talent/'.length);
    return { path, page: 'talent-detail', slug, queryParams };
  }
  if (path === '/profil-talent') {
    return { path, page: 'profil-talent', queryParams };
  }
  if (path === '/register') {
    return { path, page: 'register', queryParams };
  }
  if (path === '/register/customer') {
    return { path, page: 'register-customer', queryParams };
  }
  if (path === '/register/talent') {
    return { path, page: 'register-talent', queryParams };
  }
  if (path === '/dashboard/customer') {
    return { path, page: 'dashboard-customer', queryParams };
  }
  if (path === '/dashboard/customer/jobs') {
    return { path, page: 'dashboard-customer-jobs', queryParams };
  }
  if (path === '/dashboard/customer/jobs/create') {
    return { path, page: 'dashboard-customer-jobs-create', queryParams };
  }
  if (path.startsWith('/dashboard/customer/jobs/')) {
    const slug = path.substring('/dashboard/customer/jobs/'.length);
    return { path, page: 'dashboard-customer-jobs-detail', slug, queryParams };
  }
  if (path === '/dashboard/talent') {
    return { path, page: 'dashboard-talent', queryParams };
  }
  if (path === '/dashboard/talent/jobs') {
    return { path, page: 'dashboard-talent-jobs', queryParams };
  }
  if (path === '/dashboard/talent/applications') {
    return { path, page: 'dashboard-talent-applications', queryParams };
  }
  if (path === '/admin') {
    return { path, page: 'dashboard-admin', queryParams };
  }
  if (path === '/dashboard/talent/jasa') {
    return { path, page: 'talent-jasa', queryParams };
  }
  if (path === '/dashboard/talent/jasa/buat') {
    return { path, page: 'talent-jasa-buat', queryParams };
  }
  if (path.startsWith('/dashboard/talent/jasa/') && path.endsWith('/edit')) {
    const parts = path.split('/');
    const slug = parts[parts.length - 2];
    return { path, page: 'talent-jasa-edit', slug, queryParams };
  }
  if (path.startsWith('/dashboard/talent/jasa/')) {
    const slug = path.substring('/dashboard/talent/jasa/'.length);
    return { path, page: 'talent-jasa-detail', slug, queryParams };
  }
  if (path === '/dashboard/admin/review-jasa') {
    return { path, page: 'admin-review-jasa', queryParams };
  }
  if (path === '/jadi-talent') {
    return { path, page: 'jadi-talent', queryParams };
  }
  if (path === '/cara-kerja') {
    return { path, page: 'cara-kerja', queryParams };
  }
  if (path === '/keamanan') {
    return { path, page: 'keamanan', queryParams };
  }
  if (path === '/tentang') {
    return { path, page: 'tentang', queryParams };
  }
  if (path === '/bantuan') {
    return { path, page: 'bantuan', queryParams };
  }
  if (path === '/kontak') {
    return { path, page: 'kontak', queryParams };
  }
  if (path === '/checkout') {
    return { path, page: 'checkout', queryParams };
  }
  if (path === '/kebijakan-privasi') {
    return { path, page: 'kebijakan-privasi', queryParams };
  }
  if (path === '/syarat-ketentuan') {
    return { path, page: 'syarat-ketentuan', queryParams };
  }
  if (path.startsWith('/pesanan/')) {
    const slug = path.substring('/pesanan/'.length);
    return { path, page: 'pesanan-tracking', slug, queryParams };
  }

  return { path, page: 'not-found', queryParams };
}

export function useNavigation() {
  const [currentRoute, setCurrentRoute] = useState<RouteInfo>(() => {
    // Read from window.location.pathname on load
    return parseRoute(window.location.pathname + window.location.search);
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(parseRoute(window.location.pathname + window.location.search));
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigate = (toPath: string) => {
    window.history.pushState(null, '', toPath);
    setCurrentRoute(parseRoute(toPath));
    window.scrollTo(0, 0);
  };

  return {
    currentRoute,
    navigate,
  };
}
