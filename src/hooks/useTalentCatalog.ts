import { useEffect, useState } from 'react';
import { getAllTalents, TALENT_CATALOG_UPDATED_EVENT } from '../lib/authSession';
import { Talent } from '../types';

export function useTalentCatalog() {
  const [catalog, setCatalog] = useState<Talent[]>(() => getAllTalents());

  useEffect(() => {
    const syncCatalog = () => setCatalog(getAllTalents());

    window.addEventListener(TALENT_CATALOG_UPDATED_EVENT, syncCatalog);
    window.addEventListener('storage', syncCatalog);

    return () => {
      window.removeEventListener(TALENT_CATALOG_UPDATED_EVENT, syncCatalog);
      window.removeEventListener('storage', syncCatalog);
    };
  }, []);

  return catalog;
}
