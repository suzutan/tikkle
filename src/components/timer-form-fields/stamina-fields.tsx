'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StaminaFieldsProps {
  currentValue: number;
  maxValue: number;
  recoveryIntervalMinutes: number;
  onChange: (fields: { currentValue?: number; maxValue?: number; recoveryIntervalMinutes?: number }) => void;
}

export function StaminaFields({
  currentValue,
  maxValue,
  recoveryIntervalMinutes,
  onChange,
}: StaminaFieldsProps) {
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
        <Label className="mb-2 block">回復間隔（分）</Label>
        <Input
          type="number"
          value={recoveryIntervalMinutes}
          onChange={(e) => onChange({ recoveryIntervalMinutes: Number(e.target.value) })}
          min={1}
          step="any"
          required
        />
      </div>
    </div>
  );
}
