// src/app/page.tsx
'use client';

import { BninProvider } from '@/context/BninContext';
import BninApp from '@/components/BninApp';
import DebugReset from '@/components/DebugReset';

export default function Home() {
  return (
    <BninProvider>
      <BninApp />
      {process.env.NODE_ENV === 'development' && <DebugReset />}
    </BninProvider>
  );
}