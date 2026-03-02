'use client';

import type { Timer } from '@/domain/timer/types';
import { TIMER_TYPE_LABELS } from '@/lib/timer-type-labels';
import { TimerStateDisplay } from './timer-state-display';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TimerCardProps {
  timer: Timer;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TimerCard({ timer, onEdit, onDelete }: TimerCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{timer.name}</h3>
            <span className="text-sm text-gray-500">{TIMER_TYPE_LABELS[timer.type]}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => onEdit(timer.id)}>
              編集
            </Button>
            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => onDelete(timer.id)}>
              削除
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <TimerStateDisplay timer={timer} />
      </CardContent>
    </Card>
  );
}
