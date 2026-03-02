'use client';

import { useRouter } from 'next/navigation';
import { useTimers } from '@/hooks/use-timers';
import { TimerForm } from './timer-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CreateTimerInput } from '@/domain/timer/types';

export function CreateTimerPage() {
  const router = useRouter();
  const { createTimer } = useTimers();

  const handleSubmit = (input: CreateTimerInput) => {
    createTimer(input);
    router.push('/');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">タイマー作成</CardTitle>
      </CardHeader>
      <CardContent>
        <TimerForm onSubmit={handleSubmit} onCancel={() => router.push('/')} />
      </CardContent>
    </Card>
  );
}
