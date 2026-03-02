'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PeriodicIncrementFieldsProps {
  currentValue: number;
  maxValue: number;
  incrementAmount: number;
  scheduleTimes: string[];
  onChange: (fields: { currentValue?: number; maxValue?: number; incrementAmount?: number; scheduleTimes?: string[] }) => void;
}

export function PeriodicIncrementFields({
  currentValue,
  maxValue,
  incrementAmount,
  scheduleTimes,
  onChange,
}: PeriodicIncrementFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-2 block">現在値</Label>
          <Input
            type="number"
            value={currentValue}
            onChange={(e) => onChange({ currentValue: Number(e.target.value) })}
            min={0}
            required
          />
        </div>
        <div>
          <Label className="mb-2 block">最大値</Label>
          <Input
            type="number"
            value={maxValue}
            onChange={(e) => onChange({ maxValue: Number(e.target.value) })}
            min={1}
            required
          />
        </div>
      </div>
      <div>
        <Label className="mb-2 block">増加量</Label>
        <Input
          type="number"
          value={incrementAmount}
          onChange={(e) => onChange({ incrementAmount: Number(e.target.value) })}
          min={1}
          required
        />
      </div>
      <div>
        <Label className="mb-2 block">スケジュール時刻（HH:MM、カンマ区切り）</Label>
        <Input
          type="text"
          value={scheduleTimes.join(', ')}
          onChange={(e) =>
            onChange({
              scheduleTimes: e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter((s) => s.length > 0),
            })
          }
          placeholder="09:00, 18:00"
          required
        />
      </div>
    </div>
  );
}
