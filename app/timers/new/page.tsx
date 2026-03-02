'use client';

import dynamic from 'next/dynamic';

const CreateTimerPage = dynamic(
  () => import('@/components/create-timer-page').then(m => m.CreateTimerPage),
  { ssr: false },
);

export default function NewTimerPage() {
  return <CreateTimerPage />;
}
