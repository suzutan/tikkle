'use client';

import type { CreateTimerInput } from '@/domain/timer/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StaminaFields } from './stamina-fields';
import { PeriodicIncrementFields } from './periodic-increment-fields';

interface TypeSpecificFieldsProps {
  formData: CreateTimerInput;
  onChange: (data: CreateTimerInput) => void;
}

export function TypeSpecificFields({ formData, onChange }: TypeSpecificFieldsProps) {
  switch (formData.type) {
    case 'countdown':
    case 'countdown-elapsed':
      return (
        <div>
          <Label className="mb-2 block">目標日時</Label>
          <Input
            type="datetime-local"
            value={formData.targetDate.slice(0, 16)}
            onChange={(e) =>
              onChange({ ...formData, targetDate: new Date(e.target.value).toISOString() })
            }
            required
          />
        </div>
      );
    case 'elapsed':
      return (
        <div>
          <Label className="mb-2 block">開始日時</Label>
          <Input
            type="datetime-local"
            value={formData.startDate.slice(0, 16)}
            onChange={(e) =>
              onChange({ ...formData, startDate: new Date(e.target.value).toISOString() })
            }
            required
          />
        </div>
      );
    case 'stamina':
      return (
        <StaminaFields
          currentValue={formData.currentValue}
          maxValue={formData.maxValue}
          recoveryIntervalMinutes={formData.recoveryIntervalMinutes}
          onChange={(fields) => onChange({ ...formData, ...fields })}
        />
      );
    case 'periodic-increment':
      return (
        <PeriodicIncrementFields
          currentValue={formData.currentValue}
          maxValue={formData.maxValue}
          incrementAmount={formData.incrementAmount}
          scheduleTimes={formData.scheduleTimes}
          onChange={(fields) => onChange({ ...formData, ...fields })}
        />
      );
  }
}
