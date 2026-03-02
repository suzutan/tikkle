'use client';

import dynamic from 'next/dynamic';

const TimerList = dynamic(() => import('@/components/timer-list').then(m => m.TimerList), {
  ssr: false,
});

export default function HomePage() {
  return <TimerList />;
}
