'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTimers } from '@/hooks/use-timers';
import { TimerCard } from './timer-card';
import { DeleteConfirmDialog } from './delete-confirm-dialog';
import { Button } from '@/components/ui/button';

export function TimerList() {
  const router = useRouter();
  const { timers, deleteTimer } = useTimers();
  const [deletingTimerId, setDeletingTimerId] = useState<string | null>(null);

  const timerToDelete = deletingTimerId
    ? timers.find((t) => t.id === deletingTimerId)
    : undefined;

  const handleConfirmDelete = () => {
    if (deletingTimerId) {
      deleteTimer(deletingTimerId);
      setDeletingTimerId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">タイマー一覧</h1>
        <Button asChild>
          <Link href="/timers/new">新規作成</Link>
        </Button>
      </div>

      {timers.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-gray-500">
          <p className="mb-2">タイマーがありません</p>
          <Link href="/timers/new" className="text-blue-600 hover:underline">
            最初のタイマーを作成
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {timers.map((timer) => (
            <TimerCard
              key={timer.id}
              timer={timer}
              onEdit={(id) => router.push(`/timers/${id}/edit`)}
              onDelete={(id) => setDeletingTimerId(id)}
            />
          ))}
        </div>
      )}

      {timerToDelete && (
        <DeleteConfirmDialog
          timerName={timerToDelete.name}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingTimerId(null)}
        />
      )}
    </div>
  );
}
