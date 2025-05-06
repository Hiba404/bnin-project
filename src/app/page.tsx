'use client';

import { BninProvider } from '@/context/BninContext';
import BninApp from '@/components/BninApp';

export default function Home() {
  return (
    <BninProvider>
      <BninApp />
    </BninProvider>
  );
}