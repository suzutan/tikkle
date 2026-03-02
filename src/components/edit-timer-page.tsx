'use client';

import { useRouter } from 'next/navigation';
import { useTimers } from '@/hooks/use-timers';
import { useTimer } from '@/hooks/use-timer';
import { TimerForm } from './timer-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CreateTimerInput } from '@/domain/timer/types';

export function EditTimerPage({ timerId }: { timerId: string }) {
  const router = useRouter();
  const { updateTimer } = useTimers();
  const timer = useTimer(timerId);

  if (!timer) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center text-gray-500">
        タイマーが見つかりません
      </div>
    );
  }

  const handleSubmit = (input: CreateTimerInput) => {
    updateTimer(timerId, input);
    router.push('/');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">タイマー編集</CardTitle>
      </CardHeader>
      <CardContent>
        <TimerForm
          existingTimer={timer}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/')}
        />
      </CardContent>
    </Card>
  );
}
