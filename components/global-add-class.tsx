import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { AddClassModal } from '@/components/add-class-modal';
import { dateKey } from '@/lib/date';

type GlobalAddClassValue = {
  openAddClass: () => void;
  revision: number;
};

const GlobalAddClassContext = createContext<GlobalAddClassValue | null>(null);

export function GlobalAddClassProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [revision, setRevision] = useState(0);
  const value = useMemo(() => ({ openAddClass: () => setVisible(true), revision }), [revision]);

  return (
    <GlobalAddClassContext.Provider value={value}>
      {children}
      <AddClassModal
        visible={visible}
        date={dateKey(new Date())}
        onClose={() => setVisible(false)}
        onAdded={() => setRevision((current) => current + 1)}
      />
    </GlobalAddClassContext.Provider>
  );
}

export function useGlobalAddClass() {
  const value = useContext(GlobalAddClassContext);
  if (!value) throw new Error('useGlobalAddClass must be used within GlobalAddClassProvider');
  return value;
}
