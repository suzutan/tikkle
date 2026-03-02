'use client';

import { use } from 'react';
import dynamic from 'next/dynamic';

const EditTimerPage = dynamic(
  () => import('@/components/edit-timer-page').then(m => m.EditTimerPage),
  { ssr: false },
);

export default function EditTimerRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <EditTimerPage timerId={id} />;
}
