import { useEffect, useState } from 'react';
import { CUSTOM_SERVICES_UPDATED_EVENT, getCombinedServices } from '../data/mockExtensionData';
import { Service } from '../types';

export function useServiceCatalog() {
  const [catalog, setCatalog] = useState<Service[]>(() => getCombinedServices());

  useEffect(() => {
    const syncCatalog = () => setCatalog(getCombinedServices());

    window.addEventListener(CUSTOM_SERVICES_UPDATED_EVENT, syncCatalog);
    window.addEventListener('storage', syncCatalog);

    return () => {
      window.removeEventListener(CUSTOM_SERVICES_UPDATED_EVENT, syncCatalog);
      window.removeEventListener('storage', syncCatalog);
    };
  }, []);

  return catalog;
}
